import { MetadataRoute } from 'next';
import { movieService } from '@/services/movieService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get domain from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thaihoc285.site';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tim-kiem`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [
    'phim-bo',
    'phim-le',
    'hoat-hinh',
    'tv-shows'
  ].map(type => ({
    url: `${baseUrl}/danh-sach/${type}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Genre pages
  const genrePages: MetadataRoute.Sitemap = [
    'hanh-dong',
    'tinh-cam',
    'hai-huoc',
    'kinh-di',
    'phieu-luu',
    'khoa-hoc-vien-tuong',
    'chien-tranh',
    'the-thao',
    'am-nhac',
    'gia-dinh',
    'hoc-duong',
    'co-trang',
    'than-thoai',
    'tai-lieu',
    'chinh-kich',
    'bi-an',
    'hinh-su',
    'vo-thuat',
    'lich-su'
  ].map(genre => ({
    url: `${baseUrl}/the-loai/${genre}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Country pages
  const countryPages: MetadataRoute.Sitemap = [
    'trung-quoc',
    'han-quoc',
    'nhat-ban',
    'thai-lan',
    'au-my',
    'anh',
    'phap',
    'hong-kong',
    'an-do',
    'viet-nam'
  ].map(country => ({
    url: `${baseUrl}/quoc-gia/${country}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Year pages
  const currentYear = new Date().getFullYear();
  const yearPages: MetadataRoute.Sitemap = [];
  for (let year = currentYear; year >= currentYear - 10; year--) {
    yearPages.push({
      url: `${baseUrl}/nam/${year}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    });
  }

  try {
    // Get recent movies for dynamic pages
    const recentMovies = await movieService.getLatestMovies({ page: 1, limit: 100 });
    const moviePages: MetadataRoute.Sitemap = recentMovies.items?.map(movie => ({
      url: `${baseUrl}/phim/${movie.slug}`,
      lastModified: new Date(movie.modified?.time || Date.now()),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })) || [];

    return [
      ...staticPages,
      ...categoryPages,
      ...genrePages,
      ...countryPages,
      ...yearPages,
      ...moviePages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if API fails
    return [
      ...staticPages,
      ...categoryPages,
      ...genrePages,
      ...countryPages,
      ...yearPages,
    ];
  }
}
