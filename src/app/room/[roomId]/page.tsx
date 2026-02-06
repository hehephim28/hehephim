'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Play, Pause, RefreshCw, Send, Users, Share2, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchParty } from '@/hooks/useWatchParty';
import { movieService } from '@/services/movieService';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { IframePlayer } from '@/components/ui/IframePlayer';
import type { MovieDetail, Episode } from '@/types/movie';

interface RoomInfo {
    roomId: string;
    ownerId: string;
    ownerUsername: string;
    movieId: string;
    createdAt: number;
}

export default function WatchPartyRoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;

    const { user, isAuthenticated } = useAuth();
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<HTMLVideoElement | null>(null);

    const isOwner = user?.id === roomInfo?.ownerId;
    const username = user?.username || 'Khách';

    // Callbacks for watch party events
    const handlePlay = useCallback((time: number) => {
        setCurrentTime(time);
        setIsPlaying(true);
        // In a real implementation, sync the HLS player
    }, []);

    const handlePause = useCallback((time: number) => {
        setCurrentTime(time);
        setIsPlaying(false);
    }, []);

    const handleSeek = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    const handleStateChange = useCallback((state: any) => {
        setCurrentTime(state.serverTime);
        setIsPlaying(state.isPlaying);
    }, []);

    const {
        isConnected,
        messages,
        state,
        sendChat,
        syncState,
    } = useWatchParty({
        roomId,
        username,
        onPlay: handlePlay,
        onPause: handlePause,
        onSeek: handleSeek,
        onStateChange: handleStateChange,
    });

    // Fetch room info and movie data
    useEffect(() => {
        async function fetchData() {
            try {
                // Get room info
                const roomRes = await fetch(`/api/rooms/${roomId}`);
                if (!roomRes.ok) {
                    throw new Error('Phòng không tồn tại');
                }
                const roomData = await roomRes.json() as { room: RoomInfo };
                setRoomInfo(roomData.room);

                // Get movie details
                const movieData = await movieService.getMovieDetails(roomData.room.movieId);
                setMovie(movieData.movie);
                setEpisodes(movieData.episodes || []);
            } catch (e: any) {
                setError(e.message || 'Đã xảy ra lỗi');
            } finally {
                setLoading(false);
            }
        }

        if (roomId) {
            fetchData();
        }
    }, [roomId]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Host controls
    const sendPlay = async () => {
        if (!isOwner) return;
        try {
            await fetch(`/room/${roomId}/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ movieId: roomInfo?.movieId, position: currentTime }),
            });
        } catch (e) {
            console.error('Play error:', e);
        }
    };

    const sendPause = async () => {
        if (!isOwner) return;
        try {
            await fetch(`/room/${roomId}/pause`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            console.error('Pause error:', e);
        }
    };

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendChat(chatInput.trim());
            setChatInput('');
        }
    };

    const handleSync = async () => {
        const newState = await syncState();
        if (newState) {
            setCurrentTime(newState.serverTime);
            setIsPlaying(newState.isPlaying);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <p className="text-red-400 text-lg">{error}</p>
                    <Link href="/">
                        <Button>Về trang chủ</Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-slate-900">
                {/* Header Bar */}
                <div className="bg-slate-800/50 border-b border-slate-700 py-3 px-4">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/phim/${roomInfo?.movieId}`} className="text-gray-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-white font-bold truncate max-w-md">
                                    {movie?.name || 'Watch Party'}
                                </h1>
                                <p className="text-gray-400 text-sm">
                                    Phòng của {roomInfo?.ownerUsername} • {isConnected ?
                                        <span className="text-green-400">● Đang kết nối</span> :
                                        <span className="text-red-400">● Mất kết nối</span>
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyLink}
                                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            >
                                {copied ? 'Đã copy' : 'Copy link'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Chat Panel - Left on desktop, bottom on mobile */}
                        <div className="lg:col-span-1 order-2 lg:order-1">
                            <div className="bg-slate-800 rounded-xl border border-slate-700 h-[500px] lg:h-[calc(100vh-200px)] flex flex-col">
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                    <h2 className="font-bold text-white flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Chat
                                    </h2>
                                </div>

                                {/* Chat Messages */}
                                <div
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-3"
                                >
                                    {messages.length === 0 ? (
                                        <p className="text-gray-500 text-center text-sm">
                                            Chưa có tin nhắn nào. Bắt đầu chat ngay!
                                        </p>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={i} className="text-sm">
                                                <span className="font-bold text-red-400">{msg.user}: </span>
                                                <span className="text-gray-300">{msg.text}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleSendChat} className="p-4 border-t border-slate-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Nhập tin nhắn..."
                                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Video Player - Right/Main area */}
                        <div className="lg:col-span-3 order-1 lg:order-2">
                            {/* Player */}
                            <div className="bg-black rounded-xl overflow-hidden aspect-video mb-4">
                                {episodes.length > 0 && episodes[0]?.server_data?.[0]?.link_embed ? (
                                    <IframePlayer
                                        embedUrl={episodes[0].server_data[0].link_embed}
                                        title={movie?.name || 'Watch Party'}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        Không tìm thấy nguồn phát
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {/* Host Controls */}
                                    {isOwner ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400 text-sm font-medium mr-2">
                                                👑 Bạn là chủ phòng
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={isPlaying ? sendPause : sendPlay}
                                                className="bg-red-600 hover:bg-red-700"
                                                leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            >
                                                {isPlaying ? 'Tạm dừng' : 'Phát'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm">
                                                Chỉ chủ phòng mới có thể điều khiển
                                            </span>
                                        </div>
                                    )}

                                    {/* Sync Button (for viewers) */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleSync}
                                            leftIcon={<RefreshCw className="w-4 h-4" />}
                                        >
                                            Đồng bộ
                                        </Button>

                                        <div className="text-gray-400 text-sm">
                                            Thời gian: {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Movie Info */}
                            {movie && (
                                <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <h2 className="text-lg font-bold text-white">{movie.name}</h2>
                                    {movie.origin_name && (
                                        <p className="text-gray-400 text-sm">{movie.origin_name}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
