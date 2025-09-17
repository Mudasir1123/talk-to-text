/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Suitable for Vercel
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://talktotext-production.up.railway.app/api/:path*', // Proxy API calls to backend
      },
    ];
  },
};

export default nextConfig;