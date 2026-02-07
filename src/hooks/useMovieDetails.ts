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

interface FavoriteItem {
  movieId: string;
  createdAt: number;
}

/**
 * Hook to add/remove movies from favorites (server API)
 * Now properly syncs with server instead of relying on localStorage
 */
export function useFavorites() {
  const queryClient = useQueryClient();

  // Query to fetch favorites from server
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await fetch('/api/favorites', {
        credentials: 'include',
      });

      if (!response.ok) {
        // User might not be authenticated - return empty array
        if (response.status === 401) {
          return { slugs: [] as string[], movies: [] as MovieDetailResponse['movie'][] };
        }
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json() as { favorites: FavoriteItem[] };
      const slugs = (data.favorites || []).map(f => f.movieId);

      // Fetch movie details for all favorites
      if (slugs.length === 0) {
        return { slugs: [], movies: [] };
      }

      const movieDetails = await Promise.allSettled(
        slugs.map((slug: string) => movieService.getMovieDetails(slug))
      );

      const movies = movieDetails
        .filter((result): result is PromiseFulfilledResult<MovieDetailResponse> =>
          result.status === 'fulfilled'
        )
        .map(result => result.value.movie);

      return { slugs, movies };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const addToFavorites = useMutation({
    mutationFn: async (slug: string) => {
      console.log('[Favorites] Adding to favorites:', slug);
      const response = await fetch(`/api/favorites/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể thêm vào yêu thích');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: Error) => {
      console.error('[Favorites] Add error:', error.message);
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (slug: string) => {
      console.log('[Favorites] Removing from favorites:', slug);
      const response = await fetch(`/api/favorites/${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xóa khỏi yêu thích');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: Error) => {
      console.error('[Favorites] Remove error:', error.message);
    },
  });

  // Check if a movie is in favorites using server data
  const isFavorite = (slug: string) => {
    const slugs = favoritesQuery.data?.slugs || [];
    return slugs.includes(slug);
  };

  return {
    favorites: favoritesQuery.data?.movies || [],
    favoriteSlugs: favoritesQuery.data?.slugs || [],
    isLoading: favoritesQuery.isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
}
