import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mui/material', '@mui/icons-material'],
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
