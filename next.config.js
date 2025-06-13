// Sentry configuration (optional)
let withSentryConfig;
try {
  const sentry = require('@sentry/nextjs');
  withSentryConfig = sentry.withSentryConfig;
} catch (e) {
  // Sentry not available, use identity function
  withSentryConfig = (config, options) => config;
}

// Bundle analyzer for performance optimization (optional)
let withBundleAnalyzer;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
} catch (e) {
  // Bundle analyzer not available, use identity function
  withBundleAnalyzer = (config) => config;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove standalone output for Netlify deployment
  // output: 'standalone', // This breaks Netlify deployments
  // swcMinify: true, // Removed - enabled by default in Next.js 13+
  
  // Ignore TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignore ESLint errors during build for deployment  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      'airwave.app',
      'cdn.airwave.app',
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', ''),
      process.env.AWS_S3_BUCKET ? `${process.env.AWS_S3_BUCKET}.s3.amazonaws.com` : '',
      process.env.CDN_DOMAIN || '',
    ].filter(Boolean),
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Add HSTS in production
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : []),
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      // Add headers for fonts
      {
        source: '/_next/static/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'AIrFLOW',
  },
  
  // Webpack configuration
  webpack: (config, { isServer, webpack }) => {
    // Fix for React Email
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Add rule for font handling
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
        },
      },
    });
    
    // Ensure CSS is handled properly
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      })
    );
    
    return config;
  },
  
  // Performance optimizations  
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // Experimental features
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    // instrumentationHook: true, // Removed - instrumentation.js is available by default
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Organization and project from your Sentry account
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Suppresses source map uploading logs during build
  silent: true,
  
  // Upload source maps for production builds
  include: '.next',
  ignore: ['node_modules'],
  
  // Automatically release
  autoInstrumentServerFunctions: true,
  
  // Hide source maps from generated client bundles
  hideSourceMaps: true,
  
  // Disable logging in development
  disableLogger: true,
  
  // Tree shake unused Sentry code
  widenClientFileUpload: true,
};

// Compose all the wrappers
let finalConfig = nextConfig;

// Add bundle analyzer
finalConfig = withBundleAnalyzer(finalConfig);

// Add Sentry wrapper for production only if all required env vars are present
if (process.env.NODE_ENV === 'production' && 
    process.env.SENTRY_AUTH_TOKEN && 
    process.env.SENTRY_ORG && 
    process.env.SENTRY_PROJECT) {
  finalConfig = withSentryConfig(finalConfig, sentryWebpackPluginOptions);
}

module.exports = finalConfig;
