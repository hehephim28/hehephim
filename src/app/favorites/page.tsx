'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, LogIn, Loader2, Film } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { movieService } from '@/services/movieService';
import { Layout } from '@/components/layout/Layout';
import { MovieCard } from '@/components/features/MovieCard';
import { Button } from '@/components/ui/Button';
import type { MovieDetail } from '@/types/movie';

interface FavoriteItem {
    movieId: string;
    createdAt: number;
}

export default function FavoritesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [movies, setMovies] = useState<MovieDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFavorites() {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user's favorites
                const res = await fetch('/api/favorites', {
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error('Không thể tải danh sách yêu thích');
                }

                const data = await res.json() as { favorites: FavoriteItem[] };
                setFavorites(data.favorites || []);

                // Fetch movie details for each favorite
                if (data.favorites && data.favorites.length > 0) {
                    const moviePromises = data.favorites.map(async (fav) => {
                        try {
                            const movieData = await movieService.getMovieDetails(fav.movieId);
                            return movieData.movie;
                        } catch {
                            return null;
                        }
                    });

                    const movieResults = await Promise.all(moviePromises);
                    setMovies(movieResults.filter((m): m is MovieDetail => m !== null));
                }
            } catch (e: any) {
                setError(e.message || 'Đã xảy ra lỗi');
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading) {
            fetchFavorites();
        }
    }, [isAuthenticated, authLoading]);

    // Auth loading state
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
                        <h1 className="text-2xl font-bold text-white mb-3">Đăng nhập để xem phim yêu thích</h1>
                        <p className="text-gray-400 mb-6">
                            Bạn cần đăng nhập để xem và quản lý danh sách phim yêu thích của mình.
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

    // Loading state
    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <p className="text-red-400 text-lg">{error}</p>
                    <Button onClick={() => window.location.reload()}>Thử lại</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-600/20 rounded-xl">
                        <Heart className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Phim yêu thích</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {movies.length} phim trong danh sách
                        </p>
                    </div>
                </div>

                {/* Content */}
                {movies.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
                            <Film className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Chưa có phim yêu thích</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Nhấn vào biểu tượng trái tim trên các phim để thêm vào danh sách yêu thích của bạn.
                        </p>
                        <Link href="/">
                            <Button className="bg-red-600 hover:bg-red-700">
                                Khám phá phim
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {movies.map((movie) => (
                            <MovieCard key={movie.slug} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
