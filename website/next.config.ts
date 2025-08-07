import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.watch-anime.fr',
        pathname: '/img/anime/**',
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/_next/image',
        destination: '/_next/image',
        has: [
          {
            type: 'query',
            key: 'url',
            value: '(?<url>.*)',
          },
        ],
      },
    ]
  },
};

export default nextConfig;