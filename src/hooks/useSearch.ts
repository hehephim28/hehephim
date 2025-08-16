import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '../lib/queryClient';
import { movieService } from '../services/movieService';
import type { SearchParams, ApiResponse, Movie } from '../types/movie';

/**
 * Hook for movie search functionality
 */
export function useSearch(searchParams: SearchParams) {
  return useQuery({
    queryKey: queryKeys.search.results(searchParams),
    queryFn: () => movieService.searchMovies(searchParams),
    enabled: !!(searchParams.keyword && searchParams.keyword.trim().length > 0),
    staleTime: 2 * 60 * 1000, // 2 minutes (search results change frequently)
  });
}

/**
 * Hook for infinite search results (pagination)
 */
export function useInfiniteSearch(baseSearchParams: Omit<SearchParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.search.results({ type: 'infinite', ...baseSearchParams }),
    
    queryFn: ({ pageParam = 1 }) => {
      const searchParams = { ...baseSearchParams, page: pageParam };
      return movieService.searchMovies(searchParams);
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
    
    enabled: !!(baseSearchParams.keyword && baseSearchParams.keyword.trim().length > 0),
  });
}

/**
 * Hook for search suggestions (based on partial input)
 */
export function useSearchSuggestions(
  keyword: string,
  limit: number = 5
) {
  return useQuery({
    queryKey: queryKeys.search.results({ keyword, limit, suggestions: true }),
    queryFn: async () => {
      if (!keyword || keyword.trim().length < 2) {
        return { items: [] };
      }
      
      // Get search results but with smaller limit for suggestions
      const response = await movieService.searchMovies({
        keyword: keyword.trim(),
        limit,
        page: 1,
      });
      
      return response;
    },
    enabled: !!(keyword && keyword.trim().length >= 2),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for managing search history
 */
export function useSearchHistory() {
  const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('searchHistory');
    return stored ? JSON.parse(stored) : [];
  };

  const addToSearchHistory = (keyword: string) => {
    if (typeof window === 'undefined') return;
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword || trimmedKeyword.length < 2) return;
    
    const history = getSearchHistory();
    const updated = [
      trimmedKeyword,
      ...history.filter(k => k !== trimmedKeyword)
    ].slice(0, 10); // Keep only last 10 searches
    
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const removeFromSearchHistory = (keyword: string) => {
    if (typeof window === 'undefined') return;
    const history = getSearchHistory();
    const updated = history.filter(k => k !== keyword);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('searchHistory');
  };

  return {
    history: getSearchHistory(),
    addToHistory: addToSearchHistory,
    removeFromHistory: removeFromSearchHistory,
    clearHistory: clearSearchHistory,
  };
}

/**
 * Hook for popular search terms (mock data - could be from analytics)
 */
export function usePopularSearches() {
  return useQuery({
    queryKey: ['popularSearches'],
    queryFn: async () => {
      // Mock popular searches - in real app this would come from analytics
      return [
        'Squid Game',
        'Attack on Titan',
        'One Piece',
        'Naruto',
        'Demon Slayer',
        'My Hero Academia',
        'Death Note',
        'Dragon Ball',
        'Spirited Away',
        'Your Name',
      ];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook for advanced search with multiple filters
 */
export function useAdvancedSearch(
  baseParams: SearchParams,
  options: {
    enabled?: boolean;
    includeMetadata?: boolean;
  } = {}
) {
  const { enabled = true } = options;

  const searchQuery = useQuery({
    queryKey: queryKeys.search.results({ ...baseParams, advanced: true }),
    queryFn: () => movieService.searchMovies(baseParams),
    enabled: enabled && !!(baseParams.keyword?.trim()),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Get search result statistics
  const searchStats = useMemo(() => {
    const data = searchQuery.data;
    if (!data) return null;

    const { items, pagination } = data;
    if (!items) return null;

    // Analyze results by category, country, year, etc.
    const categoryStats: Record<string, number> = {};
    const countryStats: Record<string, number> = {};
    const yearStats: Record<string, number> = {};

    items.forEach(movie => {
      // Count by categories
      movie.category?.forEach(cat => {
        categoryStats[cat.name] = (categoryStats[cat.name] || 0) + 1;
      });

      // Count by countries
      movie.country?.forEach(country => {
        countryStats[country.name] = (countryStats[country.name] || 0) + 1;
      });

      // Count by year
      if (movie.year) {
        yearStats[movie.year] = (yearStats[movie.year] || 0) + 1;
      }
    });

    return {
      total: pagination?.totalItems || 0,
      currentPage: pagination?.currentPage || 1,
      totalPages: pagination?.totalPages || 1,
      categoryBreakdown: Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      countryBreakdown: Object.entries(countryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      yearBreakdown: Object.entries(yearStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }, [searchQuery.data]);

  return {
    ...searchQuery,
    stats: searchStats,
  };
}
