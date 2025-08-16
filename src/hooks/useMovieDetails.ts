import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { movieService } from '../services/movieService';
import type { MovieDetailResponse } from '../types/movie';

/**
 * Hook to fetch movie details by slug
 */
export function useMovieDetails(slug: string) {
  return useQuery({
    queryKey: queryKeys.movies.detail(slug),
    queryFn: () => movieService.getMovieDetails(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes (movie details change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}

/**
 * Hook to prefetch movie details (useful for hover effects)
 */
export function usePrefetchMovieDetails() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.movies.detail(slug),
      queryFn: () => movieService.getMovieDetails(slug),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Hook to get related movies (same genre/category)
 */
export function useRelatedMovies(
  movieDetail: MovieDetailResponse | undefined,
  limit: number = 12,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const primaryCategory = movieDetail?.movie?.category?.[0]?.slug;
  const movieSlug = movieDetail?.movie?.slug;

  return useQuery({
    queryKey: queryKeys.categories.bySlug(primaryCategory || '', { 
      limit,
      page: 1,
      exclude: movieSlug 
    }),
    queryFn: async () => {
      if (!primaryCategory) throw new Error('No category available');
      
      const response = await movieService.getMoviesByGenre(primaryCategory, {
        limit,
        page: 1,
      });

      // Filter out the current movie from results
      if (movieSlug && response.items) {
        response.items = response.items.filter(
          (movie: any) => movie.slug !== movieSlug
        );
      }

      return response;
    },
    enabled: enabled && !!primaryCategory,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for movie view count tracking (if needed for analytics)
 */
export function useTrackMovieView() {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      if (typeof window === 'undefined') return { slug, timestamp: Date.now(), skipped: true };
      
      // Check if this movie was already tracked recently (within last 5 minutes)
      const lastTracked = localStorage.getItem(`lastTracked_${slug}`);
      const now = Date.now();
      
      if (lastTracked && (now - parseInt(lastTracked)) < 5 * 60 * 1000) {
        // Skip tracking if already tracked within 5 minutes
        return { slug, timestamp: parseInt(lastTracked), skipped: true };
      }
      
      // Store in localStorage for recently viewed
      const recentlyViewed = JSON.parse(
        localStorage.getItem('recentlyViewed') || '[]'
      );
      
      const updatedViewed = [slug, ...recentlyViewed.filter((s: string) => s !== slug)]
        .slice(0, 20); // Keep last 20 viewed movies
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
      localStorage.setItem(`lastTracked_${slug}`, now.toString());
      
      return { slug, timestamp: now };
    },
    onSuccess: (data) => {
      if (!('skipped' in data)) {
        console.log('Movie view tracked:', data);
      }
      // Could invalidate related queries here if needed
    },
  });
}

/**
 * Hook to get recently viewed movies
 */
export function useRecentlyViewed() {
  return useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: async () => {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem('recentlyViewed');
      if (!stored) return [];
      
      const slugs: string[] = JSON.parse(stored);
      
      // Fetch details for recently viewed movies
      const movieDetails = await Promise.allSettled(
        slugs.slice(0, 10).map(slug => movieService.getMovieDetails(slug))
      );
      
      return movieDetails
        .filter((result): result is PromiseFulfilledResult<MovieDetailResponse> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value.movie);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to add/remove movies from favorites (localStorage)
 */
export function useFavorites() {
  const queryClient = useQueryClient();

  const getFavorites = () => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  };

  const addToFavorites = useMutation({
    mutationFn: async (slug: string) => {
      if (typeof window === 'undefined') return [];
      const favorites = getFavorites();
      if (!favorites.includes(slug)) {
        favorites.push(slug);
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
      return favorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (slug: string) => {
      if (typeof window === 'undefined') return [];
      const favorites = getFavorites();
      const updated = favorites.filter((s: string) => s !== slug);
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const slugs = getFavorites();
      if (slugs.length === 0) return [];

      const movieDetails = await Promise.allSettled(
        slugs.map((slug: string) => movieService.getMovieDetails(slug))
      );
      
      return movieDetails
        .filter((result): result is PromiseFulfilledResult<MovieDetailResponse> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value.movie);
    },
    staleTime: 10 * 60 * 1000,
  });

  const isFavorite = (slug: string) => {
    return getFavorites().includes(slug);
  };

  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
}
