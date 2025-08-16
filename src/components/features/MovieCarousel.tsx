import React, { useState, useRef, useEffect } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(6);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Touch events for swipe functionality
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);

  // Responsive items per view
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

  // Calculate how many items we can show and scroll
  const totalItems = movies.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Update scroll buttons state
  useEffect(() => {
    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < maxIndex);
  }, [currentIndex, maxIndex]);

  // Reset to first item when movies change
  useEffect(() => {
    setCurrentIndex(0);
  }, [movies]);

  const scrollToIndex = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
    
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.scrollWidth / totalItems;
      scrollRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevious = () => {
    scrollToIndex(currentIndex - itemsPerView);
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + itemsPerView);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchEndX(touch.clientX);
    setIsDragging(true);
    setIsHorizontalSwipe(false);
    
    // Store initial scroll position
    if (scrollRef.current) {
      setInitialScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.targetTouches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    // Calculate movement distances
    const deltaX = Math.abs(currentX - touchStartX);
    const deltaY = Math.abs(currentY - touchStartY);
    
    // Determine if this is a horizontal swipe (more horizontal than vertical movement)
    if (deltaX > 10 || deltaY > 10) {
      const isHorizontal = deltaX > deltaY;
      setIsHorizontalSwipe(isHorizontal);
      
      if (isHorizontal) {
        // Prevent vertical scrolling only for horizontal swipes
        e.preventDefault();
        
        // Update scroll position in real-time
        if (scrollRef.current) {
          const dragDistance = touchStartX - currentX;
          const newScrollLeft = initialScrollLeft + dragDistance;
          scrollRef.current.scrollLeft = Math.max(0, Math.min(newScrollLeft, scrollRef.current.scrollWidth - scrollRef.current.clientWidth));
        }
      }
    }
    
    setTouchEndX(currentX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Only handle swipe logic if it was a horizontal swipe
    if (isHorizontalSwipe && touchStartX && touchEndX) {
      const distance = touchStartX - touchEndX;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe && canScrollRight) {
        handleNext();
      } else if (isRightSwipe && canScrollLeft) {
        handlePrevious();
      } else {
        // Snap back to current position if swipe wasn't strong enough
        scrollToIndex(currentIndex);
      }
      
      // Prevent default only for horizontal swipes
      e.preventDefault();
    }

    // Reset all touch states
    setTouchStartX(0);
    setTouchStartY(0);
    setTouchEndX(0);
    setIsHorizontalSwipe(false);
    setInitialScrollLeft(0);
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex space-x-4 overflow-hidden">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52">
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
    <div className={cn('relative carousel-group', className)}>
      {/* Previous Button - Hidden on mobile */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 carousel-group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      {/* Next Button - Hidden on mobile */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 carousel-group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex"
          onClick={handleNext}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex space-x-4 overflow-x-auto scrollbar-hide carousel-container',
          isDragging && isHorizontalSwipe ? 'scroll-auto' : 'scroll-smooth'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: 'manipulation',
          overscrollBehaviorX: 'contain',
        }}
      >
        {movies.map((movie, index) => (
          <div
            key={`${movie.slug}-${index}`}
            className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52"
          >
            <MovieCard 
              movie={movie} 
              size="md"
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Scroll Indicators */}
      {totalItems > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(totalItems / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-200',
                index === Math.floor(currentIndex / itemsPerView)
                  ? 'bg-red-500'
                  : 'bg-slate-600 hover:bg-slate-400'
              )}
              onClick={() => scrollToIndex(index * itemsPerView)}
            />
          ))}
        </div>
      )}

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-center mt-2">
        <p className="text-slate-500 text-xs">
          ← Vuốt để xem thêm →
        </p>
      </div>
    </div>
  );
};

export { MovieCarousel };
