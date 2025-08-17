import type { Metadata } from "next";
import "./globals.css";
import "../styles.css";
import { Providers } from './providers';

// Runtime configuration for Cloudflare Pages
// export const runtime = 'edge';

export const metadata: Metadata = {
  title: "Hehe Phim - Xem Phim Online Miễn Phí",
  description: "Website xem phim online miễn phí với chất lượng HD. Phim bộ, phim lẻ, hoạt hình, TV shows cập nhật mới nhất.",
  keywords: "xem phim online, phim HD, phim bộ, phim lẻ, hoạt hình, TV shows",
  authors: [{ name: "Hehe Phim Team" }],
  creator: "Hehe Phim",
  publisher: "Hehe Phim",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hehephim.online'),
  openGraph: {
    title: "Hehe Phim - Xem Phim Online Miễn Phí",
    description: "Website xem phim online miễn phí với chất lượng HD",
    type: "website",
    locale: "vi_VN",
    siteName: "Hehe Phim",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hehe Phim Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hehe Phim - Xem Phim Online Miễn Phí",
    description: "Website xem phim online miễn phí với chất lượng HD",
    images: ['/logo.png'],
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HeHePhim" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-navbutton-color" content="#0f172a" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}