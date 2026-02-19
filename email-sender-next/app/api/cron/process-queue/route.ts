
import { NextRequest, NextResponse } from 'next/server';
import { QueueService } from '@/services/queue.service';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow unrestricted access in development if no secret set
            if (process.env.NODE_ENV === 'production' || process.env.CRON_SECRET) {
                return ApiResponse.unauthorized('Invalid Cron Secret');
            }
        }

        const result = await QueueService.processBatch(20);
        return ApiResponse.success(result, 'Queue processed successfully');
    } catch (error: any) {
        return ApiResponse.error('Queue processing failed', error);
    }
}
