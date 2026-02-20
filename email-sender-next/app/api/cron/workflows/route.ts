
import { NextRequest, NextResponse } from "next/server";
import { WorkflowEngine } from "@/services/workflow.service";

// This route can be called by a cron job service (e.g. Vercel Cron, EasyCron, or a simple interval loop)
// GET /api/cron/workflows?secret=...

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Secure this endpoint! e.g. check env.CRON_SECRET
    // For now, allow local dev
    // if (secret !== process.env.CRON_SECRET) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    try {
        const result = await WorkflowEngine.processDueEnrollments(50);
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
