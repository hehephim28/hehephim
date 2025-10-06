import type { Metadata } from 'next';
import { movieService } from '@/services/movieService';
import { MovieDetailClient } from './movie-detail-client';
import { notFound } from 'next/navigation';
import type { MovieDetail } from '@/types/movie';
import { MovieStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { getOptimizedImageUrl } from '@/utils/helpers';

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge';
// Revalidate every 6 hours for fresh content
export const revalidate = 21600;

interface MovieDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: MovieDetailPageProps
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const movieData = await movieService.getMovieDetails(slug);
    
    if (!movieData?.movie) {
      return {
        title: 'Không tìm thấy phim - HeHePhim',
        description: 'Phim bạn đang tìm kiếm không tồn tại.',
      };
    }

    const movie = movieData.movie;
    const title = `${movie.name} (${movie.year}) - Xem phim online miễn phí`;
    const description = movie.content 
      ? movie.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...'
      : `Xem phim ${movie.name} (${movie.origin_name}) năm ${movie.year} chất lượng HD miễn phí.`;
    
    const keywords = [
      movie.name,
      movie.origin_name,
      `phim ${movie.year}`,
      'xem phim online',
      'phim HD',
      ...movie.category?.map(cat => cat.name) || [],
      ...movie.country?.map(country => country.name) || [],
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'video.movie',
        locale: 'vi_VN',
        siteName: 'HeHePhim',
        images: [
          {
            url: getOptimizedImageUrl(movie.poster_url || ''),
            width: 800,
            height: 1200,
            alt: movie.name,
          },
          {
            url: getOptimizedImageUrl(movie.thumb_url || movie.poster_url || ''),
            width: 1280,
            height: 720,
            alt: `${movie.name} backdrop`,
          },
        ],
        releaseDate: movie.year ? `${movie.year}-01-01` : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [getOptimizedImageUrl(movie.poster_url || '')],
      },
      alternates: {
        canonical: `/phim/${slug}`,
      },
      other: {
        'movie:release_date': movie.year ? `${movie.year}-01-01` : '',
        'movie:duration': movie.time || '',
        'movie:genre': movie.category?.map(cat => cat.name).join(', ') || '',
        'movie:director': movie.director?.join(', ') || '',
        'movie:actor': movie.actor?.join(', ') || '',
      },
    };
  } catch (error) {
    return {
      title: 'Lỗi tải phim - HeHePhim',
      description: 'Có lỗi xảy ra khi tải thông tin phim.',
    };
  }
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  try {
    const { slug } = await params;
    console.log('🎬 Loading movie with slug:', slug);
    
    const movieData = await movieService.getMovieDetails(slug);
    console.log('📝 Movie data received:', !!movieData?.movie);

    if (!movieData?.movie) {
      console.log('❌ Movie not found for slug:', slug);
      notFound();
    }

    const movie = movieData.movie;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hehephim.online';
    const movieUrl = `${baseUrl}/phim/${slug}`;

    const breadcrumbItems = [
      { name: 'Trang chủ', url: baseUrl },
      { name: movie.name, url: movieUrl }
    ];

    return (
      <>
        <MovieStructuredData movie={movie} url={movieUrl} />
        <BreadcrumbStructuredData items={breadcrumbItems} />
        <MovieDetailClient initialData={movieData} slug={slug} />
      </>
    );
  } catch (error) {
    console.error('💥 Error loading movie:', error);
    notFound();
  }
}
