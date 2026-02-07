'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users2, Plus, Search, Loader2, Film, ExternalLink, LogIn, Trash2, X, Clock, Edit3 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { movieService } from '@/services/movieService';
import { getOptimizedImageUrl } from '@/utils/helpers';
import type { Movie } from '@/types/movie';

interface Room {
    roomId: string;
    movieId: string;
    roomName: string;
    createdAt: number;
}

interface RoomWithMovieInfo extends Room {
    movieName?: string;
    moviePoster?: string;
}

const MAX_ROOMS = 10;

export default function WatchTogetherPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [rooms, setRooms] = useState<RoomWithMovieInfo[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [deletingRoom, setDeletingRoom] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [roomName, setRoomName] = useState('');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch rooms on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchRooms();
        }
    }, [isAuthenticated]);

    // Focus search input when modal opens
    useEffect(() => {
        if (isModalOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isModalOpen]);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await movieService.searchMovies({
                    keyword: searchQuery,
                    limit: 10
                });
                setSearchResults(response.items || []);
            } catch (err) {
                console.error('Search error:', err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                handleCloseModal();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const res = await fetch('/api/rooms', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json() as { rooms: Room[] };
                const roomsData = data.rooms || [];

                // Fetch movie info for each room
                const roomsWithMovieInfo = await Promise.all(
                    roomsData.map(async (room) => {
                        try {
                            const movieData = await movieService.getMovieDetails(room.movieId);
                            return {
                                ...room,
                                movieName: movieData.movie?.name,
                                moviePoster: movieData.movie?.poster_url || movieData.movie?.thumb_url
                            };
                        } catch {
                            return room;
                        }
                    })
                );

                setRooms(roomsWithMovieInfo);
            }
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        setRoomName(`Phòng xem ${movie.name}`);
    };

    const handleCreateRoom = async () => {
        if (!selectedMovie) return;

        if (rooms.length >= MAX_ROOMS) {
            setError(`Bạn đã tạo tối đa ${MAX_ROOMS} phòng. Vui lòng xóa phòng cũ để tạo phòng mới.`);
            return;
        }

        setCreatingRoom(true);
        setError(null);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    movieId: selectedMovie.slug,
                    roomName: roomName.trim() || `Phòng xem ${selectedMovie.name}`
                })
            });

            const data = await res.json() as { roomId?: string; message?: string };
            if (res.ok && data.roomId) {
                router.push(`/room/${data.roomId}`);
            } else {
                setError(data.message || 'Đã xảy ra lỗi khi tạo phòng');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi khi tạo phòng');
        } finally {
            setCreatingRoom(false);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;

        setDeletingRoom(roomId);
        try {
            const res = await fetch(`/api/rooms/${roomId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setRooms(rooms.filter(r => r.roomId !== roomId));
                setError(null);
            } else {
                const data = await res.json() as { message?: string };
                setError(data.message || 'Không thể xóa phòng');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi khi xóa phòng');
        } finally {
            setDeletingRoom(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMovie(null);
        setRoomName('');
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    // Auth loading
    if (authLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-600/20 rounded-full flex items-center justify-center">
                            <LogIn className="w-10 h-10 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">Đăng nhập để xem chung</h1>
                        <p className="text-gray-400 mb-6">
                            Bạn cần đăng nhập để tạo và quản lý phòng xem chung với bạn bè.
                        </p>
                        <Link href="/">
                            <Button className="bg-red-600 hover:bg-red-700">
                                Về trang chủ
                            </Button>
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-600/20 rounded-xl">
                            <Users2 className="w-7 h-7 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Xem chung</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {rooms.length}/{MAX_ROOMS} phòng đã tạo
                            </p>
                        </div>
                    </div>

                    <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => setIsModalOpen(true)}
                        disabled={rooms.length >= MAX_ROOMS}
                        leftIcon={<Plus className="w-5 h-5" />}
                    >
                        <span className="hidden sm:inline">Tạo phòng mới</span>
                        <span className="sm:hidden">Tạo</span>
                    </Button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center justify-between">
                        <p className="text-red-300">{error}</p>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Room list */}
                {loadingRooms ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-10 h-10 text-red-400 animate-spin" />
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                            <Film className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Chưa có phòng nào</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Tạo phòng xem chung để mời bạn bè cùng xem phim với bạn.
                        </p>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => setIsModalOpen(true)}
                            leftIcon={<Plus className="w-5 h-5" />}
                        >
                            Tạo phòng mới
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map((room) => (
                            <div
                                key={room.roomId}
                                className="bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors overflow-hidden"
                            >
                                {/* Room card with movie info */}
                                <div className="flex gap-4 p-4">
                                    {/* Movie poster */}
                                    <div className="shrink-0">
                                        {room.moviePoster ? (
                                            <img
                                                src={getOptimizedImageUrl(room.moviePoster)}
                                                alt={room.movieName || room.movieId}
                                                className="w-20 h-28 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-20 h-28 bg-slate-700 rounded-lg flex items-center justify-center">
                                                <Film className="w-8 h-8 text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Room info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold truncate mb-1">
                                            {room.roomName}
                                        </h3>
                                        <p className="text-gray-400 text-sm truncate">
                                            {room.movieName || room.movieId}
                                        </p>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{formatTime(room.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 p-4 pt-0">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        onClick={() => router.push(`/room/${room.roomId}`)}
                                        leftIcon={<ExternalLink className="w-4 h-4" />}
                                    >
                                        Vào phòng
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-700 text-red-400 hover:bg-red-900/50"
                                        onClick={() => handleDeleteRoom(room.roomId)}
                                        disabled={deletingRoom === room.roomId}
                                    >
                                        {deletingRoom === room.roomId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Room Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600/20 rounded-lg">
                                    <Plus className="w-5 h-5 text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {selectedMovie ? 'Đặt tên phòng' : 'Tạo phòng mới'}
                                </h2>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {!selectedMovie ? (
                                <>
                                    {/* Search input */}
                                    <div className="relative mb-5">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Tìm phim để xem chung..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                        />
                                        {isSearching && (
                                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                                        )}
                                    </div>

                                    {/* Search results */}
                                    {searchQuery.length >= 2 ? (
                                        <div className="space-y-2">
                                            {searchResults.length === 0 && !isSearching ? (
                                                <p className="text-gray-400 text-center py-8">
                                                    Không tìm thấy phim "{searchQuery}"
                                                </p>
                                            ) : (
                                                searchResults.map((movie) => (
                                                    <button
                                                        key={movie.slug}
                                                        onClick={() => handleSelectMovie(movie)}
                                                        className="w-full flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition-colors text-left group"
                                                    >
                                                        <img
                                                            src={getOptimizedImageUrl(movie.poster_url || movie.thumb_url)}
                                                            alt={movie.name}
                                                            className="w-14 h-20 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium truncate group-hover:text-red-400 transition-colors">
                                                                {movie.name}
                                                            </p>
                                                            <p className="text-gray-400 text-sm truncate">
                                                                {movie.origin_name}
                                                            </p>
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                {movie.year}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-red-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="w-5 h-5 text-red-400" />
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Film className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                            <p className="text-gray-400">Nhập tên phim để tìm kiếm</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Room name form after selecting movie */
                                <div className="space-y-5">
                                    {/* Selected movie preview */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                        <img
                                            src={getOptimizedImageUrl(selectedMovie.poster_url || selectedMovie.thumb_url)}
                                            alt={selectedMovie.name}
                                            className="w-20 h-28 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-lg">{selectedMovie.name}</p>
                                            <p className="text-gray-400 text-sm">{selectedMovie.origin_name}</p>
                                            <p className="text-gray-500 text-xs mt-1">{selectedMovie.year}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedMovie(null);
                                                setRoomName('');
                                            }}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Room name input */}
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                                            <Edit3 className="w-4 h-4" />
                                            Tên phòng
                                        </label>
                                        <input
                                            type="text"
                                            value={roomName}
                                            onChange={(e) => setRoomName(e.target.value)}
                                            placeholder="Nhập tên phòng..."
                                            className="w-full px-4 py-3.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                            maxLength={100}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Error in modal */}
                                    {error && (
                                        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                            <p className="text-red-300 text-sm">{error}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {selectedMovie && (
                            <div className="flex gap-3 p-5 border-t border-slate-700 bg-slate-900/50">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-600 hover:bg-slate-800"
                                    onClick={() => {
                                        setSelectedMovie(null);
                                        setRoomName('');
                                    }}
                                >
                                    Chọn phim khác
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={handleCreateRoom}
                                    disabled={creatingRoom}
                                    leftIcon={creatingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                >
                                    {creatingRoom ? 'Đang tạo...' : 'Tạo phòng'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
