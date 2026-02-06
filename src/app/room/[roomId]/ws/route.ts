/**
 * GET /room/[roomId]/ws - WebSocket upgrade for watch party
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface RouteParams {
    params: Promise<{ roomId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return NextResponse.json(
                { error: 'Expected Upgrade: websocket' },
                { status: 426 }
            );
        }

        const { env } = getRequestContext();
        const { roomId } = await params;

        // Forward to Durable Object for WebSocket handling
        const doId = env.ROOMS.idFromName(roomId);
        const stub = env.ROOMS.get(doId);

        // Forward the request to Durable Object
        return stub.fetch(request);
    } catch (error: any) {
        console.error('WebSocket error:', error);
        return NextResponse.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi kết nối' },
            { status: 500 }
        );
    }
}
