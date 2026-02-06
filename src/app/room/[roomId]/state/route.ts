/**
 * GET /room/[roomId]/state - Get current playback state
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface RouteParams {
    params: Promise<{ roomId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { roomId } = await params;

        // Forward to Durable Object
        const doId = env.ROOMS.idFromName(roomId);
        const stub = env.ROOMS.get(doId);

        const doResponse = await stub.fetch(new Request('https://do/state', {
            method: 'GET',
        }));

        const data = await doResponse.json();
        return NextResponse.json(data, { status: doResponse.status });
    } catch (error: any) {
        console.error('Get state error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
}
