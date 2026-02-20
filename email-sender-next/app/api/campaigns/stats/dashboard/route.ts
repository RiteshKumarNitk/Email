
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const user = await verifyToken(req);
        if (!user) {
            return ApiResponse.unauthorized();
        }

        const userId = user.id;

        const totalCampaigns = await Campaign.countDocuments({ userId });

        // Aggregate success and failure counts from all campaigns belonging to user
        const stats = await Campaign.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalSuccess: { $sum: "$successCount" },
                    totalFailure: { $sum: "$failureCount" },
                    totalOpens: { $sum: "$openCount" },
                    totalClicks: { $sum: "$clickCount" },
                }
            }
        ]);

        const result = {
            totalCampaigns,
            emails: {
                success: stats[0]?.totalSuccess || 0,
                failure: stats[0]?.totalFailure || 0,
                opens: stats[0]?.totalOpens || 0,
                clicks: stats[0]?.totalClicks || 0,
            }
        };

        return ApiResponse.success(result);
    } catch (error: any) {
        return ApiResponse.error("Failed to fetch dashboard stats", error, 500);
    }
}
