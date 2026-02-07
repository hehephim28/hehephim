/**
 * GET /api/rooms - List user's rooms
 * POST /api/rooms - Create a new watch party room
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

function generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    for (let i = 0; i < 8; i++) {
        result += chars[array[i] % chars.length];
    }
    return result;
}

interface CreateRoomBody {
    movieId: string;
    roomName?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();

        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/auth_token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated', message: 'Bạn cần đăng nhập để tạo phòng xem chung' },
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

        const body = await request.json() as CreateRoomBody;
        const { movieId, roomName } = body;

        if (!movieId) {
            return NextResponse.json(
                { error: 'Missing movieId', message: 'Thiếu thông tin phim' },
                { status: 400 }
            );
        }

        // Check room limit (max 10 rooms per user)
        const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM rooms WHERE owner_id = ?'
        )
            .bind(payload.userId)
            .first<{ count: number }>();

        if (countResult && countResult.count >= 10) {
            return NextResponse.json(
                { error: 'Room limit reached', message: 'Bạn đã tạo tối đa 10 phòng. Vui lòng xóa phòng cũ để tạo phòng mới.' },
                { status: 400 }
            );
        }

        const roomId = generateRoomId();
        const createdAt = Date.now();
        const finalRoomName = roomName?.trim() || `Phòng xem ${movieId}`;

        await env.DB.prepare(
            'INSERT INTO rooms (room_id, owner_id, movie_id, room_name, created_at) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(roomId, payload.userId, movieId, finalRoomName, createdAt)
            .run();

        return NextResponse.json({
            success: true,
            roomId,
            message: 'Đã tạo phòng xem chung'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create room error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi khi tạo phòng' },
            { status: 500 }
        );
    }
}

interface RoomRow {
    room_id: string;
    movie_id: string;
    room_name: string | null;
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
            'SELECT room_id, movie_id, room_name, created_at FROM rooms WHERE owner_id = ? ORDER BY created_at DESC LIMIT 20'
        )
            .bind(payload.userId)
            .all<RoomRow>();

        const rooms = (results || []).map((row: RoomRow) => ({
            roomId: row.room_id,
            movieId: row.movie_id,
            roomName: row.room_name || `Phòng xem ${row.movie_id}`,
            createdAt: row.created_at
        }));

        return NextResponse.json({ rooms });
    } catch (error: any) {
        console.error('Get rooms error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}
