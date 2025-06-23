/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration - ignore errors for build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration - ignore during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Exclude test files from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Basic image optimization
  images: {
    domains: ['localhost', 'airwave.app', 'cdn.airwave.app'],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'AIrWAVE',
  },

  // Minimal webpack config to avoid conflicts
  webpack: (config, { isServer }) => {
    // Fix for Node.js modules in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        stream: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        child_process: false,
        cluster: false,
        os: false,
        url: false,
        querystring: false,
        util: false,
        buffer: false,
        events: false,
      };
    }

    // Ignore ioredis on client side
    config.resolve.alias = {
      ...config.resolve.alias,
      ioredis: false,
    };

    return config;
  },
};

module.exports = nextConfig;
