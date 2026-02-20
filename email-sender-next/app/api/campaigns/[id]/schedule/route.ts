
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Campaign from "@/models/Campaign";
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

        const { scheduledAt } = await req.json();

        if (!scheduledAt) {
            return ApiResponse.error("Scheduled date required", null, 400);
        }

        const campaignId = params.id;
        const campaign = await Campaign.findById(campaignId);

        if (!campaign || campaign.userId !== user.id) {
            return ApiResponse.error("Campaign not found", null, 404);
        }

        campaign.scheduledAt = new Date(scheduledAt);
        // If date is in future, set status to scheduled
        if (campaign.scheduledAt > new Date()) {
            campaign.status = 'scheduled';
        } else {
            // If date is past/now, client should have called send-now ideally, 
            // but we can just leave it as draft or whatever it was.
            // Or maybe we should auto-send? 
            // For safety, let's just set scheduledAt.
        }

        await campaign.save();

        return ApiResponse.success({
            message: "Campaign scheduled",
            scheduledAt: campaign.scheduledAt
        });

    } catch (error: any) {
        return ApiResponse.error("Failed to schedule", error);
    }
}
