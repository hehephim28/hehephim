import type { Metadata } from 'next';
import { BrowsePageClient } from './browse-page-client';
import { getTypeTitle } from '@/utils/helpers';

interface BrowsePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: BrowsePageProps
): Promise<Metadata> {
  const { type } = await params;
  const title = getTypeTitle(type);
  const description = `Danh sách ${title.toLowerCase()} mới nhất, chất lượng HD. Xem phim online miễn phí.`;

  return {
    title: `${title} - Hehe Phim`,
    description,
    openGraph: {
      title: `${title} - Hehe Phim`,
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
