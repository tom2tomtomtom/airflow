// Static asset compression middleware
const compression = require('compression');

module.exports = {
  // Enable compression for all responses
  compress: true,
  
  // Compression options
  compression: {
    threshold: 1024, // Only compress files larger than 1KB
    level: 6, // Compression level (1-9)
    chunkSize: 1024,
    windowBits: 15,
    memLevel: 8,
  },
  
  // Brotli compression for modern browsers
  brotliOptions: {
    level: 4,
    chunkSize: 1024,
  }
};
