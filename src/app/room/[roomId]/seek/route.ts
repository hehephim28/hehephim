/**
 * POST /room/[roomId]/seek - Host seek control
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

interface RoomRow {
    owner_id: string;
}

interface RouteParams {
    params: Promise<{ roomId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { roomId } = await params;

        // Verify authentication
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

        // Check if user is room owner
        const room = await env.DB.prepare(
            'SELECT owner_id FROM rooms WHERE room_id = ?'
        )
            .bind(roomId)
            .first<RoomRow>();

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found', message: 'Phòng không tồn tại' },
                { status: 404 }
            );
        }

        if (room.owner_id !== payload.userId) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Chỉ chủ phòng mới có thể điều khiển' },
                { status: 403 }
            );
        }

        // Forward to Durable Object
        const doId = env.ROOMS.idFromName(roomId);
        const stub = env.ROOMS.get(doId);

        const body = await request.json().catch(() => ({}));
        const doResponse = await stub.fetch(new Request('https://do/seek', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }));

        const data = await doResponse.json();
        return NextResponse.json(data, { status: doResponse.status });
    } catch (error: any) {
        console.error('Seek error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}
