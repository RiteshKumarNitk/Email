
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/validation/auth.schema";
import { AuthService } from "@/services/auth.service";
import { ApiResponse } from "@/lib/api-response";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validate Input
        const validatedData = loginSchema.parse(body);

        // 2. Call Service
        const { token, user } = await AuthService.login(validatedData);

        // 3. Set Cookie & Respond
        const response = ApiResponse.success({ user, token }, "Login successful");
        console.log("Login Success, Setting Cookie for user:", user.email);
        await setAuthCookie(response, token);

        return response;
    } catch (error: any) {
        return ApiResponse.error("Login failed", error);
    }
}
