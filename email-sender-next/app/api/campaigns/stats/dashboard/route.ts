
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';

export async function GET() {
    try {
        await dbConnect();

        const totalCampaigns = await Campaign.countDocuments();

        // Aggregate success and failure counts from all campaigns
        const stats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalSuccess: { $sum: "$successCount" },
                    totalFailure: { $sum: "$failureCount" },
                }
            }
        ]);

        const result = {
            totalCampaigns,
            emails: {
                success: stats[0]?.totalSuccess || 0,
                failure: stats[0]?.totalFailure || 0,
            }
        };

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
