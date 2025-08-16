import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone for Cloudflare Pages with Next.js runtime
  output: 'standalone',
  
  // Skip ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization - disable for Cloudflare
  images: {
    unoptimized: true,
    domains: [
      'phimimg.com',        // CDN images từ API
      'phimapi.com',        // API domain chính  
      'player.phimapi.com', // Video player
      's4.phim1280.tv',     // Streaming domain
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://hehephim.online',
  },
};

export default nextConfig;
