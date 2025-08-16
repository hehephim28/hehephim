import type { Metadata } from "next";
import "./globals.css";
import "../styles.css";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "Hehe Phim - Xem Phim Online Miễn Phí",
  description: "Website xem phim online miễn phí với chất lượng HD. Phim bộ, phim lẻ, hoạt hình, TV shows cập nhật mới nhất.",
  keywords: "xem phim online, phim HD, phim bộ, phim lẻ, hoạt hình, TV shows",
  authors: [{ name: "Hehe Phim Team" }],
  creator: "Hehe Phim",
  publisher: "Hehe Phim",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thaihoc285.site'),
  openGraph: {
    title: "Hehe Phim - Xem Phim Online Miễn Phí",
    description: "Website xem phim online miễn phí với chất lượng HD",
    type: "website",
    locale: "vi_VN",
    siteName: "Hehe Phim",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hehe Phim - Xem Phim Online Miễn Phí",
    description: "Website xem phim online miễn phí với chất lượng HD",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}