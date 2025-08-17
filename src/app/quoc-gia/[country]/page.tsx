import type { Metadata } from 'next';
import { BrowseCountryClient } from './browse-country-client';
import { movieService } from '@/services/movieService';

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

interface CountryPageProps {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: CountryPageProps
): Promise<Metadata> {
  const { country } = await params;

  try {
    // Try to get SEO data from API
    const response = await movieService.getMoviesByCountry(country, { page: 1, limit: 1 });
    const seoData = response.data?.seoOnPage;

    if (seoData) {
      return {
        title: seoData.titleHead,
        description: seoData.descriptionHead,
        openGraph: {
          title: seoData.titleHead,
          description: seoData.descriptionHead,
          type: seoData.og_type as any,
          images: seoData.og_image?.map(img => ({
            url: `https://phimimg.com${img}`,
            width: 800,
            height: 600,
          })) || [],
        },
        twitter: {
          card: 'summary_large_image',
          title: seoData.titleHead,
          description: seoData.descriptionHead,
          images: seoData.og_image?.map(img => `https://phimimg.com${img}`) || [],
        },
        alternates: {
          canonical: `/quoc-gia/${country}`,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch SEO data for country:', country, error);
  }

  // Fallback to static metadata
  const title = `Phim quốc gia ${country}`;
  const description = `Danh sách phim xuất xứ từ ${country} mới nhất, chất lượng HD. Xem phim online miễn phí.`;

  return {
    title: `${title} - Hehe Phim`,
    description,
    openGraph: {
      title: `${title} - Hehe Phim`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/quoc-gia/${country}`,
    },
  };
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <BrowseCountryClient 
      country={resolvedParams.country} 
      initialSearchParams={resolvedSearchParams}
    />
  );
}
