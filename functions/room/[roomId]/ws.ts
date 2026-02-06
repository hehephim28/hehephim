/**
 * GET /room/:roomId/ws - WebSocket connection to DOhandled by DO
 */
import type { AppPagesFunction } from '../../lib/types';

export const onRequestGet: AppPagesFunction<'roomId'> = async (ctx) => {
    const roomId = ctx.params.roomId as string;

    if (!roomId) {
        return new Response('Missing roomId', { status: 400 });
    }

    // Forward WebSocket upgrade request to Durable Object
    const doId = ctx.env.ROOMS.idFromName(roomId);
    const stub = ctx.env.ROOMS.get(doId);

    return stub.fetch(`https://do/room/${roomId}/ws`, ctx.request);
};
