import type { Metadata } from 'next';
import { BrowseGenreClient } from './browse-genre-client';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: GenrePageProps
): Promise<Metadata> {
  const { genre } = await params;
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
