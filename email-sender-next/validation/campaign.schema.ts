
import { z } from 'zod';

export const CreateCampaignSchema = z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    body: z.string().min(10, 'Body must be specified and non-empty'),
    senderName: z.string().optional(),
    senderEmail: z.string().email().optional(),
    scheduledAt: z.string().datetime().optional(), // ISO string

    recipients: z.array(z.string().email()).optional(),
    segmentId: z.string().optional(),
    groupId: z.string().optional(),
});

export const CampaignQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    search: z.string().optional(),
});
