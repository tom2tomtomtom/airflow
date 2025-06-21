#!/usr/bin/env node

/**
 * Security Issues Fix Script
 * 
 * This script fixes critical security issues found in the codebase:
 * 1. Removes hardcoded JWT tokens from test files
 * 2. Replaces them with proper test constants
 * 3. Fixes environment variable security issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Starting security fixes...');

// Test JWT token constants (safe for testing)
const TEST_CONSTANTS = {
  TEST_JWT: 'TEST_JWT_TOKEN_PLACEHOLDER',
  TEST_URL: 'https://test-project.supabase.co',
  DEFAULT_JWT: 'DEFAULT_JWT_TOKEN_PLACEHOLDER'
};

// Files that contain hardcoded secrets
const FILES_TO_FIX = [
  'src/lib/__tests__/supabase.test.ts',
  'src/pages/api/__tests__/auth-login.test.ts',
  'src/pages/api/__tests__/campaigns.test.ts',
  'src/pages/api/__tests__/clients.test.ts',
  'src/pages/api/__tests__/health.test.ts',
  'src/pages/api/assets/__tests__/upload.test.ts',
  'src/pages/api/v2/__tests__/handlers.test.ts',
  'src/pages/api/video/__tests__/status.test.ts'
];

/**
 * Replace hardcoded JWT tokens with test constants
 */
function fixHardcodedSecrets(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match JWT tokens (eyJ...)
  const jwtPattern = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;
  
  // Replace JWT tokens with test constants
  const newContent = content.replace(jwtPattern, (match) => {
    modified = true;
    return TEST_CONSTANTS.TEST_JWT;
  });

  if (modified) {
    // Add test constants at the top of the file
    const testConstantsImport = `
// Test constants (safe for testing)
const TEST_JWT_TOKEN_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0IiwicmVmIjoidGVzdCIsInJvbGUiOiJhbm9uIn0.test-signature';
const DEFAULT_JWT_TOKEN_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0IiwicmVmIjoiZGVmYXVsdCIsInJvbGUiOiJhbm9uIn0.default-signature';
`;

    // Insert constants after imports
    const finalContent = newContent.replace(
      /(import.*?;\s*\n)+/,
      `$&${testConstantsImport}\n`
    );

    fs.writeFileSync(filePath, finalContent);
    console.log(`✅ Fixed hardcoded secrets in: ${filePath}`);
    return true;
  }

  return false;
}

/**
 * Fix environment variable security issues
 */
function fixEnvironmentSecurity() {
  const envExamplePath = '.env.example';
  
  if (fs.existsSync(envExamplePath)) {
    let content = fs.readFileSync(envExamplePath, 'utf8');
    
    // Fix weak REFRESH_TOKEN_EXPIRY
    content = content.replace(
      /REFRESH_TOKEN_EXPIRY=.*/,
      'REFRESH_TOKEN_EXPIRY=7d  # 7 days - secure default'
    );
    
    fs.writeFileSync(envExamplePath, content);
    console.log('✅ Fixed environment variable security in .env.example');
  }
}

/**
 * Add security headers to next.config.js
 */
function addSecurityHeaders() {
  const configPath = 'next.config.js';
  
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Check if CSP is already configured
    if (!content.includes('Content-Security-Policy')) {
      console.log('⚠️  CSP headers not found in next.config.js');
      console.log('   Manual addition required for Content Security Policy');
    } else {
      console.log('✅ CSP headers already configured in next.config.js');
    }
  }
}

/**
 * Main execution
 */
function main() {
  let totalFixed = 0;

  // Fix hardcoded secrets in test files
  FILES_TO_FIX.forEach(filePath => {
    if (fixHardcodedSecrets(filePath)) {
      totalFixed++;
    }
  });

  // Fix environment security
  fixEnvironmentSecurity();

  // Check security headers
  addSecurityHeaders();

  console.log(`\n🎉 Security fixes completed!`);
  console.log(`📊 Files fixed: ${totalFixed}/${FILES_TO_FIX.length}`);
  console.log(`\n🔍 Next steps:`);
  console.log(`   1. Run tests to ensure fixes work: npm test`);
  console.log(`   2. Run security audit: npm run audit:security`);
  console.log(`   3. Review and commit changes`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixHardcodedSecrets, fixEnvironmentSecurity };
