
import { NextRequest, NextResponse } from "next/server";
import Campaign from "@/models/Campaign";
import TrackingEvent from "@/models/TrackingEvent";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const c = searchParams.get("c"); // campaignId
    const e = searchParams.get("e"); // email
    const u = searchParams.get("u"); // target url

    if (!u) {
        return NextResponse.redirect(`${req.nextUrl.origin}/404`);
    }

    try {
        if (c && e) {
            await dbConnect();

            // Log Click
            await TrackingEvent.create({
                campaignId: c,
                recipient: e,
                type: "click",
                url: u,
                ip: req.headers.get("x-forwarded-for") || "unknown",
                userAgent: req.headers.get("user-agent"),
            });

            // Increment Campaign Counter
            await Campaign.findByIdAndUpdate(c, { $inc: { clickCount: 1 } });
        }
    } catch (err) {
        console.error("Click tracking error:", err);
    }

    return NextResponse.redirect(u);
}
