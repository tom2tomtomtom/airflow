#!/usr/bin/env node

/**
 * Security Audit Script
 * Performs comprehensive security checks on the AIRWAVE application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting security audit...\n');

// 1. NPM Audit
console.log('📦 Running npm audit...');
try {
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditOutput);

  if (audit.metadata.vulnerabilities.total === 0) {
    console.log('✅ No vulnerabilities found in dependencies');
  } else {
    console.log(`⚠️  Found ${audit.metadata.vulnerabilities.total} vulnerabilities:`);
    console.log(`   - Critical: ${audit.metadata.vulnerabilities.critical}`);
    console.log(`   - High: ${audit.metadata.vulnerabilities.high}`);
    console.log(`   - Moderate: ${audit.metadata.vulnerabilities.moderate}`);
    console.log(`   - Low: ${audit.metadata.vulnerabilities.low}`);
    console.log('   Run "npm audit fix" to fix automatically fixable issues');
  }
} catch (error) {
  console.log('⚠️  npm audit failed or found issues');
}

// 2. Environment Variables Check
console.log('\n🔐 Checking environment variable security...');

const envFiles = ['.env', '.env.local', '.env.example'];
const sensitivePatterns = [/password/i, /secret/i, /key/i, /token/i, /api_key/i];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');

        if (value && sensitivePatterns.some(pattern => pattern.test(key))) {
          if (value.length < 10) {
            console.log(`⚠️  ${file}:${index + 1} - Weak ${key}: value too short`);
          }
          if (value === 'your-key-here' || value === 'changeme') {
            console.log(`❌ ${file}:${index + 1} - Default ${key}: change default value`);
          }
        }
      }
    });
  }
});

// 3. Check for hardcoded secrets
console.log('\n🔍 Scanning for hardcoded secrets...');

const secretPatterns = [
  { name: 'API Key', pattern: /['"](sk-[a-zA-Z0-9]{48})['"]/g },
  { name: 'JWT Token', pattern: /['"](eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)['"]/g },
  { name: 'AWS Key', pattern: /['"](AKIA[0-9A-Z]{16})['"]/g },
  { name: 'Generic Secret', pattern: /['"](secret|password|token)['"]:\s*['"][^'"]{10,}['"]/gi },
];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath);
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      const content = fs.readFileSync(filePath, 'utf8');

      secretPatterns.forEach(({ name, pattern }) => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`❌ ${filePath}: Potential ${name} found`);
        }
      });
    }
  });
}

scanDirectory('src');

// 4. Check Next.js security headers
console.log('\n🛡️  Checking security headers configuration...');

const nextConfigPath = 'next.config.js';
if (fs.existsSync(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, 'utf8');

  const securityHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ];

  securityHeaders.forEach(header => {
    if (!config.includes(header)) {
      console.log(`⚠️  Missing security header: ${header}`);
    }
  });

  if (config.includes('X-Frame-Options')) {
    console.log('✅ X-Frame-Options configured');
  }
} else {
  console.log('⚠️  No next.config.js found');
}

// 5. Check for HTTPS enforcement
console.log('\n🔒 Checking HTTPS enforcement...');

const middlewarePath = 'src/middleware.ts';
if (fs.existsSync(middlewarePath)) {
  const middleware = fs.readFileSync(middlewarePath, 'utf8');

  if (middleware.includes('https') || middleware.includes('secure')) {
    console.log('✅ HTTPS enforcement detected in middleware');
  } else {
    console.log('⚠️  No HTTPS enforcement found in middleware');
  }
} else {
  console.log('⚠️  No middleware.ts found');
}

// 6. Check authentication implementation
console.log('\n👤 Checking authentication security...');

const authFiles = ['src/lib/auth.ts', 'src/contexts/AuthContext.tsx', 'src/middleware/withAuth.ts'];

authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');

    if (content.includes('httpOnly')) {
      console.log(`✅ ${file}: HTTP-only cookies configured`);
    } else {
      console.log(`⚠️  ${file}: Consider using HTTP-only cookies`);
    }

    if (content.includes('secure')) {
      console.log(`✅ ${file}: Secure cookie flag found`);
    }

    if (content.includes('sameSite')) {
      console.log(`✅ ${file}: SameSite cookie attribute found`);
    }
  }
});

// 7. Security recommendations
console.log('\n🚀 Security Recommendations:');
console.log('  1. Enable Content Security Policy (CSP)');
console.log('  2. Implement rate limiting on API endpoints');
console.log('  3. Use HTTPS in production');
console.log('  4. Validate all user inputs');
console.log('  5. Implement proper error handling (no stack traces in production)');
console.log('  6. Use environment variables for all secrets');
console.log('  7. Enable security headers in next.config.js');
console.log('  8. Implement proper session management');
console.log('  9. Use CSRF protection');
console.log('  10. Regular dependency updates');

console.log('\n✅ Security audit complete!');
console.log('💡 Address any issues found above to improve security posture');
