import { QueryClient } from '@tanstack/react-query';

// Create a client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data will be considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Data will be cached for 10 minutes before garbage collection
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors except 429 (rate limit)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      
      // Don't refetch when reconnecting to the internet
      refetchOnReconnect: 'always',
      
      // Don't refetch on mount if data exists and is not stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations on network errors
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Movie queries
  movies: {
    all: ['movies'] as const,
    lists: () => [...queryKeys.movies.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.movies.lists(), filters] as const,
    details: () => [...queryKeys.movies.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.movies.details(), slug] as const,
  },
  
  // Search queries  
  search: {
    all: ['search'] as const,
    results: (params: Record<string, any>) => [...queryKeys.search.all, params] as const,
  },
  
  // Metadata queries
  metadata: {
    all: ['metadata'] as const,
    genres: () => [...queryKeys.metadata.all, 'genres'] as const,
    countries: () => [...queryKeys.metadata.all, 'countries'] as const,
  },
  
  // Category queries
  categories: {
    all: ['categories'] as const,
    bySlug: (slug: string, filters: Record<string, any>) => 
      [...queryKeys.categories.all, slug, filters] as const,
  },
  
  // Country queries
  countries: {
    all: ['countries'] as const,
    bySlug: (slug: string, filters: Record<string, any>) => 
      [...queryKeys.countries.all, slug, filters] as const,
  },
  
  // Year queries
  years: {
    all: ['years'] as const,
    byYear: (year: number, filters: Record<string, any>) => 
      [...queryKeys.years.all, year, filters] as const,
  },
} as const;

// Utility function to invalidate related queries
export const invalidateMovieQueries = (slug?: string) => {
  if (slug) {
    queryClient.invalidateQueries({ queryKey: queryKeys.movies.detail(slug) });
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
  }
};

// Prefetch popular data
export const prefetchPopularData = async () => {
  // Prefetch latest movies
  queryClient.prefetchQuery({
    queryKey: queryKeys.movies.list({ type: 'latest', page: 1 }),
    queryFn: async () => {
      const { movieService } = await import('../services/movieService');
      return movieService.getLatestMovies(1);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Prefetch metadata
  queryClient.prefetchQuery({
    queryKey: queryKeys.metadata.genres(),
    queryFn: async () => {
      const { metadataService } = await import('../services/metadataService');
      return metadataService.getCachedGenres();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for metadata
  });

  queryClient.prefetchQuery({
    queryKey: queryKeys.metadata.countries(),
    queryFn: async () => {
      const { metadataService } = await import('../services/metadataService');
      return metadataService.getCachedCountries();
    },
    staleTime: 30 * 60 * 1000,
  });
};
