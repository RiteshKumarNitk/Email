
import { NextRequest, NextResponse } from "next/server";
import Campaign from "@/models/Campaign";
import TrackingEvent from "@/models/TrackingEvent";
import dbConnect from "@/lib/db";

// 1x1 Transparent GIF
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const c = searchParams.get("c"); // campaignId
        const e = searchParams.get("e"); // email

        if (c && e) {
            await dbConnect();

            // Log Open
            await TrackingEvent.create({
                campaignId: c,
                recipient: e,
                type: "open",
                ip: req.headers.get("x-forwarded-for") || "unknown",
                userAgent: req.headers.get("user-agent"),
            });

            // Increment Campaign Counter
            await Campaign.findByIdAndUpdate(c, { $inc: { openCount: 1 } });
        }
    } catch (err) {
        console.error("Tracking error:", err);
    }

    return new NextResponse(PIXEL, {
        headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
}
