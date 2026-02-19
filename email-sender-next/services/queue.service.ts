
import dbConnect from '@/lib/db';
import EmailQueue, { IEmailQueue } from '@/models/EmailQueue';
import User from '@/models/User';
import { createTransporter, sendEmail } from '@/lib/email';
import { ApiResponse } from '@/lib/api-response';

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
                if (!user || !user.smtp) {
                    throw new Error('User SMTP configuration missing');
                }

                // Send Email
                const transporter = createTransporter({
                    host: user.smtp.host,
                    port: user.smtp.port,
                    secure: user.smtp.secure,
                    user: user.smtp.user,
                    pass: user.smtp.pass,
                });

                await sendEmail(transporter, {
                    from: `"${user.name}" <${user.smtp.user}>`,
                    to: job.email,
                    subject: job.subject || 'No Subject',
                    html: job.html || '<p>Empty Body</p>',
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
