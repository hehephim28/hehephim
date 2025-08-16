import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Movie } from '../../types/movie';
import { MovieGrid } from './MovieGrid';
import { MovieCarousel } from './MovieCarousel';
import { Button } from '../ui';
import { cn } from '../../utils/cn';

export interface MovieSectionProps {
  title: string;
  subtitle?: string;
  movies?: Movie[];
  isLoading?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  children?: ReactNode;
  cardSize?: 'sm' | 'md' | 'lg';
  showViewAll?: boolean;
  emptyMessage?: string;
  layout?: 'grid' | 'carousel';
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  subtitle,
  movies,
  isLoading = false,
  viewAllHref,
  viewAllLabel = 'Xem tất cả',
  className,
  children,
  cardSize = 'md',
  showViewAll = true,
  emptyMessage,
  layout = 'carousel', // Default to carousel for homepage
}) => {
  const hasContent = children || (movies && movies.length > 0) || isLoading;

  return (
    <section className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-slate-400 text-sm">{subtitle}</p>
          )}
        </div>

        {/* View All Button */}
        {showViewAll && viewAllHref && hasContent && (
            <Link href={viewAllHref}>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="text-slate-300 hover:text-white"
            >
              {viewAllLabel}
            </Button>
          </Link>
        )}
      </div>

      {/* Section Content */}
      <div className="space-y-4">
        {children ? (
          children
        ) : layout === 'carousel' ? (
          <MovieCarousel
            movies={movies || []}
            isLoading={isLoading}
          />
        ) : (
          <MovieGrid
            movies={movies}
            isLoading={isLoading}
            cardSize={cardSize}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </section>
  );
};

export { MovieSection };
