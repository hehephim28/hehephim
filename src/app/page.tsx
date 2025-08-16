import type { Metadata } from 'next';
import { HomePage as HomePageComponent } from './home-page-client';
import { WebsiteStructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Hehe Phim - Xem Phim Online Miễn Phí Chất Lượng HD',
  description: 'Website xem phim online miễn phí với chất lượng HD. Phim bộ, phim lẻ, hoạt hình mới nhất 2025. Xem phim không quảng cáo, tốc độ cao.',
  keywords: 'xem phim online, phim HD, phim bộ, phim lẻ, hoạt hình, phim mới 2025, xem phim miễn phí, phim vietsub',
  openGraph: {
    title: 'Hehe Phim - Xem Phim Online Miễn Phí Chất Lượng HD',
    description: 'Website xem phim online miễn phí với chất lượng HD. Phim bộ, phim lẻ, hoạt hình mới nhất 2025.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Hehe Phim',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hehe Phim - Xem Phim Online Miễn Phí Chất Lượng HD',
    description: 'Website xem phim online miễn phí với chất lượng HD. Phim bộ, phim lẻ, hoạt hình mới nhất 2025.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <>
      <WebsiteStructuredData />
      <HomePageComponent />
    </>
  );
}