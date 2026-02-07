/**
 * GET /api/favorites - List user favorites
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

async function verifyJWT(token: string, secret: string): Promise<any> {
    try {
        const [headerB64, payloadB64, signatureB64] = token.split('.');
        if (!headerB64 || !payloadB64 || !signatureB64) return null;

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureBytes = Uint8Array.from(
            atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
            c => c.charCodeAt(0)
        );

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            encoder.encode(`${headerB64}.${payloadB64}`)
        );

        if (!isValid) return null;

        const payload = JSON.parse(atob(payloadB64));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

interface FavoriteRow {
    movie_id: string;
    created_at: number;
}

export async function GET(request: NextRequest) {
    try {
        const { env } = getRequestContext();

        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/auth_token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated', message: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Invalid token', message: 'Phiên đăng nhập không hợp lệ' },
                { status: 401 }
            );
        }

        const { results } = await env.DB.prepare(
            'SELECT movie_id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
        )
            .bind(payload.userId)
            .all<FavoriteRow>();

        // Map to expected format for frontend
        const favorites = (results || []).map((row: FavoriteRow) => ({
            movieId: row.movie_id,
            createdAt: row.created_at
        }));

        return NextResponse.json({ favorites });
    } catch (error: any) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}
