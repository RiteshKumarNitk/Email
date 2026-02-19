
import dbConnect from '@/lib/db';
import Campaign, { ICampaign } from '@/models/Campaign';
import { CreateCampaignSchema, CampaignQuerySchema } from '@/validation/campaign.schema';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api-response';

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type CampaignQuery = z.infer<typeof CampaignQuerySchema>;

export class CampaignService {
    static async create(userId: string, data: CreateCampaignInput) {
        await dbConnect();
        const validated = CreateCampaignSchema.parse(data);

        const campaign = await Campaign.create({
            userId,
            ...validated,
            status: 'DRAFT', // Or 'QUEUED' if sending immediately
        });

        if (validated.scheduledAt) {
            // Implement Queue Job Generation here
            // await queue.add(campaign._id, validated.scheduledAt);
            console.log('Sending to queue...', campaign._id);
        }

        return campaign;
    }

    static async list(userId: string, query: CampaignQuery) {
        await dbConnect();
        const { page, limit, search } = CampaignQuerySchema.parse(query);
        const skip = (page - 1) * limit;

        const filter: any = { userId };
        if (search) {
            filter.subject = { $regex: search, $options: 'i' };
        }

        const campaigns = await Campaign.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Campaign.countDocuments(filter);

        return {
            campaigns,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    static async getById(userId: string, campaignId: string) {
        await dbConnect();
        const campaign = await Campaign.findOne({ _id: campaignId, userId });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        return campaign;
    }
}
