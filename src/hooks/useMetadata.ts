import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { metadataService } from '../services/metadataService';

/**
 * Hook to fetch all genres/categories
 */
export function useGenres() {
  return useQuery({
    queryKey: queryKeys.metadata.genres(),
    queryFn: () => metadataService.getCachedGenres(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch all countries
 */
export function useCountries() {
  return useQuery({
    queryKey: queryKeys.metadata.countries(),
    queryFn: () => metadataService.getCachedCountries(),
    staleTime: 30 * 60 * 1000, // 30 minutes  
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get popular genres
 */
export function usePopularGenres() {
  return useQuery({
    queryKey: [...queryKeys.metadata.genres(), 'popular'],
    queryFn: () => metadataService.getPopularGenres(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to get popular countries
 */
export function usePopularCountries() {
  return useQuery({
    queryKey: [...queryKeys.metadata.countries(), 'popular'],
    queryFn: () => metadataService.getPopularCountries(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to find genre by slug
 */
export function useGenreBySlug(slug: string) {
  return useQuery({
    queryKey: [...queryKeys.metadata.genres(), 'bySlug', slug],
    queryFn: () => metadataService.getGenreBySlug(slug),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to find country by slug
 */
export function useCountryBySlug(slug: string) {
  return useQuery({
    queryKey: [...queryKeys.metadata.countries(), 'bySlug', slug],
    queryFn: () => metadataService.getCountryBySlug(slug),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get combined metadata (genres + countries)
 */
export function useMetadata() {
  const genres = useGenres();
  const countries = useCountries();

  return {
    genres: genres.data || [],
    countries: countries.data || [],
    isLoading: genres.isLoading || countries.isLoading,
    error: genres.error || countries.error,
    isSuccess: genres.isSuccess && countries.isSuccess,
  };
}

/**
 * Hook to get navigation metadata (all items for navigation dropdown)
 */
export function useNavigationMetadata() {
  const allGenres = useGenres();
  const allCountries = useCountries();

  return {
    genres: allGenres.data || [],
    countries: allCountries.data || [],
    isLoading: allGenres.isLoading || allCountries.isLoading,
    error: allGenres.error || allCountries.error,
  };
}
