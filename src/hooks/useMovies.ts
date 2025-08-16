import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { movieService } from '../services/movieService';
import type { MovieFilters, ApiResponse, Movie } from '../types/movie';

/**
 * Hook to fetch latest movies
 */
export function useLatestMovies(page: number = 1, version: number = 3) {
  return useQuery({
    queryKey: queryKeys.movies.list({ type: 'latest', page, version }),
    queryFn: () => movieService.getLatestMovies(page, version),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch movies by category/type
 */
export function useMoviesByCategory(filters: MovieFilters) {
  return useQuery({
    queryKey: queryKeys.movies.list({ type: 'category', ...filters }),
    queryFn: () => movieService.getMoviesByCategory(filters),
    enabled: !!filters.type,
  });
}

/**
 * Hook to fetch movies by genre
 */
export function useMoviesByGenre(
  categorySlug: string, 
  params: Omit<MovieFilters, 'type' | 'category'> & { enabled?: boolean } = {}
) {
  const { enabled = true, ...movieParams } = params;
  return useQuery({
    queryKey: queryKeys.categories.bySlug(categorySlug, movieParams),
    queryFn: () => movieService.getMoviesByGenre(categorySlug, movieParams),
    enabled: enabled && !!categorySlug,
  });
}

/**
 * Hook to fetch movies by country
 */
export function useMoviesByCountry(
  countrySlug: string, 
  params: Omit<MovieFilters, 'country'> & { enabled?: boolean } = {}
) {
  const { enabled = true, ...movieParams } = params;
  return useQuery({
    queryKey: queryKeys.countries.bySlug(countrySlug, movieParams),
    queryFn: () => movieService.getMoviesByCountry(countrySlug, movieParams),
    enabled: enabled && !!countrySlug,
  });
}

/**
 * Hook to fetch movies by year
 */
export function useMoviesByYear(
  year: number, 
  params: Omit<MovieFilters, 'year'> = {}
) {
  return useQuery({
    queryKey: queryKeys.years.byYear(year, params),
    queryFn: () => movieService.getMoviesByYear(year, params),
    enabled: !!year && year > 1900,
  });
}

/**
 * Hook for infinite scrolling movie lists
 */
export function useInfiniteMovies(baseFilters: MovieFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.movies.list({ type: 'infinite', ...baseFilters }),
    
    queryFn: ({ pageParam = 1 }) => {
      const filters = { ...baseFilters, page: pageParam };
      return movieService.getMoviesByCategory(filters);
    },
    
    initialPageParam: 1,
    
    getNextPageParam: (lastPage: ApiResponse<Movie>, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage.pagination?.totalPages || 0;
      
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    
    getPreviousPageParam: (_, allPages) => {
      const currentPage = allPages.length;
      return currentPage > 1 ? currentPage - 1 : undefined;
    },
    
    enabled: !!baseFilters.type,
  });
}

/**
 * Specialized hooks for different movie types
 */
export function usePhimBo(params: Omit<MovieFilters, 'type'> & { enabled?: boolean } = {}) {
  const { enabled = true, ...movieParams } = params;
  return useQuery({
    queryKey: queryKeys.movies.list({ ...movieParams, type: 'phim-bo' }),
    queryFn: () => movieService.getMoviesByCategory({ ...movieParams, type: 'phim-bo' }),
    enabled: enabled,
  });
}

export function usePhimLe(params: Omit<MovieFilters, 'type'> & { enabled?: boolean } = {}) {
  const { enabled = true, ...movieParams } = params;
  return useQuery({
    queryKey: queryKeys.movies.list({ ...movieParams, type: 'phim-le' }),
    queryFn: () => movieService.getMoviesByCategory({ ...movieParams, type: 'phim-le' }),
    enabled: enabled,
  });
}

export function useTVShows(params: Omit<MovieFilters, 'type'> & { enabled?: boolean } = {}) {
  const { enabled = true, ...movieParams } = params;
  return useQuery({
    queryKey: queryKeys.movies.list({ ...movieParams, type: 'tv-shows' }),
    queryFn: () => movieService.getMoviesByCategory({ ...movieParams, type: 'tv-shows' }),
    enabled: enabled,
  });
}

export function useHoatHinh(params: Omit<MovieFilters, 'type'> & { enabled?: boolean } = {}) {
  const { enabled = true, ...movieParams } = params;
  return useQuery({
    queryKey: queryKeys.movies.list({ ...movieParams, type: 'hoat-hinh' }),
    queryFn: () => movieService.getMoviesByCategory({ ...movieParams, type: 'hoat-hinh' }),
    enabled: enabled,
  });
}

export function usePhimVietsub(params: Omit<MovieFilters, 'type'> = {}) {
  return useMoviesByCategory({ ...params, type: 'phim-vietsub' });
}

export function usePhimThuyetMinh(params: Omit<MovieFilters, 'type'> = {}) {
  return useMoviesByCategory({ ...params, type: 'phim-thuyet-minh' });
}

export function usePhimLongTieng(params: Omit<MovieFilters, 'type'> = {}) {
  return useMoviesByCategory({ ...params, type: 'phim-long-tieng' });
}

/**
 * Hook to get all movie data for homepage sections
 */
export function useHomepageMovies() {
  const latest = useLatestMovies(1, 3);
  const phimBo = usePhimBo({ page: 1, limit: 12 });
  const phimLe = usePhimLe({ page: 1, limit: 12 });
  const tvShows = useTVShows({ page: 1, limit: 12 });
  const hoatHinh = useHoatHinh({ page: 1, limit: 12 });

  return {
    latest,
    phimBo,
    phimLe,
    tvShows,
    hoatHinh,
    isLoading: latest.isLoading || phimBo.isLoading || phimLe.isLoading || 
               tvShows.isLoading || hoatHinh.isLoading,
    error: latest.error || phimBo.error || phimLe.error || 
           tvShows.error || hoatHinh.error,
  };
}
