/**
 * POST/DELETE /api/favorites/[movieId] - Add/remove favorite
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

async function requireAuth(request: NextRequest, env: any): Promise<{ userId: string } | NextResponse> {
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

    return { userId: payload.userId };
}

interface RouteParams {
    params: Promise<{ movieId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { movieId } = await params;

        const authResult = await requireAuth(request, env);
        if (authResult instanceof NextResponse) return authResult;
        const { userId } = authResult;

        // Check if already favorited
        const existing = await env.DB.prepare(
            'SELECT 1 FROM favorites WHERE user_id = ? AND movie_id = ?'
        )
            .bind(userId, movieId)
            .first();

        if (existing) {
            return NextResponse.json(
                { error: 'Already favorited', message: 'Phim đã có trong danh sách yêu thích' },
                { status: 409 }
            );
        }

        await env.DB.prepare(
            'INSERT INTO favorites (user_id, movie_id, created_at) VALUES (?, ?, ?)'
        )
            .bind(userId, movieId, Date.now())
            .run();

        return NextResponse.json({ success: true, message: 'Đã thêm vào yêu thích' }, { status: 201 });
    } catch (error: any) {
        console.error('Add favorite error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { movieId } = await params;

        const authResult = await requireAuth(request, env);
        if (authResult instanceof NextResponse) return authResult;
        const { userId } = authResult;

        await env.DB.prepare(
            'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?'
        )
            .bind(userId, movieId)
            .run();

        return NextResponse.json({ success: true, message: 'Đã xóa khỏi yêu thích' });
    } catch (error: any) {
        console.error('Remove favorite error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}
