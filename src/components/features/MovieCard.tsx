import Link from 'next/link';
import { Play } from 'lucide-react';
import type { Movie } from '../../types/movie';
import { 
  getOptimizedImageUrl
} from '../../utils/helpers';
import { cn } from '../../utils/cn';

export interface MovieCardProps {
  movie: Movie;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showOverlay?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  className,
  size = 'md',
}) => {
  const imageUrl = getOptimizedImageUrl(movie.poster_url || movie.thumb_url);
  const movieUrl = movie.slug ? `/phim/${movie.slug}` : '#';

  const sizes = {
    sm: {
      container: 'w-[160px]',
      image: 'h-[240px]',
      title: 'text-sm',
    },
    md: {
      container: 'w-[180px]',
      image: 'h-[270px]',
      title: 'text-sm',
    },
    lg: {
      container: 'w-[200px]',
      image: 'h-[300px]',
      title: 'text-base',
    },
  };

  return (
    <div className={cn('group cursor-pointer transition-all duration-300 relative', sizes[size].container, className)}>
        <Link href={movieUrl} className="block">
        {/* Movie Poster Container */}
        <div className={cn('relative overflow-hidden rounded-lg bg-slate-800', sizes[size].image)}>
          <img
            src={imageUrl}
            alt={movie.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-movie.jpg';
            }}
          />

          {/* Play button overlay - only show on desktop hover, hidden on mobile */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center hidden sm:flex">
            <div className="bg-red-600 rounded-full p-3">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Simple Title Below Image */}
        <div className="mt-2 px-1">
          <h4 className={cn(
            'text-white font-medium leading-tight group-hover:text-yellow-400 transition-colors',
            'line-clamp-2',
            sizes[size].title
          )}>
            {movie.name}
          </h4>
          {movie.origin_name && movie.origin_name !== movie.name && (
            <p className="text-slate-400 text-xs mt-1 line-clamp-1">
              {movie.origin_name}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export { MovieCard };
