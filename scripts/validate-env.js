#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates all environment variables for production deployment
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironment() {
  const envFile = process.argv[2] || '.env.production';
  const envPath = path.join(process.cwd(), envFile);

  log(`🔍 Validating environment file: ${envFile}`, 'blue');

  // Check if environment file exists
  if (!fs.existsSync(envPath)) {
    log(`❌ Environment file not found: ${envPath}`, 'red');
    log(`💡 Create it by copying: cp .env.production.example ${envFile}`, 'yellow');
    process.exit(1);
  }

  // Load environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#') && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  // Required variables for production
  const requiredVars = [
    { key: 'NODE_ENV', expected: 'production' },
    { key: 'NEXT_PUBLIC_API_URL', validator: isValidUrl },
    { key: 'JWT_SECRET', validator: (value) => value && value.length >= 32 },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', validator: isValidUrl },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', validator: isNonEmpty },
    { key: 'SUPABASE_SERVICE_KEY', validator: isNonEmpty },
    { key: 'OPENAI_API_KEY', validator: (value) => value && value.startsWith('sk-') },
    { key: 'ELEVENLABS_API_KEY', validator: isNonEmpty },
  ];

  // Recommended variables
  const recommendedVars = [
    'SENTRY_DSN',
    'SMTP_HOST',
    'ALLOWED_ORIGINS',
    'CDN_URL',
    'CREATOMATE_API_KEY',
  ];

  let hasErrors = false;
  const warnings = [];

  log('\n📋 Checking required variables:', 'bold');

  // Validate required variables
  requiredVars.forEach(({ key, expected, validator }) => {
    const value = env[key];
    
    if (!value) {
      log(`  ❌ ${key}: Missing`, 'red');
      hasErrors = true;
      return;
    }

    if (expected && value !== expected) {
      log(`  ❌ ${key}: Expected "${expected}", got "${value}"`, 'red');
      hasErrors = true;
      return;
    }

    if (validator && !validator(value)) {
      log(`  ❌ ${key}: Invalid value`, 'red');
      hasErrors = true;
      return;
    }

    log(`  ✅ ${key}: OK`, 'green');
  });

  log('\n🔍 Checking recommended variables:', 'bold');

  // Check recommended variables
  recommendedVars.forEach(key => {
    const value = env[key];
    if (!value) {
      log(`  ⚠️  ${key}: Not set (recommended for production)`, 'yellow');
      warnings.push(`${key} is recommended for production`);
    } else {
      log(`  ✅ ${key}: OK`, 'green');
    }
  });

  // Security checks
  log('\n🔒 Security validation:', 'bold');

  // Check JWT secret strength
  const jwtSecret = env.JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length < 32) {
      log(`  ❌ JWT_SECRET: Too short (${jwtSecret.length} chars, need 32+)`, 'red');
      hasErrors = true;
    } else if (jwtSecret === 'your-super-secure-jwt-secret-minimum-32-characters-long') {
      log(`  ❌ JWT_SECRET: Using example value, change it!`, 'red');
      hasErrors = true;
    } else {
      log(`  ✅ JWT_SECRET: Strong (${jwtSecret.length} characters)`, 'green');
    }
  }

  // Check for example values
  const exampleValues = [
    'your-production-domain.com',
    'your-production-project.supabase.co',
    'your-production-anon-key',
    'sk-your-production-openai-key',
    'your-production-elevenlabs-key',
  ];

  exampleValues.forEach(example => {
    Object.entries(env).forEach(([key, value]) => {
      if (value && value.includes(example)) {
        log(`  ❌ ${key}: Still contains example value`, 'red');
        hasErrors = true;
      }
    });
  });

  // Print summary
  log('\n' + '='.repeat(50), 'blue');
  
  if (hasErrors) {
    log('❌ Environment validation FAILED', 'red');
    log('🔧 Fix the errors above before deploying to production', 'yellow');
    process.exit(1);
  } else if (warnings.length > 0) {
    log('⚠️  Environment validation passed with warnings', 'yellow');
    log(`📝 ${warnings.length} recommendation(s):`, 'yellow');
    warnings.forEach(warning => log(`   • ${warning}`, 'yellow'));
    log('\n🚀 You can proceed with deployment', 'green');
  } else {
    log('✅ Environment validation PASSED', 'green');
    log('🚀 Ready for production deployment!', 'green');
  }
}

// Helper functions
function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isNonEmpty(value) {
  return value && value.trim().length > 0;
}

// Run validation
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };
