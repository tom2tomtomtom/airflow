/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Bundle optimization for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lucide-react',
      'lodash',
      'date-fns',
    ],
  },

  pageExtensions: ['tsx', 'ts', 'jsx', 'js']
    .map(ext => {
      return process.env.NODE_ENV === 'production' ? ext : `${ext}`;
    })
    .filter(ext => !ext.includes('test') && !ext.includes('spec')),

  webpack: (config, { isServer, dev }) => {
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

    // Production optimizations for bundle size reduction
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Improved code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 20,
          },
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|@mui\/icons-material)[\\/]/,
            name: 'icons',
            chunks: 'async',
            priority: 15,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 25,
          },
        },
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      ioredis: false,
      // Use ESM versions for better tree shaking
      '@mui/icons-material': '@mui/icons-material/esm',
      lodash: 'lodash-es',
    };

    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      use: 'ignore-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
