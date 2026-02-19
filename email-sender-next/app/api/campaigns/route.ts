
import { NextRequest, NextResponse } from "next/server";
import { CampaignService } from "@/services/campaign.service";
import { ApiResponse } from "@/lib/api-response";
import { verifyToken } from "@/lib/auth";
import { CreateCampaignSchema } from "@/validation/campaign.schema";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const { searchParams } = new URL(req.url);
        const query = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            search: searchParams.get('search') || undefined
        };

        const result = await CampaignService.list(user.id, query);
        return ApiResponse.success(result, "Campaigns fetched successfully");
    } catch (error: any) {
        return ApiResponse.error("Failed to fetch campaigns", error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyToken(req);
        if (!user) return ApiResponse.unauthorized();

        const body = await req.json();
        const validatedData = CreateCampaignSchema.parse(body);

        const campaign = await CampaignService.create(user.id, validatedData);
        return ApiResponse.success(campaign, "Campaign created successfully", 201);
    } catch (error: any) {
        return ApiResponse.error("Failed to create campaign", error);
    }
}
