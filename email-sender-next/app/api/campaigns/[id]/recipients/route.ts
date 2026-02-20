
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Campaign from "@/models/Campaign";
import CampaignRecipient from "@/models/CampaignRecipient"; // Assuming this model exists or needs creation
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

        const { emails, cc, bcc } = await req.json();

        // Basic implementation: just log or save to a recipients collection
        // Existing code suggests a CampaignRecipient model might be used or anticipated.
        // For now, let's just update Campaign's internal stats or assume queue will handle it.
        // But send-now needs these emails.
        // Let's save them to CampaignRecipient if it exists, or just return success if we pass them to send-now directly (but send-now takes no body in frontend call).

        // Strategy: Create CampaignRecipient for each.
        // I need to check if CampaignRecipient model exists.
        // If not, I'll create a simple one.

        // For now, I'll create the file but if Model is likely missing, I should check.
        // I saw "CampaignRecipient" imported in "convert-to-campaign/route.ts" earlier!

        /* 
        import CampaignRecipient from "@/models/CampaignRecipient"; 
        */

        if (emails && Array.isArray(emails) && emails.length > 0) {
            const recipients = emails.map(email => ({
                campaignId: params.id,
                email: email.toLowerCase().trim(),
                status: 'pending'
            }));

            try {
                // Use ordered: false to skip duplicates without failing batch
                await CampaignRecipient.insertMany(recipients, { ordered: false });
            } catch (e: any) {
                // Ignore E11000 duplicate key error
                if (e.code !== 11000 && !e.writeErrors) throw e;
            }

            // count
            const count = await CampaignRecipient.countDocuments({ campaignId: params.id });
            await Campaign.updateOne({ _id: params.id }, { totalRecipients: count });
        }

        return ApiResponse.success({ message: "Recipients added" });

    } catch (error: any) {
        return ApiResponse.error("Failed", error);
    }
}
