import React from 'react';
import { useRouter } from 'next/navigation';
import type { Movie } from '../../types/movie';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Play, Info, Star, Calendar, Globe } from 'lucide-react';
import { getOptimizedImageUrl, truncateText, formatYear } from '../../utils/helpers';
import { cn } from '../../utils/cn';

interface HeroSectionProps {
  movie: Movie;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ movie, className }) => {
  const router = useRouter();
  const backdropUrl = getOptimizedImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = getOptimizedImageUrl(movie.poster_url);

  const handleWatchNow = () => {
    router.push(`/phim/${movie.slug}`);
  };

  const handleMoreInfo = () => {
    router.push(`/phim/${movie.slug}`);
  };

  return (
    <section 
      className={cn(
        "relative w-full h-[70vh] lg:h-[80vh] overflow-hidden",
        className
      )}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backdropUrl})`,
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
          {/* Movie Poster - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3">
            <div 
              className="relative cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={handleWatchNow}
            >
              <img
                src={posterUrl}
                alt={movie.name}
                className="w-full max-w-sm rounded-xl shadow-2xl border border-white/10"
                loading="lazy"
              />
              {/* Quality Badge */}
              {movie.quality && (
                <Badge 
                  className="absolute top-3 right-3 bg-red-600 text-white font-bold"
                >
                  {movie.quality}
                </Badge>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                <Play className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-9 space-y-6">
            {/* Movie Title */}
            <div>
              <h1 
                className="text-4xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg cursor-pointer hover:text-red-400 transition-colors duration-300"
                onClick={handleWatchNow}
              >
                {movie.name}
              </h1>
              {movie.origin_name && movie.origin_name !== movie.name && (
                <h2 
                  className="text-xl lg:text-2xl text-gray-300 font-medium cursor-pointer hover:text-white transition-colors duration-300"
                  onClick={handleWatchNow}
                >
                  {movie.origin_name}
                </h2>
              )}
            </div>

            {/* Movie Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              {movie.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatYear(movie.year)}</span>
                </div>
              )}
              
              {movie.episode_current && (
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span>{movie.episode_current}</span>
                </div>
              )}

              {movie.lang && (
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span>{movie.lang}</span>
                </div>
              )}

              {/* IMDb-style rating placeholder */}
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>8.5</span>
                <span className="text-gray-500">/10</span>
              </div>
            </div>

            {/* Categories */}
            {movie.category && movie.category.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.category.slice(0, 4).map((cat, index) => (
                  <Badge key={cat._id || `cat-${index}-${cat.name}`} variant="secondary" className="text-sm">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Movie Description - Only show if movie has content (MovieDetail) */}
            {'content' in movie && (movie as any).content && (
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {truncateText((movie as any).content, 200)}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleWatchNow}
              >
                <Play className="w-6 h-6 mr-2" />
                Xem Ngay
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={handleMoreInfo}
              >
                <Info className="w-6 h-6 mr-2" />
                Thông Tin
              </Button>
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 pt-2">
              {movie.country && movie.country.length > 0 && (
                <span>Quốc gia: {movie.country.map(c => c.name).join(', ')}</span>
              )}
              
              {movie.time && (
                <span>Thời lượng: {movie.time}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </section>
  );
};

export default HeroSection;
