'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface WatchPartyState {
    movieId: string | null;
    isPlaying: boolean;
    serverTime: number;
    ownerId?: string;
}

interface ChatMessage {
    type: 'CHAT';
    user: string;
    text: string;
    ts: number;
}

interface ControlMessage {
    type: 'PLAY' | 'PAUSE' | 'SEEK' | 'STATE';
    time?: number;
    serverTime?: number;
    movieId?: string;
    isPlaying?: boolean;
}

type WSMessage = ChatMessage | ControlMessage;

interface UseWatchPartyOptions {
    roomId: string;
    username: string;
    onStateChange?: (state: WatchPartyState) => void;
    onPlay?: (time: number) => void;
    onPause?: (time: number) => void;
    onSeek?: (time: number) => void;
}

// DO Worker URL for direct WebSocket connection
const DO_WORKER_URL = 'hehephim-do.hehephim28.workers.dev';

export function useWatchParty({
    roomId,
    username,
    onStateChange,
    onPlay,
    onPause,
    onSeek,
}: UseWatchPartyOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [state, setState] = useState<WatchPartyState | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        // Close existing connection first to prevent leaks
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN ||
                wsRef.current.readyState === WebSocket.CONNECTING) {
                wsRef.current.close();
            }
            wsRef.current = null;
        }

        // Connect directly to DO worker
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${DO_WORKER_URL}/room/${roomId}/ws`;

        console.log('Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
            setIsConnected(true);
            console.log('WebSocket connected');

            // Fetch existing chat history via Pages API (avoids CORS)
            try {
                const res = await fetch(`/room/${roomId}/chat`);
                if (res.ok) {
                    const data = await res.json() as { messages?: ChatMessage[] };
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch chat history:', e);
            }
        };

        ws.onmessage = (event) => {
            try {
                const data: WSMessage = JSON.parse(event.data);

                switch (data.type) {
                    case 'STATE':
                        const stateMsg = data as ControlMessage;
                        const newState: WatchPartyState = {
                            movieId: stateMsg.movieId ?? null,
                            isPlaying: stateMsg.isPlaying ?? false,
                            serverTime: stateMsg.serverTime ?? 0,
                        };
                        setState(newState);
                        onStateChange?.(newState);
                        break;

                    case 'PLAY':
                        onPlay?.(data.time ?? 0);
                        setState((prev) => prev ? { ...prev, isPlaying: true, serverTime: data.time ?? 0 } : prev);
                        break;

                    case 'PAUSE':
                        onPause?.(data.time ?? 0);
                        setState((prev) => prev ? { ...prev, isPlaying: false, serverTime: data.time ?? 0 } : prev);
                        break;

                    case 'SEEK':
                        onSeek?.(data.time ?? 0);
                        setState((prev) => prev ? { ...prev, serverTime: data.time ?? 0 } : prev);
                        break;

                    case 'CHAT':
                        setMessages((prev) => [...prev, data as ChatMessage].slice(-100));
                        break;
                }
            } catch (e) {
                console.error('Failed to parse WS message:', e);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');

            // Auto-reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }, [roomId, onStateChange, onPlay, onPause, onSeek]);

    // Connect on mount
    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    // Send chat message via WebSocket
    const sendChat = useCallback((text: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'CHAT',
                user: username,
                text,
            }));
        }
    }, [username]);

    // Get current state from server (fallback)
    const syncState = useCallback(async () => {
        try {
            const res = await fetch(`https://${DO_WORKER_URL}/room/${roomId}/state`);
            const data = await res.json() as {
                movieId?: string;
                isPlaying?: boolean;
                serverTime?: number;
                ownerId?: string;
            };
            const newState: WatchPartyState = {
                movieId: data.movieId ?? null,
                isPlaying: data.isPlaying ?? false,
                serverTime: data.serverTime ?? 0,
                ownerId: data.ownerId,
            };
            setState(newState);
            return newState;
        } catch (e) {
            console.error('Failed to sync state:', e);
            return null;
        }
    }, [roomId]);

    return {
        isConnected,
        messages,
        state,
        sendChat,
        syncState,
    };
}
