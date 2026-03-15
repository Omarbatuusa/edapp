import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // Proxy /v1/* to the NestJS backend.
    // In production nginx handles this, but in dev there's no reverse proxy.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/v1';
    return [
      {
        source: '/v1/:path*',
        destination: `${apiUrl.replace(/\/v1$/, '')}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
