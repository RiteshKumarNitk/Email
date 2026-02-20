
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Segment from "@/models/Segment";
import Contact from "@/models/Contact";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";
// We need Campaign for criteria like 'hasOpened' or aggregate from TrackingEvent?
// Let's stick to Contact fields for now, assuming Contact is updated with behavior
// Or we dynamically query TrackingEvent.
// For V1, let's filter purely on Contact metadata and tags.

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const segments = await Segment.find({ userId: user.id }).sort({ createdAt: -1 });
        return ApiResponse.success(segments);
    } catch (err: any) {
        return ApiResponse.error("Failed to fetch segments", err);
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { name, description, criteria } = await req.json();

        // Calculate count (simplified: just tags for now in Contact, 
        // actually real implementation would require aggregation pipeline with TrackingEvent)
        // Let's assume Contact has 'tags'.
        const query: any = { userId: user.id };
        if (criteria.tags && criteria.tags.length > 0) {
            query.tags = { $in: criteria.tags };
        }

        // If we want behavior-based segments (hasOpened), we need to check TrackingEvent or summarized fields on Contact.
        // I won't do complex aggregation right now to keep it simple and robust.

        const count = await Contact.countDocuments(query);

        const segment = await Segment.create({
            userId: user.id,
            name,
            description,
            criteria,
            contactCount: count,
        });

        return ApiResponse.success(segment);
    } catch (err: any) {
        return ApiResponse.error("Failed to create segment", err);
    }
}
