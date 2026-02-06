'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Star,
  Calendar,
  Globe,
  Clock,
  Users,
  Users2,
  Film,
  Share2,
  Heart,
  HeartIcon,
  Loader2
} from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import { IframePlayer, EpisodeIframePlayer } from '@/components/ui/IframePlayer';
import { MovieSection } from '@/components/features/MovieSection';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import type { MovieDetailResponse } from '@/types/movie';
import {
  useRelatedMovies,
  useFavorites,
  useTrackMovieView
} from '@/hooks/useMovieDetails';
import {
  getOptimizedImageUrl,
  formatYear,
  getQualityBadgeColor,
  getLanguageBadgeColor,
  decodeHtmlEntities
} from '@/utils/helpers';
import { cn } from '@/utils/cn';

interface MovieDetailClientProps {
  initialData: MovieDetailResponse;
  slug: string;
}

export const MovieDetailClient: React.FC<MovieDetailClientProps> = ({
  initialData,
  slug
}) => {
  const router = useRouter();
  const [loadRelatedMovies, setLoadRelatedMovies] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const playerSectionRef = useRef<HTMLElement>(null);

  const movieData = initialData;
  const { data: relatedMovies, isLoading: loadingRelated } = useRelatedMovies(
    movieData,
    12,
    { enabled: loadRelatedMovies }
  );
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const trackView = useTrackMovieView();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Progressive loading: load related movies after component mounts
  useEffect(() => {
    if (movieData?.movie) {
      const timer = setTimeout(() => {
        setLoadRelatedMovies(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [movieData?.movie]);

  // Track movie view when component mounts
  useEffect(() => {
    if (movieData?.movie && slug) {
      setTimeout(() => {
        trackView.mutate(slug);
      }, 100);
    }
  }, [movieData?.movie, slug, trackView]);

  // Auto scroll to video player when showPlayer becomes true
  useEffect(() => {
    if (showPlayer && playerSectionRef.current) {
      setTimeout(() => {
        playerSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showPlayer]);

  if (!movieData?.movie) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const { movie, episodes } = movieData;
  const backdropUrl = getOptimizedImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = getOptimizedImageUrl(movie.poster_url);
  const isFav = isFavorite(movie.slug);

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFromFavorites.mutate(movie.slug);
    } else {
      addToFavorites.mutate(movie.slug);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.name,
          // text: `${movie.name} (${movie.year}) - ${movie.origin_name} \n`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleWatchTogether = async () => {
    if (isCreatingRoom) return;
    setIsCreatingRoom(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ movieId: movie.slug }),
      });

      const data = await res.json() as { roomId?: string; message?: string };

      if (res.ok && data.roomId) {
        router.push(`/room/${data.roomId}`);
      } else {
        alert(data.message || 'Bạn cần đăng nhập để tạo phòng xem chung');
      }
    } catch (e) {
      console.error('Create room error:', e);
      alert('Đã xảy ra lỗi khi tạo phòng');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const breadcrumbItems = [
    {
      label: movie.type === 'single' ? 'Phim Lẻ' :
        movie.type === 'series' ? 'Phim Bộ' :
          movie.type === 'hoathinh' ? 'Hoạt Hình' : 'Phim',
      href: `/danh-sach/${movie.type === 'single' ? 'phim-le' :
        movie.type === 'series' ? 'phim-bo' :
          movie.type === 'hoathinh' ? 'hoat-hinh' : 'phim-le'
        }`
    },
    { label: decodeHtmlEntities(movie.name), href: `/phim/${movie.slug}`, isCurrent: true }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-slate-800/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Hero Section with Movie Details */}
        <section className="relative">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Movie Poster */}
              <div className="lg:col-span-3">
                <div className="relative max-w-sm mx-auto lg:mx-0">
                  <img
                    src={posterUrl}
                    alt={movie.name}
                    className="w-full rounded-xl shadow-2xl border border-white/10"
                    loading="lazy"
                  />

                  {/* Quality Badge */}
                  {movie.quality && (
                    <Badge
                      className={cn(
                        'absolute top-3 right-3 font-bold',
                        getQualityBadgeColor(movie.quality)
                      )}
                    >
                      {movie.quality}
                    </Badge>
                  )}

                  {/* Episode Current */}
                  {movie.episode_current && (
                    <Badge
                      variant="info"
                      className="absolute top-3 left-3 font-bold"
                    >
                      {movie.episode_current}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Movie Information */}
              <div className="lg:col-span-9 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                    {decodeHtmlEntities(movie.name)}
                  </h1>
                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <h2 className="text-xl lg:text-2xl text-gray-300 font-medium">
                      {decodeHtmlEntities(movie.origin_name)}
                    </h2>
                  )}
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  {movie.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{formatYear(movie.year)}</span>
                    </div>
                  )}

                  {movie.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{movie.time}</span>
                    </div>
                  )}

                  {movie.lang && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      <span>{movie.lang}</span>
                    </div>
                  )}

                  {/* TMDB Rating */}
                  {movie.tmdb && movie.tmdb.vote_average > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span>{movie.tmdb.vote_average.toFixed(1)}</span>
                      <span className="text-gray-500">/10</span>
                      <span className="text-gray-500">({movie.tmdb.vote_count} votes)</span>
                    </div>
                  )}
                </div>

                {/* Language Badge */}
                {movie.lang && (
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={cn(
                        'text-sm font-medium',
                        getLanguageBadgeColor(movie.lang)
                      )}
                    >
                      {movie.lang}
                    </Badge>
                  </div>
                )}

                {/* Categories */}
                {movie.category && movie.category.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Thể loại:</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.category.map((cat, index) => (
                        <Badge
                          key={cat._id || `category-${index}`}
                          variant="secondary"
                          className="text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          onClick={() => router.push(`/the-loai/${cat.slug}`)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Countries */}
                {movie.country && movie.country.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Quốc gia:</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.country.map((country, index) => (
                        <Badge
                          key={country._id || `country-${index}`}
                          variant="secondary"
                          className="text-sm hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          onClick={() => router.push(`/quoc-gia/${country.slug}`)}
                        >
                          {country.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cast and Director */}
                <div className="grid md:grid-cols-2 gap-4">
                  {movie.actor && movie.actor.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Diễn viên:
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {movie.actor.slice(0, 5).join(', ')}
                        {movie.actor.length > 5 && '...'}
                      </p>
                    </div>
                  )}

                  {movie.director && movie.director.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Film className="w-5 h-5" />
                        Đạo diễn:
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {movie.director.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Movie Description */}
                {movie.content && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Nội dung phim:</h3>
                    <div
                      className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: movie.content }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => setShowPlayer(!showPlayer)}
                  >
                    <Play className="w-6 h-6 mr-2" />
                    {showPlayer ? 'Ẩn Player' : 'Xem Phim'}
                  </Button>

                  {/* Trailer Button */}
                  {movie.trailer_url && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => window.open(movie.trailer_url, '_blank')}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Xem Trailer
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleFavoriteToggle}
                  >
                    {isFav ? (
                      <HeartIcon className="w-6 h-6 mr-2 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="w-6 h-6 mr-2" />
                    )}
                    {isFav ? 'Đã yêu thích' : 'Yêu thích'}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleWatchTogether}
                    disabled={isCreatingRoom}
                  >
                    {isCreatingRoom ? (
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    ) : (
                      <Users2 className="w-6 h-6 mr-2" />
                    )}
                    Xem chung
                  </Button>

                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={handleShare}
                  >
                    <Share2 className="w-6 h-6 mr-2" />
                    Chia sẻ
                  </Button>
                </div>

                {/* Copied Notification */}
                {showCopied && (
                  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                    <div className="bg-black/90 text-white px-6 py-4 rounded-lg flex items-center gap-3 shadow-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">Copied!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Video Player Section */}
        {showPlayer && (
          <section ref={playerSectionRef} className="bg-slate-900/95 py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Play className="w-6 h-6" />
                  Phát Phim
                </h2>

                {episodes && episodes.length > 0 ? (
                  <EpisodeIframePlayer
                    episodes={episodes}
                    movieTitle={movie.name}
                  />
                ) : (
                  <IframePlayer
                    embedUrl={episodes?.[0]?.server_data?.[0]?.link_embed}
                    title={movie.name}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Related Movies Section */}
        {relatedMovies?.items && relatedMovies.items.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <MovieSection
                title="🎬 Phim liên quan"
                subtitle="Những bộ phim cùng thể loại"
                movies={relatedMovies.items}
                isLoading={loadingRelated}
                showViewAll={false}
              />
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default MovieDetailClient;
