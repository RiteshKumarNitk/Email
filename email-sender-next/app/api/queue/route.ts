
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailQueue from '@/models/EmailQueue';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { email, subject, html, campaignId } = await req.json();

        if (!email || !subject || !html) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const queueItem = await EmailQueue.create({
            userId: user.id,
            email,
            subject,
            html,
            campaignId,
            status: 'queued',
            queuedAt: new Date(),
        });

        return NextResponse.json(queueItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Fetch based on userId
        const queue = await EmailQueue.find({ userId: user.id }).sort({ createdAt: -1 });
        return NextResponse.json(queue);
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
