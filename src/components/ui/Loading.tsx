import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gray';
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'primary', ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const variants = {
      primary: 'border-red-600',
      white: 'border-white',
      gray: 'border-slate-400',
    };

    return (
      <div
        className={cn(
          'inline-block rounded-full border-2 border-t-transparent animate-spin',
          sizes[size],
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
        role="status"
        aria-label="Loading"
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton components for loading states
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, rounded = false, style, ...props }, ref) => {
    return (
      <div
        className={cn(
          'animate-pulse bg-slate-700',
          rounded ? 'rounded-full' : 'rounded',
          className
        )}
        style={{
          width,
          height,
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Movie card skeleton specifically for our movie streaming app
const MovieCardSkeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('space-y-3', className)}
        ref={ref}
        {...props}
      >
        {/* Poster image skeleton */}
        <Skeleton className="w-full aspect-[2/3] rounded-lg" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton height="20px" width="80%" />
          <Skeleton height="16px" width="60%" />
        </div>
        
        {/* Badges skeleton */}
        <div className="flex space-x-2">
          <Skeleton height="24px" width="60px" rounded />
          <Skeleton height="24px" width="80px" rounded />
        </div>
      </div>
    );
  }
);

MovieCardSkeleton.displayName = 'MovieCardSkeleton';

// Page loading component
export interface PageLoadingProps {
  message?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="xl" variant="primary" />
      <p className="text-slate-400 text-lg">{message}</p>
    </div>
  );
};

// Grid of movie card skeletons
export interface MovieGridSkeletonProps {
  count?: number;
}

const MovieGridSkeleton: React.FC<MovieGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
};

export {
  LoadingSpinner,
  Skeleton,
  MovieCardSkeleton,
  PageLoading,
  MovieGridSkeleton,
};
