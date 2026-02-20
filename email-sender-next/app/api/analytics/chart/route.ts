
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TrackingEvent from "@/models/TrackingEvent";
import Campaign from "@/models/Campaign";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        // Get opens/clicks for last 7 days from TrackingEvent
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // We need campaign IDs belonging to this user first
        const campaigns = await Campaign.find({ userId: user.id }).select("_id");
        const campaignIds = campaigns.map(c => c._id.toString());

        const events = await TrackingEvent.aggregate([
            {
                $match: {
                    campaignId: { $in: campaignIds },
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        type: "$type"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        // Transform into chart friendly format
        const chartData: Record<string, any> = {};

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            chartData[dateStr] = { date: dateStr, opens: 0, clicks: 0 };
        }

        events.forEach((e: any) => {
            const date = e._id.date;
            const type = e._id.type;
            if (chartData[date]) {
                if (type === "open") chartData[date].opens = e.count;
                if (type === "click") chartData[date].clicks = e.count;
            }
        });

        // Convert to array
        const result = Object.values(chartData);

        return ApiResponse.success(result);

    } catch (err: any) {
        return ApiResponse.error("Failed to fetch analytics", err);
    }
}
