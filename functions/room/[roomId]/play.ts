/**
 * POST /room/:roomId/play - Host play control
 * Only room owner can control playback
 */
import type { AppPagesFunction } from '../../lib/types';
import { requireAuth } from '../../lib/auth';

interface RoomRow {
    owner_id: string;
}

export const onRequestPost: AppPagesFunction<'roomId'> = async (ctx) => {
    const result = await requireAuth(ctx.request, ctx.env);

    if ('error' in result) {
        return result.error;
    }

    const roomId = ctx.params.roomId as string;

    if (!roomId) {
        return Response.json({ error: 'Missing roomId' }, { status: 400 });
    }

    // Check if user is room owner
    const room = await ctx.env.DB.prepare(
        'SELECT owner_id FROM rooms WHERE room_id = ?'
    )
        .bind(roomId)
        .first<RoomRow>();

    if (!room) {
        return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.owner_id !== result.user.id) {
        return Response.json(
            { error: 'Forbidden', message: 'Chỉ chủ phòng mới có thể điều khiển' },
            { status: 403 }
        );
    }

    // Forward to DO
    const doId = ctx.env.ROOMS.idFromName(roomId);
    const stub = ctx.env.ROOMS.get(doId);

    return stub.fetch(`https://do/room/${roomId}/play`, {
        method: 'POST',
        headers: ctx.request.headers,
        body: ctx.request.body,
    });
};
