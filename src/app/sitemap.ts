import { MetadataRoute } from 'next';
import { movieService } from '@/services/movieService';

// Required for static export
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get domain from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hehephim.online';
  
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
    // Get recent movies from specific countries with different limits
    const targetCountries = [
      { slug: 'han-quoc', limit: 25 },   // Hàn Quốc: 25 phim
      { slug: 'trung-quoc', limit: 25 }, // Trung Quốc: 25 phim  
      { slug: 'au-my', limit: 25 },      // Âu Mỹ: 25 phim
      { slug: 'viet-nam', limit: 5 }     // Việt Nam: 5 phim
    ];
    const currentYear = new Date().getFullYear();
    const moviePages: MetadataRoute.Sitemap = [];

    // Get movies from each target country for recent years
    for (const country of targetCountries) {
      try {
        // Get movies from this country, prioritize recent years (current year and previous year)
        for (let year = currentYear; year >= currentYear - 1; year--) {
          const countryMovies = await movieService.getMoviesByCountry(country.slug, { 
            page: 1, 
            limit: Math.ceil(country.limit / 2), // Split limit across 2 years
            year: year
          });
          
          if (countryMovies.items) {
            const countryMoviePages = countryMovies.items.map(movie => ({
              url: `${baseUrl}/phim/${movie.slug}`,
              lastModified: new Date(movie.modified?.time || Date.now()),
              changeFrequency: 'weekly' as const,
              priority: year === currentYear ? 0.8 : 0.6, // Higher priority for current year
            }));
            moviePages.push(...countryMoviePages);
          }
        }
      } catch (countryError) {
        console.error(`Error fetching movies for country ${country.slug}:`, countryError);
        continue;
      }
    }

    // Fallback: if no movies found, get latest movies and filter manually
    if (moviePages.length === 0) {
      const recentMovies = await movieService.getLatestMovies(1, 3);
      const targetCountrySlugs = targetCountries.map(c => c.slug);
      const filteredMovies = recentMovies.items?.filter(movie => {
        if (!movie.country || !Array.isArray(movie.country)) return false;
        return movie.country.some(countryObj => 
          targetCountrySlugs.includes(countryObj.slug)
        );
      }).slice(0, 50) || [];

      moviePages.push(...filteredMovies.map(movie => ({
        url: `${baseUrl}/phim/${movie.slug}`,
        lastModified: new Date(movie.modified?.time || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })));
    }

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
