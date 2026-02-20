
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailQueue from "@/models/EmailQueue";
import { verifyToken } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const result = await EmailQueue.findOneAndDelete({
            _id: id,
            userId: user.id
        });

        if (!result) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Deleted" });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Delete failed", error: error.message },
            { status: 500 }
        );
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
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();

        const result = await EmailQueue.findOneAndUpdate(
            { _id: id, userId: user.id },
            body,
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Update failed", error: error.message },
            { status: 500 }
        );
    }
}
