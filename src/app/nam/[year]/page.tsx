import type { Metadata } from 'next';
import { BrowseYearClient } from './browse-year-client';

interface YearPageProps {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: YearPageProps
): Promise<Metadata> {
  const { year } = await params;
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
