/**
 * GET/POST /room/[roomId]/chat - Chat messages for watch party
 */
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface RouteParams {
    params: Promise<{ roomId: string }>;
}

interface ChatMessage {
    type: 'CHAT';
    user: string;
    text: string;
    ts: number;
}

// GET - Fetch recent chat messages
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { roomId } = await params;

        // Forward to Durable Object
        const doId = env.ROOMS.idFromName(roomId);
        const stub = env.ROOMS.get(doId);

        const doResponse = await stub.fetch(new Request('https://do/chat', {
            method: 'GET',
        }));

        const data = await doResponse.json();
        return NextResponse.json(data, { status: doResponse.status });
    } catch (error: any) {
        console.error('Get chat error:', error);
        return NextResponse.json(
            { messages: [] },
            { status: 200 }
        );
    }
}

// POST - Send a chat message
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { env } = getRequestContext();
        const { roomId } = await params;
        const body = await request.json() as { user?: string; text?: string };

        if (!body.text || body.text.trim() === '') {
            return NextResponse.json(
                { error: 'Empty message' },
                { status: 400 }
            );
        }

        // Forward to Durable Object
        const doId = env.ROOMS.idFromName(roomId);
        const stub = env.ROOMS.get(doId);

        const doResponse = await stub.fetch(new Request('https://do/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: body.user ?? 'Ẩn danh',
                text: body.text.slice(0, 500),
            }),
        }));

        const data = await doResponse.json();
        return NextResponse.json(data, { status: doResponse.status });
    } catch (error: any) {
        console.error('Send chat error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
