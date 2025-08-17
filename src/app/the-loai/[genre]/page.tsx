import type { Metadata } from 'next';
import { BrowseGenreClient } from './browse-genre-client';
import { movieService } from '@/services/movieService';

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: GenrePageProps
): Promise<Metadata> {
  const { genre } = await params;

  try {
    // Try to get SEO data from API
    const response = await movieService.getMoviesByGenre(genre, { page: 1, limit: 1 });
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
          canonical: `/the-loai/${genre}`,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch SEO data for genre:', genre, error);
  }

  // Fallback to static metadata
  const title = `Phim thể loại ${genre}`;
  const description = `Danh sách phim thể loại ${genre} mới nhất, chất lượng HD. Xem phim online miễn phí.`;

  return {
    title: `${title} - Hehe Phim`,
    description,
    openGraph: {
      title: `${title} - Hehe Phim`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/the-loai/${genre}`,
    },
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <BrowseGenreClient 
      genre={resolvedParams.genre} 
      initialSearchParams={resolvedSearchParams}
    />
  );
}
