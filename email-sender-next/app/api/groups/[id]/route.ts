
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Contact from "@/models/Contact"; // Assuming contact model exists
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { id } = await params;
        const { name } = await req.json();

        // Ensure user owns the group
        const group = await Group.findOne({ _id: id, userId: user.id });
        if (!group) return ApiResponse.notFound("Group not found");

        if (name) group.name = name;
        await group.save();

        return ApiResponse.success(group);
    } catch (error: any) {
        return ApiResponse.error("Update failed", error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { id } = await params;
        const result = await Group.deleteOne({ _id: id, userId: user.id });

        if (result.deletedCount === 0) return ApiResponse.notFound("Group not found");

        return ApiResponse.success(null, "Group deleted");
    } catch (error: any) {
        return ApiResponse.error("Delete failed", error);
    }
}
