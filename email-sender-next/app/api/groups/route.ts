
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const groups = await Group.find({ userId: user.id }).populate("contacts");
        return ApiResponse.success(groups);
    } catch (error: any) {
        return ApiResponse.error("Fetch failed", error, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { name } = await req.json();

        if (!name) {
            return ApiResponse.error("Name required", null, 400);
        }

        const group = await Group.create({
            userId: user.id,
            name,
            contacts: [], // initially empty
        });

        return ApiResponse.success(group, "Group created", 201);
    } catch (error: any) {
        return ApiResponse.error("Create failed", error, 500);
    }
}
