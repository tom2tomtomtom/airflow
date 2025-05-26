/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ESLint configuration - enforce in production
  eslint: {
    // Run ESLint during builds to catch errors
    ignoreDuringBuilds: false,
    // Directories to run ESLint on
    dirs: ['src', 'pages', 'components', 'lib', 'utils'],
  },
  
  // TypeScript configuration - enforce in production
  typescript: {
    // Fail the build on TypeScript errors
    ignoreBuildErrors: false,
  },
  
  // Redirects for old or incorrect URLs
  async redirects() {
    return [
      {
        source: '/templates-new',
        destination: '/templates',
        permanent: true,
      },
      {
        source: '/create-client',
        has: [
          {
            type: 'query',
            key: 'first',
            value: 'true',
          },
        ],
        destination: '/create-client',
        permanent: true,
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ]
      }
    ];
  },
  
  // Environment variables accessible in the browser
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
  },
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      // Add your Supabase storage domain
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0] + '.supabase.co',
      // Add other allowed image domains
      'images.unsplash.com', // If using Unsplash
      'avatars.githubusercontent.com', // If showing GitHub avatars
    ].filter(Boolean),
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      // Enable webpack optimizations
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        minimize: true,
      };
    }
    
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        os: false,
        path: false,
      };
    }
    
    // Add bundle analyzer in development
    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: true,
        })
      );
    }
    
    return config;
  },
  
  // Production build output
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  
  // Experimental features
  experimental: {
    // Enable new app directory (if using Next.js 13+)
    // appDir: true,
    // Optimize CSS
    optimizeCss: true,
    // Enable SWC plugins
    swcPlugins: [],
  },
};

module.exports = nextConfig;
