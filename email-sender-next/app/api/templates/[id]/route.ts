
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Template from "@/models/Template";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const template = await Template.findOne({ _id: params.id, createdBy: user.id });
        if (!template) {
            return ApiResponse.error("Template not found", null, 404);
        }

        return ApiResponse.success(template);
    } catch (error: any) {
        return ApiResponse.error("Fetch failed", error);
    }
}


export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const updateData = await req.json();

        const template = await Template.findOneAndUpdate(
            { _id: params.id, createdBy: user.id },
            updateData,
            { new: true }
        );

        if (!template) {
            return ApiResponse.error("Template not found", null, 404);
        }

        return ApiResponse.success(template);
    } catch (error: any) {
        return ApiResponse.error("Update failed", error);
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const result = await Template.findOneAndDelete({ _id: params.id, createdBy: user.id });
        if (!result) {
            return ApiResponse.error("Template not found or unauthorized", null, 404);
        }

        return ApiResponse.success(null, "Template deleted");
    } catch (error: any) {
        return ApiResponse.error("Delete failed", error);
    }
}

