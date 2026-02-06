/**
 * GET /api/rooms/:roomId - Get room info
 */
import type { AppPagesFunction } from '../../lib/types';

interface RoomRow {
    room_id: string;
    owner_id: string;
    movie_id: string;
    created_at: number;
}

export const onRequestGet: AppPagesFunction<'roomId'> = async (ctx) => {
    const roomId = ctx.params.roomId as string;

    if (!roomId) {
        return Response.json(
            { error: 'Missing roomId', message: 'ID phòng là bắt buộc' },
            { status: 400 }
        );
    }

    try {
        const room = await ctx.env.DB.prepare(
            'SELECT room_id, owner_id, movie_id, created_at FROM rooms WHERE room_id = ?'
        )
            .bind(roomId)
            .first<RoomRow>();

        if (!room) {
            return Response.json(
                { error: 'Not found', message: 'Phòng không tồn tại' },
                { status: 404 }
            );
        }

        // Get owner username
        const owner = await ctx.env.DB.prepare(
            'SELECT username FROM users WHERE id = ?'
        )
            .bind(room.owner_id)
            .first<{ username: string }>();

        return Response.json({
            success: true,
            room: {
                roomId: room.room_id,
                ownerId: room.owner_id,
                ownerUsername: owner?.username ?? 'Unknown',
                movieId: room.movie_id,
                createdAt: room.created_at,
            },
        });
    } catch (error: any) {
        console.error('Get room error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
};
