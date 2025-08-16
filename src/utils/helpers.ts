/**
 * Format year for display
 */
export const formatYear = (year: number): string => {
  return year.toString();
};

/**
 * Format episode current text
 */
export const formatEpisodeCurrent = (episodeCurrent: string): string => {
  if (!episodeCurrent) return '';
  
  if (episodeCurrent.includes('/')) {
    const [current, total] = episodeCurrent.split('/');
    return `Tập ${current}/${total}`;
  }
  
  return episodeCurrent.includes('Tập') ? episodeCurrent : `Tập ${episodeCurrent}`;
};

/**
 * Get optimized image URL 
 */
export const getOptimizedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  // If it's already a full URL, return as is
  if (originalUrl.startsWith('http')) {
    return originalUrl;
  }
  
  // If it's a relative path from the API, construct full URL using phimimg.com domain
  return `https://phimimg.com/${originalUrl}`;
};

/**
 * Format movie duration
 */
export const formatDuration = (time: string): string => {
  if (!time) return '';
  return time.includes('phút') ? time : `${time} phút`;
};

/**
 * Generate movie URL slug
 */
export const generateMovieUrl = (slug: string): string => {
  return `/phim/${slug}`;
};

/**
 * Generate category URL slug
 */
export const generateCategoryUrl = (slug: string): string => {
  return `/the-loai/${slug}`;
};

/**
 * Generate country URL slug  
 */
export const generateCountryUrl = (slug: string): string => {
  return `/quoc-gia/${slug}`;
};

/**
 * Generate year URL slug
 */
export const generateYearUrl = (year: number): string => {
  return `/nam/${year}`;
};

/**
 * Generate search URL with params
 */
export const generateSearchUrl = (keyword: string, filters?: Record<string, any>): string => {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
  }
  
  return `/tim-kiem?${params.toString()}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

/**
 * Get movie quality badge color
 */
export const getQualityBadgeColor = (quality: string): string => {
  const normalizedQuality = quality?.toLowerCase() || '';
  
  if (normalizedQuality.includes('hd') || normalizedQuality.includes('1080')) {
    return 'bg-green-600';
  }
  if (normalizedQuality.includes('4k') || normalizedQuality.includes('uhd')) {
    return 'bg-purple-600';
  }
  if (normalizedQuality.includes('cam') || normalizedQuality.includes('ts')) {
    return 'bg-red-600';
  }
  
  return 'bg-blue-600';
};

/**
 * Get language badge color
 */
export const getLanguageBadgeColor = (lang: string): string => {
  const normalizedLang = lang?.toLowerCase() || '';
  
  if (normalizedLang.includes('vietsub')) {
    return 'bg-blue-600';
  }
  if (normalizedLang.includes('thuyết minh') || normalizedLang.includes('thuyet-minh')) {
    return 'bg-green-600';
  }
  if (normalizedLang.includes('lồng tiếng') || normalizedLang.includes('long-tieng')) {
    return 'bg-orange-600';
  }
  
  return 'bg-gray-600';
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'vừa xong';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} tuần trước`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};

/**
 * Get type title for navigation
 */
export const getTypeTitle = (type: string): string => {
  const typeMap: Record<string, string> = {
    'phim-moi-cap-nhat': 'Phim Mới Cập Nhật',
    'phim-bo': 'Phim Bộ',
    'phim-le': 'Phim Lẻ',
    'tv-shows': 'TV Shows',
    'hoat-hinh': 'Hoạt Hình',
    'phim-vietsub': 'Phim Vietsub',
    'phim-thuyet-minh': 'Phim Thuyết Minh',
    'phim-long-tieng': 'Phim Lồng Tiếng',
  };
  
  return typeMap[type] || 'Phim';
};
