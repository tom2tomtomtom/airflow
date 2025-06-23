const { DefinePlugin } = require('webpack');

module.exports = {
  // Production optimizations
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
    
    // Module concatenation
    concatenateModules: true,
    
    // Remove empty chunks
    removeEmptyChunks: true,
    
    // Merge duplicate chunks
    mergeDuplicateChunks: true,
    
    // Split chunks configuration
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
        },
        // Framework chunks
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
          priority: 15,
        },
        // Icon libraries
        icons: {
          test: /[\\/]node_modules[\\/](lucide-react|@mui\/icons-material)[\\/]/,
          name: 'icons',
          chunks: 'all',
          priority: 12,
        },
        // Utilities
        utils: {
          test: /[\\/]node_modules[\\/](date-fns|lodash|zod)[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 8,
        },
      },
    },
  },
  
  // Define plugin for environment variables
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
  ],
  
  // Module resolution optimizations
  resolve: {
    // Tree shaking friendly imports
    mainFields: ['browser', 'module', 'main'],
    
    // Alias for better tree shaking
    alias: {
      // Optimize Material-UI imports
      '@mui/material': '@mui/material/index.js',
      '@mui/icons-material': '@mui/icons-material/index.js',
      
      // Optimize date-fns imports
      'date-fns': 'date-fns/index.js',
      
      // Optimize lodash imports
      'lodash': 'lodash-es',
    },
  },
  
  // Module rules
  module: {
    rules: [
      // Ignore moment.js locales
      {
        test: /moment[\/\\]locale$/,
        loader: 'ignore-loader',
      },
    ],
  },
};
