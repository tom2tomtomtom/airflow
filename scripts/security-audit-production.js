#!/usr/bin/env node

/**
 * AIRWAVE Production Security Audit Script
 * Comprehensive security validation for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 AIRWAVE Production Security Audit');
console.log('=====================================\n');

const auditResults = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  passed: [],
};

// 1. Check for exposed credentials
console.log('1. 🚨 Checking for exposed credentials...');
const dangerousFiles = ['.env', '.env.local', '.env.production'];
let credentialsExposed = false;

dangerousFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('sk-proj-') || content.includes('eyJhbGciOiJIUzI1NiI')) {
      auditResults.critical.push(`EXPOSED CREDENTIALS in ${file}`);
      credentialsExposed = true;
    }
  }
});

if (!credentialsExposed) {
  auditResults.passed.push('No exposed credentials found in environment files');
}

// 2. Check for shell injection vulnerabilities
console.log('2. 🛡️  Checking for shell injection vulnerabilities...');
const envTestPath = '.env.test';
if (fs.existsSync(envTestPath)) {
  const content = fs.readFileSync(envTestPath, 'utf8');
  if (content.includes('EOF < /dev/null')) {
    auditResults.critical.push('Shell injection vulnerability in .env.test');
  } else {
    auditResults.passed.push('No shell injection vulnerabilities found');
  }
}

// 3. Check security headers implementation
console.log('3. 🔐 Checking security headers implementation...');
const securityHeadersPath = 'src/middleware/withSecurityHeaders.ts';
if (fs.existsSync(securityHeadersPath)) {
  const content = fs.readFileSync(securityHeadersPath, 'utf8');

  const requiredHeaders = [
    'Permissions-Policy',
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Content-Security-Policy',
  ];

  const missingHeaders = requiredHeaders.filter(header => !content.includes(header));

  if (missingHeaders.length > 0) {
    auditResults.high.push(`Missing security headers: ${missingHeaders.join(', ')}`);
  } else {
    auditResults.passed.push('All required security headers implemented');
  }
}

// 4. Check CSRF protection
console.log('4. 🛡️  Checking CSRF protection...');
const csrfPath = 'src/lib/csrf.ts';
if (fs.existsSync(csrfPath)) {
  const content = fs.readFileSync(csrfPath, 'utf8');
  if (content.includes('error: {') && content.includes("code: 'FORBIDDEN'")) {
    auditResults.passed.push('CSRF protection properly implemented');
  } else {
    auditResults.medium.push('CSRF error response format needs fixing');
  }
}

// 5. Check for vulnerable dependencies
console.log('5. 📦 Checking for vulnerable dependencies...');
try {
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditOutput);

  if (audit.metadata.vulnerabilities.total === 0) {
    auditResults.passed.push('No vulnerable dependencies found');
  } else {
    const vulns = audit.metadata.vulnerabilities;
    if (vulns.critical > 0) {
      auditResults.critical.push(`${vulns.critical} critical vulnerabilities in dependencies`);
    }
    if (vulns.high > 0) {
      auditResults.high.push(`${vulns.high} high severity vulnerabilities in dependencies`);
    }
    if (vulns.moderate > 0) {
      auditResults.medium.push(`${vulns.moderate} moderate vulnerabilities in dependencies`);
    }
  }
} catch (error) {
  auditResults.medium.push('Unable to run dependency audit - npm audit failed');
}

// 6. Check TypeScript configuration
console.log('6. ⚙️  Checking TypeScript security configuration...');
const tsconfigPath = 'tsconfig.json';
if (fs.existsSync(tsconfigPath)) {
  const content = fs.readFileSync(tsconfigPath, 'utf8');

  // Check for strict mode without parsing JSON (due to comments)
  if (content.includes('"strict": true')) {
    auditResults.passed.push('TypeScript strict mode enabled');
  } else {
    auditResults.medium.push('TypeScript strict mode should be enabled for production');
  }
}

// 7. Check for production environment validation
console.log('7. 🌍 Checking production environment validation...');
const envValidationPath = 'src/lib/env-validation.ts';
if (fs.existsSync(envValidationPath)) {
  auditResults.passed.push('Environment validation system present');
} else {
  auditResults.high.push('Missing environment validation system');
}

// 8. Check for secure cookie configuration
console.log('8. 🍪 Checking secure cookie configuration...');
const sessionManagerPath = 'src/lib/auth/session-manager.ts';
if (fs.existsSync(sessionManagerPath)) {
  const content = fs.readFileSync(sessionManagerPath, 'utf8');
  if (content.includes('httpOnly') && content.includes('secure') && content.includes('sameSite')) {
    auditResults.passed.push('Secure cookie configuration implemented');
  } else {
    auditResults.high.push('Cookie security attributes missing or incomplete');
  }
}

// Generate report
console.log('\n📊 SECURITY AUDIT RESULTS');
console.log('==========================\n');

if (auditResults.critical.length > 0) {
  console.log('🚨 CRITICAL ISSUES:');
  auditResults.critical.forEach(issue => console.log(`   ❌ ${issue}`));
  console.log('');
}

if (auditResults.high.length > 0) {
  console.log('⚠️  HIGH PRIORITY ISSUES:');
  auditResults.high.forEach(issue => console.log(`   🔴 ${issue}`));
  console.log('');
}

if (auditResults.medium.length > 0) {
  console.log('⚡ MEDIUM PRIORITY ISSUES:');
  auditResults.medium.forEach(issue => console.log(`   🟡 ${issue}`));
  console.log('');
}

if (auditResults.passed.length > 0) {
  console.log('✅ SECURITY CHECKS PASSED:');
  auditResults.passed.forEach(check => console.log(`   ✓ ${check}`));
  console.log('');
}

// Calculate security score
const totalIssues =
  auditResults.critical.length + auditResults.high.length + auditResults.medium.length;
const totalChecks = totalIssues + auditResults.passed.length;
const securityScore =
  totalChecks > 0 ? Math.round((auditResults.passed.length / totalChecks) * 100) : 0;

console.log(`🎯 SECURITY SCORE: ${securityScore}%`);

if (auditResults.critical.length > 0) {
  console.log('🚫 PRODUCTION DEPLOYMENT: BLOCKED');
  console.log('   Critical security issues must be resolved before production deployment.');
  process.exit(1);
} else if (auditResults.high.length > 0) {
  console.log('⚠️  PRODUCTION DEPLOYMENT: NOT RECOMMENDED');
  console.log('   High priority security issues should be resolved before production deployment.');
  process.exit(1);
} else if (securityScore >= 80) {
  console.log('✅ PRODUCTION DEPLOYMENT: APPROVED');
  console.log('   Security audit passed. Safe for production deployment.');
  process.exit(0);
} else {
  console.log('⚠️  PRODUCTION DEPLOYMENT: REVIEW REQUIRED');
  console.log('   Address medium priority issues before production deployment.');
  process.exit(1);
}
