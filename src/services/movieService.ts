import { apiClient } from './apiClient';
import type { 
  Movie, 
  ApiResponse, 
  MovieDetailResponse, 
  SearchParams,
  MovieFilters
} from '../types/movie';

export class MovieService {
  /**
   * Normalize API response to consistent format
   * Handles both Type 1 (flat) and Type 2 (nested) structures
   */
  private normalizeApiResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
    // If response has data wrapper (Type 2), extract items and pagination
    if (response.data && response.data.items) {
      return {
        status: response.status,
        msg: response.msg,
        items: response.data.items,
        pagination: response.data.params?.pagination || {
          totalItems: response.data.items.length,
          totalItemsPerPage: response.data.items.length,
          currentPage: 1,
          totalPages: 1,
        },
      };
    }
    
    // If response has items directly (Type 1), use as is
    if (response.items) {
      return {
        status: response.status,
        msg: response.msg,
        items: response.items,
        pagination: response.pagination || {
          totalItems: response.items.length,
          totalItemsPerPage: response.items.length,
          currentPage: 1,
          totalPages: 1,
        },
      };
    }

    // Fallback - empty response
    return {
      status: response.status || false,
      msg: response.msg || 'No data',
      items: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: 0,
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
  /**
   * Get latest updated movies (Phim mới cập nhật)
   * @param page - Page number (default: 1)
   * @param version - API version (1, 2, or 3) (default: 3)
   */
  async getLatestMovies(page: number = 1, version: number = 3): Promise<ApiResponse<Movie>> {
    const endpoint = version === 1 
      ? `/danh-sach/phim-moi-cap-nhat?page=${page}`
      : `/danh-sach/phim-moi-cap-nhat-v${version}?page=${page}`;
    
    const response = await apiClient.get<ApiResponse<Movie>>(endpoint);
    return this.normalizeApiResponse(response);
  }

  /**
   * Get movies by category/type
   * @param params - Filter parameters
   */
  async getMoviesByCategory(params: MovieFilters): Promise<ApiResponse<Movie>> {
    const {
      type = 'phim-bo',
      page = 1,
      sortField = 'modified.time',
      sortType = 'desc',
      language,
      category,
      country,
      year,
      limit = 20
    } = params;

    const queryParams: Record<string, string | number> = {
      page,
      sort_field: sortField,
      sort_type: sortType,
      limit: Math.min(limit, 64), // API max limit is 64
    };

    // Add optional filters
    if (language) queryParams.sort_lang = language;
    if (category) queryParams.category = category;
    if (country) queryParams.country = country;
    if (year) queryParams.year = year;

    const endpoint = `/v1/api/danh-sach/${type}`;
    const response = await apiClient.get<ApiResponse<Movie>>(endpoint, queryParams);
    return this.normalizeApiResponse(response);
  }

  /**
   * Get movie details by slug
   * @param slug - Movie slug identifier
   */
  async getMovieDetails(slug: string): Promise<MovieDetailResponse> {
    return apiClient.get<MovieDetailResponse>(`/phim/${slug}`);
  }

  /**
   * Search movies with filters
   * @param searchParams - Search parameters
   */
  async searchMovies(searchParams: SearchParams): Promise<ApiResponse<Movie>> {
    const {
      keyword,
      page = 1,
      sort_field = 'modified.time',
      sort_type = 'desc',
      sort_lang,
      category,
      country,
      year,
      limit = 20
    } = searchParams;

    const queryParams: Record<string, string | number> = {
      page,
      sort_field,
      sort_type,
      limit: Math.min(limit, 64),
    };

    if (keyword) queryParams.keyword = keyword;
    if (sort_lang) queryParams.sort_lang = sort_lang;
    if (category) queryParams.category = category;
    if (country) queryParams.country = country;
    if (year) queryParams.year = year;

    const response = await apiClient.get<ApiResponse<Movie>>('/v1/api/tim-kiem', queryParams);
    return this.normalizeApiResponse(response);
  }

  /**
   * Get movies by genre/category slug
   * @param categorySlug - Category slug (e.g., 'hanh-dong', 'kinh-di')
   * @param params - Additional filter parameters
   */
  async getMoviesByGenre(
    categorySlug: string, 
    params: Omit<MovieFilters, 'type' | 'category'> = {}
  ): Promise<ApiResponse<Movie>> {
    const {
      page = 1,
      sortField = 'modified.time',
      sortType = 'desc',
      language,
      country,
      year,
      limit = 20
    } = params;

    const queryParams: Record<string, string | number> = {
      page,
      sort_field: sortField,
      sort_type: sortType,
      limit: Math.min(limit, 64),
    };

    if (language) queryParams.sort_lang = language;
    if (country) queryParams.country = country;
    if (year) queryParams.year = year;

    const response = await apiClient.get<ApiResponse<Movie>>(`/v1/api/the-loai/${categorySlug}`, queryParams);
    return this.normalizeApiResponse(response);
  }

  /**
   * Get movies by country
   * @param countrySlug - Country slug (e.g., 'trung-quoc', 'han-quoc')
   * @param params - Additional filter parameters
   */
  async getMoviesByCountry(
    countrySlug: string, 
    params: Omit<MovieFilters, 'country'> = {}
  ): Promise<ApiResponse<Movie>> {
    const {
      type,
      page = 1,
      sortField = 'modified.time',
      sortType = 'desc',
      language,
      category,
      year,
      limit = 20
    } = params;

    const queryParams: Record<string, string | number> = {
      page,
      sort_field: sortField,
      sort_type: sortType,
      limit: Math.min(limit, 64),
    };

    if (type) queryParams.filterType = type;
    if (language) queryParams.sort_lang = language;
    if (category) queryParams.filterCategory = category;
    if (year) queryParams.year = year;

    const response = await apiClient.get<ApiResponse<Movie>>(`/v1/api/quoc-gia/${countrySlug}`, queryParams);
    return this.normalizeApiResponse(response);
  }

  /**
   * Get movies by year
   * @param year - Release year
   * @param params - Additional filter parameters
   */
  async getMoviesByYear(
    year: number, 
    params: Omit<MovieFilters, 'year'> = {}
  ): Promise<ApiResponse<Movie>> {
    const {
      type,
      page = 1,
      sortField = 'modified.time',
      sortType = 'desc',
      language,
      category,
      country,
      limit = 20
    } = params;

    const queryParams: Record<string, string | number> = {
      page,
      sort_field: sortField,
      sort_type: sortType,
      limit: Math.min(limit, 64),
    };

    if (type) queryParams.filterType = type;
    if (language) queryParams.sort_lang = language;
    if (category) queryParams.filterCategory = category;
    if (country) queryParams.filterCountry = country;

    const response = await apiClient.get<ApiResponse<Movie>>(`/v1/api/nam/${year}`, queryParams);
    return this.normalizeApiResponse(response);
  }

  /**
   * Get movies by specific type with enhanced filtering
   */
  async getPhimBo(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'phim-bo' });
  }

  async getPhimLe(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'phim-le' });
  }

  async getTVShows(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'tv-shows' });
  }

  async getHoatHinh(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'hoat-hinh' });
  }

  async getPhimVietsub(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'phim-vietsub' });
  }

  async getPhimThuyetMinh(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'phim-thuyet-minh' });
  }

  async getPhimLongTieng(params: Omit<MovieFilters, 'type'> = {}): Promise<ApiResponse<Movie>> {
    return this.getMoviesByCategory({ ...params, type: 'phim-long-tieng' });
  }
}

// Export singleton instance
export const movieService = new MovieService();
