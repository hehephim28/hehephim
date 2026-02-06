/**
 * POST /api/rooms - Create a new watch party room
 */
import type { AppPagesFunction } from '../../lib/types';
import { requireAuth, generateRoomId } from '../../lib/auth';

interface CreateRoomBody {
    movieId: string;
    title?: string;
}

export const onRequestPost: AppPagesFunction = async (ctx) => {
    const result = await requireAuth(ctx.request, ctx.env);

    if ('error' in result) {
        return result.error;
    }

    try {
        const body = await ctx.request.json() as CreateRoomBody;
        const { movieId } = body;

        if (!movieId) {
            return Response.json(
                { error: 'Missing movieId', message: 'ID phim là bắt buộc' },
                { status: 400 }
            );
        }

        // Generate room ID
        const roomId = generateRoomId();
        const createdAt = Date.now();

        // Save room to D1
        await ctx.env.DB.prepare(
            'INSERT INTO rooms (room_id, owner_id, movie_id, created_at) VALUES (?, ?, ?, ?)'
        )
            .bind(roomId, result.user.id, movieId, createdAt)
            .run();

        // Initialize DO state
        const doId = ctx.env.ROOMS.idFromName(roomId);
        const stub = ctx.env.ROOMS.get(doId);

        await stub.fetch('https://do/room/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                movieId,
                ownerId: result.user.id,
            }),
        });

        // Build share URL
        const url = new URL(ctx.request.url);
        const shareUrl = `${url.protocol}//${url.host}/room/${roomId}`;

        return Response.json({
            success: true,
            roomId,
            shareUrl,
            movieId,
        });
    } catch (error: any) {
        console.error('Create room error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
};
