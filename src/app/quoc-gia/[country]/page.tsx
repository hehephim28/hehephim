import type { Metadata } from 'next';
import { BrowseCountryClient } from './browse-country-client';

interface CountryPageProps {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: CountryPageProps
): Promise<Metadata> {
  const { country } = await params;
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
