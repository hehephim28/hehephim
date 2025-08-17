import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Button } from '../ui';
import type { Movie } from '../../types/movie';
import { cn } from '../../utils/cn';

export interface MovieCarouselProps {
  movies: Movie[];
  isLoading?: boolean;
  className?: string;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({
  movies,
  isLoading = false,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(6);

  // Responsive items per view for skeleton loading
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(2);      // mobile: 2 items
      else if (width < 768) setItemsPerView(3); // tablet: 3 items
      else if (width < 1024) setItemsPerView(4); // small desktop: 4 items
      else if (width < 1280) setItemsPerView(5); // medium desktop: 5 items
      else setItemsPerView(6);                   // large desktop: 6 items
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Update scroll buttons state on mount and when movies change
  useEffect(() => {
    checkScrollPosition();
  }, [movies]);

  // Smooth scroll function
  const scrollBy = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8; // Scroll 80% of visible width
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevious = () => scrollBy('left');
  const handleNext = () => scrollBy('right');

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex gap-3 sm:gap-4 overflow-hidden px-1">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-44 sm:w-48 md:w-52 lg:w-56 xl:w-60">
              <div className="bg-slate-700 animate-pulse rounded-lg aspect-[2/3]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className={cn('text-center py-8 text-slate-400', className)}>
        Không có phim nào
      </div>
    );
  }

  return (
    <div className={cn('relative carousel-wrapper', className)}>
      {/* Previous Button - Show on hover */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className="carousel-nav-btn absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 opacity-0 transition-opacity duration-300 hidden sm:flex rounded-full"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {/* Next Button - Show on hover */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className="carousel-nav-btn absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 opacity-0 transition-opacity duration-300 hidden sm:flex rounded-full"
          onClick={handleNext}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-1"
        onScroll={checkScrollPosition}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
        }}
      >
        {movies.map((movie, index) => (
          <div
            key={`${movie.slug}-${index}`}
            className="flex-shrink-0 w-44 sm:w-48 md:w-52 lg:w-56 xl:w-60"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MovieCard
              movie={movie}
              size="md"
              className="w-full transform transition-transform duration-200 hover:scale-105"
            />
          </div>
        ))}
        {/* Add some padding at the end */}
        <div className="flex-shrink-0 w-4"></div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="sm:hidden text-center mt-2">
        <p className="text-slate-500 text-xs">
          ← Kéo để xem thêm →
        </p>
      </div>
    </div>
  );
};

export { MovieCarousel };
