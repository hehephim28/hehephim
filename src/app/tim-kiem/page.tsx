import type { Metadata } from 'next';
import { SearchPageClient } from './search-page-client';

// Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { searchParams }: SearchPageProps
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const keyword = resolvedSearchParams.keyword as string || '';
  
  const title = keyword 
    ? `Tìm kiếm "${keyword}" - Hehe Phim`
    : 'Tìm kiếm phim - Hehe Phim';
  
  const description = keyword
    ? `Kết quả tìm kiếm cho "${keyword}". Xem phim online miễn phí chất lượng HD.`
    : 'Tìm kiếm phim yêu thích của bạn. Hàng ngàn bộ phim chất lượng HD miễn phí.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/tim-kiem`,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <SearchPageClient initialSearchParams={resolvedSearchParams} />
  );
}
