/**
 * RoomDO - Durable Object for Watch Party Rooms
 * Handles WebSocket connections and real-time sync
 */

interface RoomState {
    movieId: string | null;
    position: number;
    isPlaying: boolean;
    updatedAt: number;
    ownerId?: string;
}

interface ChatMessage {
    type: 'CHAT';
    user: string;
    text: string;
    ts: number;
}

interface StateMessage {
    type: 'STATE';
    movieId: string | null;
    isPlaying: boolean;
    serverTime: number;
}

interface ControlMessage {
    type: 'PLAY' | 'PAUSE' | 'SEEK';
    time: number;
    movieId?: string;
}

type BroadcastMessage = ChatMessage | StateMessage | ControlMessage;

export class RoomDO {
    state: DurableObjectState;
    sockets: Set<WebSocket>;

    constructor(state: DurableObjectState) {
        this.state = state;
        this.sockets = new Set();
    }

    /**
     * Get current room state with calculated serverTime
     */
    private async getRoom(): Promise<{ room: RoomState; serverTime: number }> {
        const room = (await this.state.storage.get<RoomState>('room')) ?? {
            movieId: null,
            position: 0,
            isPlaying: false,
            updatedAt: Date.now(),
        };

        const now = Date.now();
        // If playing, calculate elapsed time since last update
        const serverTime = room.isPlaying
            ? room.position + (now - room.updatedAt) / 1000
            : room.position;

        return { room, serverTime };
    }

    /**
     * Broadcast message to all connected clients
     */
    private broadcast(obj: BroadcastMessage): void {
        const msg = JSON.stringify(obj);
        for (const ws of this.sockets) {
            try {
                ws.send(msg);
            } catch {
                // Socket might be closed, will be cleaned up on close event
            }
        }
    }

    /**
     * Handle incoming requests (HTTP and WebSocket upgrade)
     */
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // WebSocket upgrade: /ws
        if (path.endsWith('/ws')) {
            return this.handleWebSocket(request);
        }

        // HTTP: /state - Get current playback state
        if (path.endsWith('/state') && request.method === 'GET') {
            return this.handleGetState();
        }

        // HTTP: /play - Start playback
        if (path.endsWith('/play') && request.method === 'POST') {
            return this.handlePlay(request);
        }

        // HTTP: /pause - Pause playback
        if (path.endsWith('/pause') && request.method === 'POST') {
            return this.handlePause();
        }

        // HTTP: /seek - Seek to position
        if (path.endsWith('/seek') && request.method === 'POST') {
            return this.handleSeek(request);
        }

        // HTTP: /init - Initialize room (called when creating room)
        if (path.endsWith('/init') && request.method === 'POST') {
            return this.handleInit(request);
        }

        return new Response('Not found', { status: 404 });
    }

    /**
     * Handle WebSocket connection
     */
    private async handleWebSocket(request: Request): Promise<Response> {
        // Check for upgrade header
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader !== 'websocket') {
            return new Response('Expected websocket upgrade', { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = [pair[0], pair[1]];

        // Accept the WebSocket connection
        server.accept();
        this.sockets.add(server);

        // Send current state immediately on connect
        const { room, serverTime } = await this.getRoom();
        server.send(
            JSON.stringify({
                type: 'STATE',
                movieId: room.movieId,
                isPlaying: room.isPlaying,
                serverTime,
            } as StateMessage)
        );

        // Handle incoming messages
        server.addEventListener('message', (evt) => {
            let payload: any;
            try {
                payload = JSON.parse(evt.data as string);
            } catch {
                return;
            }

            // Handle chat messages - broadcast to all
            if (payload.type === 'CHAT') {
                this.broadcast({
                    type: 'CHAT',
                    user: payload.user ?? 'Ẩn danh',
                    text: (payload.text ?? '').slice(0, 500), // Limit message length
                    ts: Date.now(),
                });
            }
        });

        // Cleanup on close
        server.addEventListener('close', () => {
            this.sockets.delete(server);
        });

        server.addEventListener('error', () => {
            this.sockets.delete(server);
        });

        return new Response(null, { status: 101, webSocket: client });
    }

    /**
     * GET /state - Return current playback state
     */
    private async handleGetState(): Promise<Response> {
        const { room, serverTime } = await this.getRoom();
        return Response.json({
            movieId: room.movieId,
            isPlaying: room.isPlaying,
            serverTime,
            ownerId: room.ownerId,
        });
    }

    /**
     * POST /init - Initialize room with owner and movie
     */
    private async handleInit(request: Request): Promise<Response> {
        const body = await request.json().catch(() => ({})) as any;
        const now = Date.now();

        const room: RoomState = {
            movieId: body.movieId ?? null,
            position: 0,
            isPlaying: false,
            updatedAt: now,
            ownerId: body.ownerId,
        };

        await this.state.storage.put('room', room);
        return Response.json({ ok: true });
    }

    /**
     * POST /play - Start playback at position
     */
    private async handlePlay(request: Request): Promise<Response> {
        const body = await request.json().catch(() => ({})) as any;
        const now = Date.now();

        const room: RoomState = {
            movieId: body.movieId ?? null,
            position: Number(body.position ?? 0),
            isPlaying: true,
            updatedAt: now,
        };

        // Preserve ownerId
        const existing = await this.state.storage.get<RoomState>('room');
        if (existing?.ownerId) {
            room.ownerId = existing.ownerId;
        }

        await this.state.storage.put('room', room);
        this.broadcast({ type: 'PLAY', time: room.position, movieId: room.movieId ?? undefined });
        return Response.json({ ok: true });
    }

    /**
     * POST /pause - Pause playback
     */
    private async handlePause(): Promise<Response> {
        const { room, serverTime } = await this.getRoom();
        const now = Date.now();

        const next: RoomState = {
            ...room,
            position: serverTime,
            isPlaying: false,
            updatedAt: now,
        };

        await this.state.storage.put('room', next);
        this.broadcast({ type: 'PAUSE', time: next.position });
        return Response.json({ ok: true });
    }

    /**
     * POST /seek - Seek to position
     */
    private async handleSeek(request: Request): Promise<Response> {
        const body = await request.json().catch(() => ({})) as any;
        const { room } = await this.getRoom();
        const now = Date.now();

        const next: RoomState = {
            ...room,
            position: Number(body.position ?? 0),
            updatedAt: now,
        };

        await this.state.storage.put('room', next);
        this.broadcast({ type: 'SEEK', time: next.position });
        return Response.json({ ok: true });
    }
}

// Default export for Cloudflare Workers
export default {
    async fetch() {
        return new Response('RoomDO Worker');
    },
};
