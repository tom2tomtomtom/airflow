#!/usr/bin/env node

/**
 * Environment variable verification script
 * Validates that all required environment variables are set and valid
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables based on mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const envFile = process.argv[2] || '.env.local';

// Core required variables (always needed)
const coreRequiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Production required variables (not needed in demo mode)
const productionRequiredVars = [
  'JWT_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

// Optional but recommended variables
const optionalVars = [
  'ELEVENLABS_API_KEY',
  'CREATOMATE_API_KEY',
  'SENTRY_DSN',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
];

// Load environment variables from file if it exists
if (fs.existsSync(envFile)) {
  require('dotenv').config({ path: envFile });
}

console.log(`\n🔍 Validating environment variables${envFile !== '.env.local' ? ` from ${envFile}` : ''}...\n`);

let hasErrors = false;
const errors = [];
const warnings = [];

// Check core required variables
console.log('Core Required Variables:');
coreRequiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '') {
    if (isDemoMode && varName.includes('SUPABASE')) {
      console.log(`   ⚠️  ${varName}: Not set (using demo defaults)`);
      warnings.push(`${varName} is not set - demo mode will use defaults`);
    } else {
      console.error(`   ❌ ${varName}: Missing or empty`);
      errors.push(`${varName} is required`);
      hasErrors = true;
    }
  } else {
    const masked = varName.includes('KEY') || varName.includes('SECRET') 
      ? value.substring(0, 8) + '...' 
      : value;
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Check production required variables (skip in demo mode)
if (!isDemoMode) {
  console.log('\nProduction Required Variables:');
  productionRequiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === '') {
      console.error(`   ❌ ${varName}: Missing or empty`);
      errors.push(`${varName} is required in production mode`);
      hasErrors = true;
    } else {
      // Validate specific variables
      if (varName === 'JWT_SECRET' && value.length < 32) {
        console.error(`   ❌ ${varName}: Too short (must be at least 32 characters)`);
        errors.push(`${varName} must be at least 32 characters for security`);
        hasErrors = true;
      } else if (varName === 'OPENAI_API_KEY' && !value.startsWith('sk-')) {
        console.error(`   ❌ ${varName}: Invalid format (must start with 'sk-')`);
        errors.push(`${varName} must be a valid OpenAI API key`);
        hasErrors = true;
      } else {
        const masked = value.substring(0, 8) + '...';
        console.log(`   ✅ ${varName}: ${masked}`);
      }
    }
  });
} else {
  console.log('\n⚠️  Skipping production variables validation (demo mode enabled)');
}

// Check optional variables
console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '') {
    console.log(`   ⚠️  ${varName}: Not set (optional)`);
    warnings.push(`${varName} is not set - some features may be limited`);
  } else {
    const masked = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASS')
      ? value.substring(0, 8) + '...' 
      : value;
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Check for additional configuration
console.log('\nConfiguration:');
console.log(`   📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   🎮 Demo Mode: ${isDemoMode ? 'Enabled' : 'Disabled'}`);
console.log(`   🌐 API URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`);

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('\n❌ Environment validation failed!\n');
  console.error('Errors:');
  errors.forEach(error => console.error(`   - ${error}`));
  
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.error('\n💡 Tips:');
  console.error('   1. Copy .env.example to .env.local');
  console.error('   2. Fill in all required values');
  console.error('   3. Set NEXT_PUBLIC_DEMO_MODE=true to run in demo mode');
  console.error('   4. See docs/ENVIRONMENT_SETUP.md for detailed instructions\n');
  
  process.exit(1);
} else {
  if (warnings.length > 0) {
    console.log('\n⚠️  Environment validation passed with warnings:\n');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('\n✅ You can proceed, but some features may be limited.\n');
  } else {
    console.log('\n✅ All environment variables are properly configured!\n');
  }
  process.exit(0);
}
