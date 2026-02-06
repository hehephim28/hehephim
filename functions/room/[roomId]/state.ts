/**
 * GET /room/:roomId/state - Get current playback state
 */
import type { AppPagesFunction } from '../../lib/types';

export const onRequestGet: AppPagesFunction<'roomId'> = async (ctx) => {
    const roomId = ctx.params.roomId as string;

    if (!roomId) {
        return Response.json({ error: 'Missing roomId' }, { status: 400 });
    }

    const doId = ctx.env.ROOMS.idFromName(roomId);
    const stub = ctx.env.ROOMS.get(doId);

    return stub.fetch(`https://do/room/${roomId}/state`, ctx.request);
};
