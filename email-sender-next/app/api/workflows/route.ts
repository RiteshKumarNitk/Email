
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Workflow from "@/models/Workflow";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const workflows = await Workflow.find({ userId: user.id }).sort({ createdAt: -1 });
        return ApiResponse.success(workflows);
    } catch (error: any) {
        return ApiResponse.error("Failed to fetch workflows", error);
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const body = await req.json();

        // Basic validation
        if (!body.name || !body.trigger || !body.steps) {
            return ApiResponse.error("Missing required fields", null, 400);
        }

        const workflow = await Workflow.create({
            userId: user.id,
            ...body
        });

        return ApiResponse.success(workflow);
    } catch (error: any) {
        return ApiResponse.error("Failed to create workflow", error);
    }
}
