// Base URL for easy import
export const API_BASE_URL = 'https://phimapi.com';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Movie listings
    LATEST_MOVIES: '/danh-sach/phim-moi-cap-nhat',
    LATEST_MOVIES_V2: '/danh-sach/phim-moi-cap-nhat-v2', 
    LATEST_MOVIES_V3: '/danh-sach/phim-moi-cap-nhat-v3',
    
    // Movie details
    MOVIE_DETAIL: '/phim',
    
    // Comprehensive lists
    MOVIE_LIST: '/v1/api/danh-sach',
    
    // Search
    SEARCH: '/v1/api/tim-kiem',
    
    // Categories and metadata
    GENRES: '/the-loai',
    GENRE_DETAIL: '/v1/api/the-loai',
    COUNTRIES: '/quoc-gia', 
    COUNTRY_DETAIL: '/v1/api/quoc-gia',
    YEAR_DETAIL: '/v1/api/nam',
    
    // Image optimization
    IMAGE_PROXY: '/image.php',
  },
  
  // Movie types
  MOVIE_TYPES: {
    PHIM_BO: 'phim-bo',
    PHIM_LE: 'phim-le', 
    TV_SHOWS: 'tv-shows',
    HOAT_HINH: 'hoat-hinh',
    PHIM_VIETSUB: 'phim-vietsub',
    PHIM_THUYET_MINH: 'phim-thuyet-minh',
    PHIM_LONG_TIENG: 'phim-long-tieng',
  },
  
  // Sort options
  SORT_FIELDS: {
    MODIFIED_TIME: 'modified.time',
    YEAR: 'year',
  },
  
  SORT_TYPES: {
    ASC: 'asc',
    DESC: 'desc',
  },
  
  // Language options
  LANGUAGES: {
    VIETSUB: 'vietsub',
    THUYET_MINH: 'thuyet-minh', 
    LONG_TIENG: 'long-tieng',
  },
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 64,
} as const;

export const APP_CONFIG = {
  NAME: 'Vietnamese Movie Streaming',
  VERSION: '1.0.0',
  DESCRIPTION: 'Modern Vietnamese movie streaming website',
} as const;
