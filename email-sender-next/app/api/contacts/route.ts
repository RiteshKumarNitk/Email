
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { name, email, groupId } = await req.json();

        if (!name || !email) {
            return ApiResponse.error('Name and email are required', null, 400);
        }

        const contact = await Contact.create({
            userId: user.id, // Ensure contact is owned by user
            name,
            email,
            groupId
        });

        return ApiResponse.success(contact, "Contact created", 201);
    } catch (error: any) {
        if (error.code === 11000) {
            return ApiResponse.error('Contact with this email already exists', null, 400);
        }
        return ApiResponse.error('Create failed', error, 500);
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        // 🛡️ Filter by User ID
        const contacts = await Contact.find({ userId: user.id }).sort({ createdAt: -1 });

        // If no contacts found, check schema if userId field even exists
        // If it doesn't, this query might return empty until schema is migrated.
        // For new contacts it is fine.

        return ApiResponse.success(contacts);
    } catch (error: any) {
        return ApiResponse.error("Fetch failed", error, 500);
    }
}
