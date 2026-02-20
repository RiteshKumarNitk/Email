
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailQueue from "@/models/EmailQueue";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "append";

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "File required" }, { status: 400 });
        }

        // Convert file to buffer and stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const results: any[] = [];

        await new Promise((resolve, reject) => {
            stream
                .pipe(csvParser())
                .on("data", (data) => results.push(data))
                .on("end", resolve)
                .on("error", reject);
        });

        if (results.length === 0) {
            return NextResponse.json({ message: "Empty CSV" }, { status: 400 });
        }

        // Validate and format
        const newItems = results.map(row => ({
            userId: user.id,
            email: row.email || row.Email,
            subject: row.subject || row.Subject || "(No Subject)",
            html: row.html || row.Body || row.body || "",
            status: "queued"
        })).filter(item => item.email); // filter out empty rows

        if (mode === "replace") {
            await EmailQueue.deleteMany({ userId: user.id, status: "queued" });
        }

        if (newItems.length > 0) {
            await EmailQueue.insertMany(newItems);
        }

        return NextResponse.json({ message: `Imported ${newItems.length} items` });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: "Upload failed", error: error.message },
            { status: 500 }
        );
    }
}
