import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const response = NextResponse.next();

    // Content Security Policy headers
    // Note: 'unsafe-eval' is required for Leaflet and some other mapping libraries
    // that use eval() internally for certain operations
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://apis.google.com https://*.gstatic.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: https: blob:;
        font-src 'self' https://fonts.gstatic.com https://*.gstatic.com;
        connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org https://*.gstatic.com https://apis.google.com;
        frame-src 'self' https://vercel.live https://*.firebaseapp.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

// Configure which routes use this proxy
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
