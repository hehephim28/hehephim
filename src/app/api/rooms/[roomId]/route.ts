/**
 * GET /api/rooms/[roomId] - Get room info
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

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
