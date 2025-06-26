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

  // Exclude test files and specs from pages directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext =>
    process.env.NODE_ENV === 'production' ? !ext.includes('test') && !ext.includes('spec') : true
  ),

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

    // Exclude test files from compilation
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      use: {
        loader: 'ignore-loader',
      },
    });

    return config;
  },
};

module.exports = nextConfig;
