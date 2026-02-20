
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Campaign from "@/models/Campaign";
import CampaignRecipient from "@/models/CampaignRecipient";
import { QueueService } from "@/services/queue.service";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const campaignId = params.id;
        const campaign = await Campaign.findById(campaignId);

        if (!campaign || campaign.userId !== user.id) {
            return ApiResponse.error("Campaign not found", null, 404);
        }

        // 1. Get Pending Recipients
        const recipients = await CampaignRecipient.find({
            campaignId,
            status: "pending"
        });

        if (recipients.length === 0) {
            return ApiResponse.error("No pending recipients found");
        }

        // 2. Queue emails
        // Optimization: Bulk Insert into EmailQueue
        const queueItems = recipients.map(r => ({
            email: r.email
        }));

        await QueueService.addBulk(
            user.id,
            campaign._id,
            queueItems,
            {
                subject: campaign.subject,
                html: campaign.html
                // simple replace logic is inside addBulk
            }
        );

        // 3. Mark Recipients as 'sent' (or 'queued' if we track that)
        // Ideally CampaignRecipient tracks delivery status.
        // For now, mark as 'sent' meaning 'handed to queue'.
        await CampaignRecipient.updateMany(
            { campaignId, status: "pending" },
            { status: "sent", sentAt: new Date() }
        );

        // 4. Update Campaign
        campaign.status = "sending";
        campaign.sentAt = new Date();
        campaign.queueCount += recipients.length;
        await campaign.save();

        return ApiResponse.success({
            message: `Queued ${recipients.length} emails`,
            count: recipients.length
        });

    } catch (error: any) {
        return ApiResponse.error("Failed to send", error);
    }
}
