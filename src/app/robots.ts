import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Get domain from environment or use default
  const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://thaihoc285.site';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: `${domain}/sitemap.xml`,
  };
}
