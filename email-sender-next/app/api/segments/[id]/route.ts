import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Segment from "@/models/Segment";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const result = await Segment.findOneAndDelete({ _id: params.id, userId: user.id });
        if (!result) {
            return ApiResponse.error("Segment not found or unauthorized", null, 404);
        }

        return ApiResponse.success(null, "Segment deleted successfully");
    } catch (error: any) {
        return ApiResponse.error("Delete failed", error);
    }
}
