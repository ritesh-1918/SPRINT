
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Required for static export
  basePath: '/ClimaSpace', // Set to your repository name
  images: {
    unoptimized: true, // Required for next export with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // allowedDevOrigins is for development and not needed for GitHub Pages deployment
};

export default nextConfig;
