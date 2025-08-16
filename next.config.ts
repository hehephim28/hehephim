import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone for Cloudflare Pages
  output: 'standalone',
  
  // Add trailing slash for better routing
  trailingSlash: false,
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Skip ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize webpack for Cloudflare
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.cache = false;
    }
    return config;
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
  
  // Server external packages for Cloudflare
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
