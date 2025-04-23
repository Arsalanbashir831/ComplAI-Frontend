import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      '127.0.0.1',
      'example.com',
      'images.unsplash.com',
      'api.compl-ai.co.uk',
    ],
  },
};

export default nextConfig;
