import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Contact from "@/models/Contact";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { ids, groupId } = await req.json();

        if (!ids || !Array.isArray(ids) || !groupId) {
            return ApiResponse.error("Invalid data", null, 400);
        }

        await Contact.updateMany(
            { _id: { $in: ids }, userId: user.id },
            { $set: { groupId: groupId } }
        );

        return ApiResponse.success(null, "Contacts moved to group");
    } catch (error: any) {
        return ApiResponse.error("Bulk update failed", error);
    }
}
