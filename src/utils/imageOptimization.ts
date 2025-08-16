/**
 * Image optimization utilities for better performance and SEO
 */

/**
 * Get original image URL (without WebP conversion)
 * Use this only for debugging or comparison purposes
 */
export const getOriginalImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  // If it's already a full URL, return as is
  if (originalUrl.startsWith('http')) {
    return originalUrl;
  }
  
  // If it's a relative path from the API, construct full URL using phimimg.com domain
  return `https://phimimg.com/${originalUrl}`;
};

/**
 * Get WebP optimized image URL using PhimAPI conversion service
 * This provides 60-80% smaller file sizes compared to original JPG
 */
export const getWebPImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  let fullUrl = originalUrl;
  
  // If it's a relative path from the API, construct full URL using phimimg.com domain
  if (!originalUrl.startsWith('http')) {
    fullUrl = `https://phimimg.com/${originalUrl}`;
  }
  
  // Use PhimAPI's WebP conversion service
  return `https://phimapi.com/image.php?url=${encodeURIComponent(fullUrl)}`;
};

/**
 * Get responsive image URLs for different screen sizes
 * Useful for implementing responsive images with srcset
 */
export const getResponsiveImageUrls = (originalUrl: string) => {
  const webpUrl = getWebPImageUrl(originalUrl);
  const originalFullUrl = getOriginalImageUrl(originalUrl);
  
  return {
    webp: webpUrl,
    original: originalFullUrl,
    // For future: could add different sizes here
    // small: `${webpUrl}&w=300`,
    // medium: `${webpUrl}&w=600`,
    // large: `${webpUrl}&w=1200`,
  };
};

/**
 * Image loading performance metrics
 * Use this to measure the impact of WebP optimization
 */
export const measureImageLoadTime = (imageUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      resolve(loadTime);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Compare loading times between original and WebP images
 * Useful for performance analysis
 */
export const compareImagePerformance = async (originalUrl: string) => {
  try {
    const originalFullUrl = getOriginalImageUrl(originalUrl);
    const webpUrl = getWebPImageUrl(originalUrl);
    
    const [originalTime, webpTime] = await Promise.all([
      measureImageLoadTime(originalFullUrl),
      measureImageLoadTime(webpUrl)
    ]);
    
    const improvement = ((originalTime - webpTime) / originalTime) * 100;
    
    return {
      originalTime: Math.round(originalTime),
      webpTime: Math.round(webpTime),
      improvement: Math.round(improvement),
      savings: improvement > 0 ? `${improvement.toFixed(1)}% faster` : 'No improvement'
    };
  } catch (error) {
    console.error('Error comparing image performance:', error);
    return null;
  }
};

/**
 * Image optimization configuration
 */
export const IMAGE_CONFIG = {
  // Enable/disable WebP optimization globally
  useWebP: true,
  
  // Fallback to original if WebP fails
  fallbackToOriginal: true,
  
  // Lazy loading configuration
  lazyLoading: {
    enabled: true,
    rootMargin: '50px',
    threshold: 0.1
  },
  
  // Error handling
  errorPlaceholder: '/placeholder-movie.jpg',
  
  // Performance monitoring
  enablePerformanceTracking: process.env.NODE_ENV === 'development'
};

/**
 * Enhanced image component props helper
 */
export const getImageProps = (originalUrl: string, alt: string = '') => {
  const optimizedUrl = IMAGE_CONFIG.useWebP ? getWebPImageUrl(originalUrl) : getOriginalImageUrl(originalUrl);
  
  return {
    src: optimizedUrl,
    alt,
    loading: 'lazy' as const,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      if (IMAGE_CONFIG.fallbackToOriginal && IMAGE_CONFIG.useWebP) {
        // Fallback to original if WebP fails
        target.src = getOriginalImageUrl(originalUrl);
      } else {
        // Fallback to placeholder
        target.src = IMAGE_CONFIG.errorPlaceholder;
      }
    }
  };
};
