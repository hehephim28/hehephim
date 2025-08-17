import type { Metadata } from 'next';
import { BrowseYearClient } from './browse-year-client';
import { movieService } from '@/services/movieService';

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

interface YearPageProps {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: YearPageProps
): Promise<Metadata> {
  const { year } = await params;

  try {
    // Try to get SEO data from API
    const response = await movieService.getMoviesByYear(parseInt(year), { page: 1, limit: 1 });
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
          canonical: `/nam/${year}`,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch SEO data for year:', year, error);
  }

  // Fallback to static metadata
  const title = `Phim năm ${year}`;
  const description = `Danh sách phim phát hành năm ${year} chất lượng HD. Xem phim online miễn phí.`;

  return {
    title: `${title} - Hehe Phim`,
    description,
    openGraph: {
      title: `${title} - Hehe Phim`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/nam/${year}`,
    },
  };
}

export default async function YearPage({ params, searchParams }: YearPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <BrowseYearClient 
      year={resolvedParams.year} 
      initialSearchParams={resolvedSearchParams}
    />
  );
}
