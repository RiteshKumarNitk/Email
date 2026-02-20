
import dbConnect from '@/lib/db';
import EmailQueue, { IEmailQueue } from '@/models/EmailQueue';
import User from '@/models/User';
import { createTransporter, sendEmail } from '@/lib/email';
import { ApiResponse } from '@/lib/api-response';
import { injectTracking } from '@/lib/tracking';

export class QueueService {
    static async add(userId: string, campaignId: string, recipient: string, options: { subject: string; html: string }) {
        await dbConnect();
        return await EmailQueue.create({
            userId,
            campaignId,
            email: recipient,
            subject: options.subject,
            html: options.html,
            status: 'queued',
            queuedAt: new Date(),
        });
    }

    static async addBulk(userId: string, campaignId: string, recipients: { email: string; name?: string }[], options: { subject: string; html: string }) {
        await dbConnect();
        const docs = recipients.map(r => ({
            userId,
            campaignId,
            email: r.email,
            subject: options.subject,
            html: options.html.replace(/{{name}}/g, r.name || "Friend"), // Basic personalization here for speed
            status: 'queued',
            queuedAt: new Date(),
        }));

        return await EmailQueue.insertMany(docs);
    }

    static async processBatch(limit: number = 20) {
        await dbConnect();

        // 1. Find Pending Jobs (queued or failed < 3 retries)
        const jobs = await EmailQueue.find({
            status: { $in: ['queued', 'failed'] },
            retryCount: { $lt: 3 },
        })
            .sort({ queuedAt: 1 })
            .limit(limit);

        if (jobs.length === 0) return { processed: 0, failed: 0 };

        let processed = 0;
        let failedCount = 0;

        // 2. Process Jobs
        for (const job of jobs) {
            try {
                // Mark as Processing
                job.status = 'processing';
                await job.save();

                // Get User SMTP Config
                const user = await User.findById(job.userId);
                if (!user || !user.smtpConfigs || user.smtpConfigs.length === 0) {
                    throw new Error('User SMTP configuration missing');
                }

                // Rotation: Pick one with lowest usage count? Or Round Robin?
                // Let's sort by usageCount to balance load.
                const configs = user.smtpConfigs.sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0));
                const config = configs[0];

                // Send Email
                const transporter = createTransporter({
                    host: config.host,
                    port: config.port,
                    secure: config.secure,
                    user: config.user,
                    pass: config.pass,
                });

                // Increment Usage
                await User.updateOne(
                    { _id: user._id, "smtpConfigs._id": config._id },
                    { $inc: { "smtpConfigs.$.usageCount": 1 } }
                );

                // Inject Tracking
                const trackedHtml = injectTracking(
                    job.html || '<p>Empty Body</p>',
                    job.campaignId,
                    job.email
                );

                await sendEmail(transporter, {
                    from: config.fromEmail ? `"${user.name}" <${config.fromEmail}>` : `"${user.name}" <${config.user}>`,
                    to: job.email,
                    subject: job.subject || 'No Subject',
                    html: trackedHtml,
                });

                // Mark as Sent
                job.status = 'sent';
                job.sentAt = new Date();
                await job.save();
                processed++;

            } catch (error: any) {
                console.error(`Failed to process job ${job._id}:`, error);

                // Mark as Failed
                job.status = 'failed';
                job.failedAt = new Date();
                job.lastError = error.message;
                job.retryCount += 1;
                await job.save();
                failedCount++;
            }
        }

        return { processed, failed: failedCount };
    }
}
