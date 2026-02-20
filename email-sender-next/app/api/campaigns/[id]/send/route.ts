
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Campaign from "@/models/Campaign";
import Segment from "@/models/Segment";
import Contact from "@/models/Contact";
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

        if (campaign.status === "sending" || campaign.status === "sent") {
            return ApiResponse.error("Campaign already sent or sending", null, 400);
        }

        let contacts: any[] = [];

        // 1. Fetch Recipients based on Segment
        if (campaign.segmentId) {
            const segment = await Segment.findById(campaign.segmentId);
            if (!segment || segment.userId !== user.id) {
                return ApiResponse.error("Segment not found", null, 404);
            }

            // Build query based on criteria
            const query: any = { userId: user.id };
            if (segment.criteria?.tags?.length > 0) {
                query.tags = { $in: segment.criteria.tags };
            }
            // Add other criteria here (e.g. active: true)
            query.active = true;

            contacts = await Contact.find(query).select("email name");
        }
        // 2. Fetch Recipients based on Group (Legacy)
        else if (campaign.groupId) {
            // Assuming groupId refers to a Contact Group which we handle via 'groupId' field
            contacts = await Contact.find({ userId: user.id, groupId: campaign.groupId, active: true }).select("email name");
        }
        // 3. Fallback: all active contacts if no segment/group? OR handle direct recipients list if saved
        // Let's assume segment/group is required for bulk sending for now, or use direct recipients if implemented.
        else {
            // Check if recipients array exists on Campaign (if implemented)
            // For now, require segment or group
            return ApiResponse.error("No target segment or group specified", null, 400);
        }

        if (contacts.length === 0) {
            return ApiResponse.error("No contacts found in selected segment/group", null, 400);
        }

        // 3. Queue Emails (Bulk)
        // Convert mongoose docs to plain objects
        const recipients = contacts.map(c => ({
            email: c.email,
            name: c.name
        }));

        // Insert in batches of 500
        const BATCH_SIZE = 500;
        let successCount = 0;

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);
            await QueueService.addBulk(user.id, campaign._id, batch, {
                subject: campaign.subject,
                html: campaign.html
            });
            successCount += batch.length;
        }

        // 4. Update Campaign Status
        campaign.status = "sending"; // or "queued"
        campaign.totalRecipients = successCount;
        campaign.queueCount = successCount;
        campaign.sentAt = new Date(); // Start time
        await campaign.save();

        return ApiResponse.success({
            message: `Campaign queued for ${successCount} recipients`,
            campaignId: campaign._id,
            count: successCount
        });

    } catch (error: any) {
        return ApiResponse.error("Failed to send campaign", error);
    }
}
