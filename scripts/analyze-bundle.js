#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the Next.js bundle and provides optimization recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting bundle analysis...\n');

// Check if build exists
const buildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildDir)) {
  console.log('❌ No build found. Running build first...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run bundle analyzer
console.log('🔍 Analyzing bundle size...');
try {
  execSync('npm run build:analyze', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Bundle analyzer not configured. Setting up...');

  // Check if @next/bundle-analyzer is installed
  try {
    require.resolve('@next/bundle-analyzer');
  } catch {
    console.log('📦 Installing @next/bundle-analyzer...');
    execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' });
  }

  // Update next.config.js
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    console.log('⚙️  Updating next.config.js...');
    let config = fs.readFileSync(nextConfigPath, 'utf8');

    if (!config.includes('@next/bundle-analyzer')) {
      const analyzerConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

`;

      // Add analyzer import at the top
      config = analyzerConfig + config;

      // Wrap the config export
      config = config.replace(
        /module\.exports\s*=\s*(.+)/,
        'module.exports = withBundleAnalyzer($1)'
      );

      fs.writeFileSync(nextConfigPath, config);
      console.log('✅ Updated next.config.js with bundle analyzer');
    }
  }
}

// Analyze build output
console.log('\n📊 Build Analysis:');

try {
  const buildManifest = path.join(buildDir, 'build-manifest.json');
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));

    console.log('\n📄 Pages:');
    Object.keys(manifest.pages).forEach(page => {
      const files = manifest.pages[page];
      console.log(`  ${page}: ${files.length} files`);
    });
  }

  // Check for large files
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    console.log('\n📁 Large Static Files (>100KB):');

    function checkDirectory(dir, prefix = '') {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          checkDirectory(filePath, prefix + file + '/');
        } else if (stat.size > 100 * 1024) {
          // 100KB
          const sizeKB = Math.round(stat.size / 1024);
          console.log(`  ${prefix}${file}: ${sizeKB}KB`);
        }
      });
    }

    checkDirectory(staticDir);
  }
} catch (error) {
  console.log('⚠️  Could not analyze build output:', error.message);
}

// Performance recommendations
console.log('\n🚀 Performance Recommendations:');
console.log('  1. Enable gzip/brotli compression');
console.log('  2. Implement code splitting for large pages');
console.log('  3. Optimize images with next/image');
console.log('  4. Use dynamic imports for heavy components');
console.log('  5. Consider removing unused dependencies');
console.log('  6. Enable Next.js built-in optimizations');

console.log('\n✅ Bundle analysis complete!');
console.log('💡 Run "ANALYZE=true npm run build" to open interactive analyzer');
