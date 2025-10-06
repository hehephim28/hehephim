import type { Metadata } from 'next';
import { BrowsePageClient } from './browse-page-client';
import { getTypeTitle } from '@/utils/helpers';
import { movieService } from '@/services/movieService';
import type { MovieType } from '@/types/movie';

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

interface BrowsePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: BrowsePageProps
): Promise<Metadata> {
  const { type } = await params;

  try {
    // Try to get SEO data from API
    const response = await movieService.getMoviesByCategory({ type: type as MovieType, page: 1, limit: 1 });
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
          canonical: `/danh-sach/${type}`,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch SEO data for type:', type, error);
  }

  // Fallback to static metadata
  const title = getTypeTitle(type);
  const description = `Danh sách ${title.toLowerCase()} mới nhất, chất lượng HD. Xem phim online miễn phí.`;

  return {
    title: `${title} - HeHePhim`,
    description,
    openGraph: {
      title: `${title} - HeHePhim`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/danh-sach/${type}`,
    },
  };
}

export default async function BrowsePage({ params, searchParams }: BrowsePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <BrowsePageClient 
      type={resolvedParams.type} 
      initialSearchParams={resolvedSearchParams}
    />
  );
}
