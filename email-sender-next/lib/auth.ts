
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';
const COOKIE_NAME = 'auth_token';

// Types
export interface JWTPayload {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Token Verification
export async function verifyToken(req: NextRequest | null = null) {
    let token;

    if (req) {
        // If request provided (Middleware / specific route check)
        token = req.cookies.get(COOKIE_NAME)?.value;
    } else {
        // Fallback to Server Headers (SC / standard route)
        token = (await cookies()).get(COOKIE_NAME)?.value;
    }

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Token Generation
export function generateToken(payload: Partial<JWTPayload>) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Password Hashing
export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

// Cookie Helper
export async function setAuthCookie(res: NextResponse, token: string) {
    console.log("Setting Auth Cookie path=/", COOKIE_NAME, token ? "TOKEN_PRESENT" : "NO_TOKEN");

    // In dev (http), secure MUST be false. In prod (https), crucial to be true.
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax', // Lax is better for seamless navigation
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return res;
}

export async function clearAuthCookie(res: NextResponse) {
    res.cookies.set({
        name: COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });
    return res;
}
