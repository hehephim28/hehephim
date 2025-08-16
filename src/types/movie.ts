export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  status: string;
  type: string;
  sub_docquyen?: boolean;
  chieurap?: boolean;
  time?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  notify?: string;
  showTimeText?: string;
  view?: number;
  category: Category[];
  country: Country[];
  modified: {
    time: string;
  };
}

export interface MovieDetail extends Movie {
  content?: string;
  trailer_url?: string;
  episode_total?: string;
  episodes: Episode[];
  actor?: string[];
  director?: string[];
  view?: number;
  showtimes?: string;
  tmdb?: {
    type: string;
    id: string;
    season?: number | null;
    vote_average: number;
    vote_count: number;
  };
  imdb?: {
    id: string | null;
  };
  created?: {
    time: string;
  };
}

export interface Episode {
  server_name: string;
  server_data: EpisodeData[];
}

export interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Country {
  _id: string;
  name: string;
  slug: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  status: boolean;
  msg: string;
  items?: T[]; // Type 1 (Flat) structure - Latest movies
  data?: {    // Type 2 (Nested) structure - Categories/Search
    items: T[];
    seoOnPage?: SeoData;
    breadCrumb?: BreadCrumb[];
    titlePage?: string;
    params?: {
      pagination?: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
  };
  pagination?: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: MovieDetail;
  episodes: Episode[];
}

export interface SeoData {
  og_type: string;
  titleHead: string;
  descriptionHead: string;
  og_image: string[];
  updated_time: number;
}

export interface BreadCrumb {
  name: string;
  slug?: string;
  isCurrent?: boolean;
}

export interface SearchParams {
  keyword?: string;
  page?: number;
  sort_field?: string;
  sort_type?: string;
  sort_lang?: string;
  category?: string;
  country?: string;
  year?: string | number;
  limit?: number;
  type_list?: string;
}

// Genres API returns array directly
export type GenreResponse = Category[];

// Countries API returns array directly  
export type CountryResponse = Country[];

// Utility types for better type safety
export type MovieType = 
  | 'phim-bo' 
  | 'phim-le' 
  | 'tv-shows' 
  | 'hoat-hinh' 
  | 'phim-vietsub' 
  | 'phim-thuyet-minh' 
  | 'phim-long-tieng';

export type SortField = 'modified.time' | '_id' | 'year';
export type SortType = 'asc' | 'desc';
export type Language = 'vietsub' | 'thuyet-minh' | 'long-tieng';

export interface MovieFilters {
  type?: MovieType;
  category?: string;
  country?: string;
  year?: number;
  language?: Language;
  sortField?: SortField;
  sortType?: SortType;
  page?: number;
  limit?: number;
}
