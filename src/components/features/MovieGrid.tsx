import type { Movie } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieGridSkeleton, Pagination } from '../ui';
import { cn } from '../../utils/cn';

export interface MovieGridProps {
  movies?: Movie[];
  isLoading?: boolean;
  className?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  emptyMessage?: string;
  skeletonCount?: number;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

const MovieGrid: React.FC<MovieGridProps> = ({
  movies = [],
  isLoading = false,
  className,
  cardSize = 'md',
  columns = {
    default: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  },
  gap = 'md',
  emptyMessage = 'Không tìm thấy phim nào.',
  skeletonCount = 12,
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPagination = true,
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const gridCols = `grid-cols-${columns.default || 2} sm:grid-cols-${columns.sm || 3} md:grid-cols-${columns.md || 4} lg:grid-cols-${columns.lg || 5} xl:grid-cols-${columns.xl || 6}`;

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid', gridCols, gapClasses[gap], className)}>
        <MovieGridSkeleton count={skeletonCount} />
      </div>
    );
  }

  // Empty state
  if (!movies.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-300">Không có phim</h3>
          <p className="text-slate-400 max-w-md">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  // Movie grid with pagination
  return (
    <div className={className}>
      {/* Movies Grid */}
      <div className={cn('grid', gridCols, gapClasses[gap])}>
        {movies.map((movie) => (
          <MovieCard
            key={movie._id}
            movie={movie}
            size={cardSize}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export { MovieGrid };
