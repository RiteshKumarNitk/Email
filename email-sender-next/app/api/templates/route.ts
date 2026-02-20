
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Template from '@/models/Template';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const templates = await Template.find({ createdBy: user.id }).sort({ createdAt: -1 });
        return ApiResponse.success(templates);
    } catch (error: any) {
        return ApiResponse.error("Fetch failed", error);
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { name, subject, html, category, design } = await req.json();

        if (!name || !subject || !html) {
            return ApiResponse.error("Missing required fields", null, 400);
        }

        const template = await Template.create({
            name,
            subject,
            html,
            category,
            design,
            createdBy: user.id
        });

        return ApiResponse.success(template, "Template created", 201);
    } catch (error: any) {
        return ApiResponse.error("Creation failed", error);
    }
}
