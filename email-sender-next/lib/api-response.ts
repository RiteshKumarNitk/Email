
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ApiResponseCtor<T> = {
    success: boolean;
    message?: string;
    data?: T;
    error?: any;
    status: number;
};

export class ApiResponse {
    static success<T>(data: T, message = 'Success', status = 200) {
        return NextResponse.json(
            { success: true, message, data },
            { status }
        );
    }

    static error(message: string, error: any = null, status = 400) {
        // Handle Zod Errors specifically
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation Error',
                    errors: error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Handle generic errors
        return NextResponse.json(
            {
                success: false,
                message,
                error: error?.message || error,
            },
            { status }
        );
    }

    static unauthorized(message = 'Unauthorized') {
        return ApiResponse.error(message, null, 401);
    }

    static notFound(message = 'Resource not found') {
        return ApiResponse.error(message, null, 404);
    }
}
