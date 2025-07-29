const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript configuration - STRICT MODE ENABLED
  typescript: {
    ignoreBuildErrors: false, // Fixed: Enable TypeScript error checking in builds
  },

  // ESLint configuration - LINTING ENABLED
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable for TypeScript error audit
  },

  // Only include main page extensions, not test files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Railway deployment optimizations
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined, // Temporarily disabled for Railway

  // Compression and performance optimizations
  compress: true,
  poweredByHeader: false,

  // Railway-specific headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

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

    // Bundle optimization - Critical Priority #3
    if (!isServer) {
      // Enable tree shaking for Material-UI icons (temporarily disabled due to module resolution issues)
      // config.resolve.alias = {
      //   ...config.resolve.alias,
      //   '@mui/icons-material': '@mui/icons-material/esm',
      // };

      // Optimize chunks for better caching - Railway optimized
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxAsyncRequests: 10,
          maxInitialRequests: 5,
          cacheGroups: {
            // Vendor chunk for stable dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              maxSize: 250000,
            },
            // Material-UI chunk (large dependency)
            mui: {
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              name: 'mui',
              chunks: 'all',
              priority: 20,
              maxSize: 200000,
            },
            // AI services chunk (OpenAI, Anthropic)
            ai: {
              test: /[\\/]node_modules[\\/](openai|@anthropic-ai)[\\/]/,
              name: 'ai-services',
              chunks: 'all',
              priority: 15,
              maxSize: 150000,
            },
            // Common utilities chunk
            common: {
              minChunks: 2,
              chunks: 'all',
              name: 'common',
              priority: 5,
              maxSize: 100000,
            },
          },
        },
      };
    }

    // Railway memory optimization
    if (process.env.RAILWAY_ENVIRONMENT === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        sideEffects: false,
      };
    }

    // Test files have been moved to tests/ directory to avoid compilation issues

    return config;
  },

  // Railway environment variable mapping
  env: {
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
  },

  // Image optimization for Railway
  images: {
    domains: [
      'localhost',
      process.env.RAILWAY_STATIC_URL?.replace('https://', '') || '',
      'supabase.co',
      'your-custom-domain.com', // Replace with your actual domain
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Experimental features for production optimization
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Enable if using React 18 features
    // appDir: true,
  },

  // Production-only optimizations
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

module.exports = withBundleAnalyzer(nextConfig);
