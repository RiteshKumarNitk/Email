
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailQueue from "@/models/EmailQueue";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: "No ids provided" }, { status: 400 });
        }

        const result = await EmailQueue.deleteMany({
            _id: { $in: ids },
            userId: user.id
        });

        return NextResponse.json({ message: "Deleted", count: result.deletedCount });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Delete failed", error: error.message },
            { status: 500 }
        );
    }
}
