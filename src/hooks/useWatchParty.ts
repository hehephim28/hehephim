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

interface UseWatchPartyOptions {
    roomId: string;
    username: string;
    onStateChange?: (state: WatchPartyState) => void;
    onPlay?: (time: number) => void;
    onPause?: (time: number) => void;
    onSeek?: (time: number) => void;
}

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
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const lastStateRef = useRef<{ isPlaying: boolean; serverTime: number } | null>(null);
    const chatPollingRef = useRef<NodeJS.Timeout | null>(null);

    // Sync state from server
    const syncState = useCallback(async () => {
        try {
            const res = await fetch(`/room/${roomId}/state`);
            if (!res.ok) throw new Error('Failed to fetch state');

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
            setIsConnected(true);

            // Detect state changes and trigger callbacks
            if (lastStateRef.current) {
                const prev = lastStateRef.current;
                if (!prev.isPlaying && newState.isPlaying) {
                    onPlay?.(newState.serverTime);
                } else if (prev.isPlaying && !newState.isPlaying) {
                    onPause?.(newState.serverTime);
                } else if (Math.abs(prev.serverTime - newState.serverTime) > 3) {
                    // Significant time difference = seek
                    onSeek?.(newState.serverTime);
                }
            }

            lastStateRef.current = {
                isPlaying: newState.isPlaying,
                serverTime: newState.serverTime,
            };

            onStateChange?.(newState);
            return newState;
        } catch (e) {
            console.error('Failed to sync state:', e);
            setIsConnected(false);
            return null;
        }
    }, [roomId, onStateChange, onPlay, onPause, onSeek]);

    // Fetch chat messages
    const fetchChat = useCallback(async () => {
        try {
            const res = await fetch(`/room/${roomId}/chat`);
            if (!res.ok) return;

            const data = await res.json() as { messages: ChatMessage[] };
            if (data.messages && Array.isArray(data.messages)) {
                setMessages(data.messages.slice(-100));
            }
        } catch (e) {
            console.error('Failed to fetch chat:', e);
        }
    }, [roomId]);

    // Start polling on mount
    useEffect(() => {
        // Initial fetch
        syncState();
        fetchChat();

        // Poll state every 2 seconds
        pollingRef.current = setInterval(() => {
            syncState();
        }, 2000);

        // Poll chat every 3 seconds
        chatPollingRef.current = setInterval(() => {
            fetchChat();
        }, 3000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            if (chatPollingRef.current) {
                clearInterval(chatPollingRef.current);
            }
        };
    }, [syncState, fetchChat]);

    // Send chat message via API
    const sendChat = useCallback(async (text: string) => {
        try {
            await fetch(`/room/${roomId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: username,
                    text: text.slice(0, 500),
                }),
            });
            // Immediately fetch to see our message
            fetchChat();
        } catch (e) {
            console.error('Failed to send chat:', e);
        }
    }, [roomId, username, fetchChat]);

    return {
        isConnected,
        messages,
        state,
        sendChat,
        syncState,
    };
}
