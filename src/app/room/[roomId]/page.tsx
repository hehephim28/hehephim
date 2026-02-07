'use client';

export const runtime = 'edge';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Play, Pause, RefreshCw, Send, Users, Copy, Check, ArrowLeft, MessageCircle, Tv } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchParty } from '@/hooks/useWatchParty';
import { movieService } from '@/services/movieService';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { VideoPlayer, type VideoPlayerHandle } from '@/components/ui/VideoPlayer';
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

    const { user } = useAuth();
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [displayTime, setDisplayTime] = useState(0);
    const [displayPlaying, setDisplayPlaying] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<VideoPlayerHandle>(null);

    const isOwner = user?.id === roomInfo?.ownerId;
    const username = user?.username || 'Khách';

    // Callbacks for watch party events - now actually control the player!
    const handlePlay = useCallback((time: number) => {
        if (playerRef.current) {
            playerRef.current.setCurrentTime(time);
            playerRef.current.play();
        }
        setDisplayTime(time);
        setDisplayPlaying(true);
    }, []);

    const handlePause = useCallback((time: number) => {
        if (playerRef.current) {
            playerRef.current.pause();
            playerRef.current.setCurrentTime(time);
        }
        setDisplayTime(time);
        setDisplayPlaying(false);
    }, []);

    const handleSeek = useCallback((time: number) => {
        if (playerRef.current) {
            playerRef.current.setCurrentTime(time);
        }
        setDisplayTime(time);
    }, []);

    const handleStateChange = useCallback((state: any) => {
        // Apply initial state when connecting
        if (playerRef.current) {
            playerRef.current.setCurrentTime(state.serverTime);
            if (state.isPlaying) {
                playerRef.current.play();
            } else {
                playerRef.current.pause();
            }
        }
        setDisplayTime(state.serverTime);
        setDisplayPlaying(state.isPlaying);
    }, []);

    const {
        isConnected,
        messages,
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

    // Host controls - send current player time
    const sendPlay = async () => {
        if (!isOwner) return;
        const currentTime = playerRef.current?.getCurrentTime() ?? 0;
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
        if (newState && playerRef.current) {
            const currentPlayerTime = playerRef.current.getCurrentTime();
            const serverTime = newState.serverTime;
            const diff = Math.abs(currentPlayerTime - serverTime);

            // Only hard-sync if difference is more than 1.5 seconds
            if (diff > 1.5) {
                playerRef.current.setCurrentTime(serverTime);
            }

            // Sync play/pause state
            if (newState.isPlaying && !playerRef.current.isPlaying()) {
                playerRef.current.play();
            } else if (!newState.isPlaying && playerRef.current.isPlaying()) {
                playerRef.current.pause();
            }

            setDisplayTime(serverTime);
            setDisplayPlaying(newState.isPlaying);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Track player time for display
    const handleTimeUpdate = useCallback((time: number) => {
        setDisplayTime(time);
    }, []);

    const handlePlayStateChange = useCallback((playing: boolean) => {
        setDisplayPlaying(playing);
    }, []);

    // Get M3U8 URL from episodes
    const m3u8Url = episodes[0]?.server_data?.[0]?.link_m3u8;

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
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
                {/* Header Bar */}
                <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 py-3 px-4 sticky top-0 z-30">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/phim/${roomInfo?.movieId}`} className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600/20 rounded-lg">
                                    <Tv className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <h1 className="text-white font-bold truncate max-w-md">
                                        {movie?.name || 'Watch Party'}
                                    </h1>
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                        Phòng của {roomInfo?.ownerUsername}
                                        <span className="inline-flex items-center gap-1">
                                            {isConnected ?
                                                <><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span><span className="text-green-400">Đang kết nối</span></> :
                                                <><span className="w-2 h-2 bg-red-400 rounded-full"></span><span className="text-red-400">Mất kết nối</span></>
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyLink}
                                className="border-slate-600 hover:bg-slate-700"
                                leftIcon={copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            >
                                {copied ? 'Đã copy' : 'Copy link'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Video Player - Left/Main area */}
                        <div className="lg:col-span-3 order-1">
                            {/* Player */}
                            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-4">
                                {m3u8Url ? (
                                    <VideoPlayer
                                        ref={playerRef}
                                        m3u8Url={m3u8Url}
                                        title={movie?.name || 'Watch Party'}
                                        poster={movie?.poster_url}
                                        className="w-full"
                                        onTimeUpdate={handleTimeUpdate}
                                        onPlayStateChange={handlePlayStateChange}
                                    />
                                ) : (
                                    <div className="w-full aspect-video flex items-center justify-center text-gray-500 bg-slate-900">
                                        <div className="text-center">
                                            <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p>Không tìm thấy nguồn phát M3U8</p>
                                            <p className="text-sm text-gray-600 mt-2">Tính năng xem chung chỉ hỗ trợ nguồn phát M3U8</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {/* Host Controls */}
                                    {isOwner ? (
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium flex items-center gap-1.5">
                                                <span className="text-lg">👑</span> Chủ phòng
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={displayPlaying ? sendPause : sendPlay}
                                                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-600/30"
                                                leftIcon={displayPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            >
                                                {displayPlaying ? 'Tạm dừng' : 'Phát'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-slate-700/50 text-gray-400 rounded-full text-sm">
                                                Chỉ chủ phòng mới có thể điều khiển
                                            </span>
                                        </div>
                                    )}

                                    {/* Sync Button */}
                                    <div className="flex items-center gap-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleSync}
                                            className="border-slate-600 hover:bg-slate-700 hover:border-slate-500"
                                            leftIcon={<RefreshCw className="w-4 h-4" />}
                                        >
                                            Đồng bộ
                                        </Button>

                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
                                            <span className="text-gray-400 text-sm">Thời gian:</span>
                                            <span className="text-white font-mono font-medium">
                                                {Math.floor(displayTime / 60)}:{String(Math.floor(displayTime % 60)).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Movie Info */}
                            {movie && (
                                <div className="mt-4 bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30">
                                    <h2 className="text-lg font-bold text-white">{movie.name}</h2>
                                    {movie.origin_name && (
                                        <p className="text-gray-400 text-sm mt-1">{movie.origin_name}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Chat Panel - Right side */}
                        <div className="lg:col-span-1 order-2">
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 h-[500px] lg:h-[calc(100vh-200px)] flex flex-col shadow-xl sticky top-24">
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
                                    <h2 className="font-bold text-white flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-red-400" />
                                        Chat
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Users className="w-4 h-4" />
                                        <span>Live</span>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-3"
                                >
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageCircle className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                                            <p className="text-gray-500 text-sm">
                                                Chưa có tin nhắn nào
                                            </p>
                                            <p className="text-gray-600 text-xs mt-1">
                                                Bắt đầu chat ngay!
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={i} className="group animate-fadeIn">
                                                <div className="bg-slate-700/30 rounded-xl p-3 hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-red-400 text-sm">{msg.user}</span>
                                                        <span className="text-gray-600 text-xs">
                                                            {new Date(msg.ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-200 text-sm break-words">{msg.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleSendChat} className="p-4 border-t border-slate-700/50 bg-slate-800/30 rounded-b-2xl">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Nhập tin nhắn..."
                                            className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                                        />
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl px-4"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </Layout>
    );
}
