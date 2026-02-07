/**
 * GET /api/rooms/[roomId] - Get room info
 * DELETE /api/rooms/[roomId] - Delete a room (owner only)
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
    room_id: string;
    owner_id: string;
    movie_id: string;
    created_at: number;
}

interface UserRow {
    username: string;
}

interface RouteParams {
    params: Promise<{ roomId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { roomId } = await params;

        const room = await env.DB.prepare(
            'SELECT room_id, owner_id, movie_id, created_at FROM rooms WHERE room_id = ?'
        )
            .bind(roomId)
            .first<RoomRow>();

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found', message: 'Phòng không tồn tại' },
                { status: 404 }
            );
        }

        const owner = await env.DB.prepare(
            'SELECT username FROM users WHERE id = ?'
        )
            .bind(room.owner_id)
            .first<UserRow>();

        return NextResponse.json({
            room: {
                roomId: room.room_id,
                ownerId: room.owner_id,
                ownerUsername: owner?.username || 'Unknown',
                movieId: room.movie_id,
                createdAt: room.created_at,
            }
        });
    } catch (error: any) {
        console.error('Get room error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { roomId } = await params;

        // Verify auth
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

        // Check room exists and user is owner
        const room = await env.DB.prepare(
            'SELECT owner_id FROM rooms WHERE room_id = ?'
        )
            .bind(roomId)
            .first<{ owner_id: string }>();

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found', message: 'Phòng không tồn tại' },
                { status: 404 }
            );
        }

        if (room.owner_id !== payload.userId) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Bạn không có quyền xóa phòng này' },
                { status: 403 }
            );
        }

        await env.DB.prepare('DELETE FROM rooms WHERE room_id = ?')
            .bind(roomId)
            .run();

        return NextResponse.json({ success: true, message: 'Đã xóa phòng' });
    } catch (error: any) {
        console.error('Delete room error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}
