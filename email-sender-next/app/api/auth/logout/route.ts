
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST() {
    const response = ApiResponse.success(null, "Logged out successfully");
    return clearAuthCookie(response);
}
