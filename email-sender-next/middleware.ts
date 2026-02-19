
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const PROTECTED_ROUTES = ['/dashboard', '/campaigns', '/contacts', '/templates', '/queue', '/groups', '/settings'];
const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Check for Public Routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route) || pathname === '/')) {
        return NextResponse.next();
    }

    // 2. Verify Token (Cookie)
    const user = await verifyToken(req);

    if (pathname.startsWith('/api')) {
        console.log(`[Middleware] ${req.method} ${pathname} - User: ${user ? user.email : 'NULL'}`);
    }

    // 3. Handle Unauthorized Access
    if (!user && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. API Protection
    if (!user && pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized: No valid session' },
            { status: 401 }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
