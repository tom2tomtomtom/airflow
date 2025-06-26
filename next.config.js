/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Only include main page extensions, not test files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Basic webpack configuration for client-side only
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
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

    // Test files have been moved to tests/ directory to avoid compilation issues

    return config;
  },
};

module.exports = nextConfig;
