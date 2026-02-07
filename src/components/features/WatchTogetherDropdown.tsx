'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users2, Plus, Search, X, Loader2, Film, ExternalLink, LogIn } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { movieService } from '../../services/movieService';
import { cn } from '../../utils/cn';
import type { Movie } from '../../types/movie';

interface Room {
    roomId: string;
    movieId: string;
    createdAt: number;
}

interface WatchTogetherDropdownProps {
    className?: string;
    onAuthClick?: () => void;
}

export const WatchTogetherDropdown: React.FC<WatchTogetherDropdownProps> = ({
    className,
    onAuthClick
}) => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch rooms when dropdown opens
    useEffect(() => {
        if (isOpen && isAuthenticated && !isCreating) {
            fetchRooms();
        }
    }, [isOpen, isAuthenticated, isCreating]);

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
                    limit: 8
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

    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const res = await fetch('/api/rooms', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json() as { rooms: Room[] };
                setRooms(data.rooms || []);
            }
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleCreateRoom = async (movie: Movie) => {
        setCreatingRoom(true);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ movieId: movie.slug })
            });

            const data = await res.json() as { roomId?: string };
            if (res.ok && data.roomId) {
                setIsOpen(false);
                router.push(`/room/${data.roomId}`);
            }
        } catch (err) {
            console.error('Create room error:', err);
        } finally {
            setCreatingRoom(false);
        }
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

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {/* Trigger Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                leftIcon={<Users2 className="w-5 h-5" />}
            >
                <span className="hidden lg:inline">Xem chung</span>
            </Button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Users2 className="w-5 h-5 text-red-400" />
                            {isCreating ? 'Tạo phòng mới' : 'Xem chung'}
                        </h3>
                        {isCreating && (
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {authLoading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
                            </div>
                        ) : !isAuthenticated ? (
                            /* Not authenticated */
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 bg-red-600/20 rounded-full flex items-center justify-center">
                                    <LogIn className="w-6 h-6 text-red-400" />
                                </div>
                                <p className="text-gray-400 text-sm mb-4">
                                    Đăng nhập để xem chung phim với bạn bè
                                </p>
                                <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => {
                                        setIsOpen(false);
                                        onAuthClick?.();
                                    }}
                                >
                                    Đăng nhập
                                </Button>
                            </div>
                        ) : isCreating ? (
                            /* Create room mode */
                            <div className="p-4">
                                {/* Search input */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm phim để xem chung..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-red-500"
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                                    )}
                                </div>

                                {/* Search results */}
                                {searchQuery.length >= 2 && (
                                    <div className="space-y-2">
                                        {searchResults.length === 0 && !isSearching ? (
                                            <p className="text-gray-400 text-sm text-center py-4">
                                                Không tìm thấy phim
                                            </p>
                                        ) : (
                                            searchResults.map((movie) => (
                                                <button
                                                    key={movie.slug}
                                                    onClick={() => handleCreateRoom(movie)}
                                                    disabled={creatingRoom}
                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors text-left disabled:opacity-50"
                                                >
                                                    <img
                                                        src={movie.poster_url || movie.thumb_url}
                                                        alt={movie.name}
                                                        className="w-10 h-14 object-cover rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {movie.name}
                                                        </p>
                                                        <p className="text-gray-400 text-xs truncate">
                                                            {movie.origin_name} • {movie.year}
                                                        </p>
                                                    </div>
                                                    {creatingRoom ? (
                                                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 text-red-400" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}

                                {searchQuery.length < 2 && (
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        Nhập tên phim để tìm kiếm
                                    </p>
                                )}
                            </div>
                        ) : (
                            /* Room list mode */
                            <div>
                                {loadingRooms ? (
                                    <div className="p-8 flex justify-center">
                                        <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
                                    </div>
                                ) : rooms.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 bg-slate-700 rounded-full flex items-center justify-center">
                                            <Film className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Bạn chưa tạo phòng xem chung nào
                                        </p>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {rooms.map((room) => (
                                            <button
                                                key={room.roomId}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    router.push(`/room/${room.roomId}`);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700 transition-colors"
                                            >
                                                <div className="text-left">
                                                    <p className="text-white text-sm font-medium">
                                                        {room.movieId}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {formatTime(room.createdAt)}
                                                    </p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Create room button */}
                                <div className="p-3 border-t border-slate-700">
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700"
                                        size="sm"
                                        onClick={() => setIsCreating(true)}
                                        leftIcon={<Plus className="w-4 h-4" />}
                                    >
                                        Tạo phòng mới
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchTogetherDropdown;
