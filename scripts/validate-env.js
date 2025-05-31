#!/usr/bin/env node

/**
 * Environment variable verification script
 * Validates that all required environment variables are set and valid
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables
const envFile = process.argv[2] || '.env.local';

// Core required variables (always needed)
const coreRequiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Production required variables
const productionRequiredVars = [
  'JWT_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

// Optional but recommended variables
const optionalVars = [
  'ELEVENLABS_API_KEY',
  'CREATOMATE_API_KEY',
  'RUNWAY_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
];

// Initialize counters
let errors = [];
let warnings = [];

console.log('🔍 Environment Variable Validation');
console.log('=' .repeat(60));

// Load environment file if it exists
if (fs.existsSync(envFile)) {
  console.log(`📁 Loading environment from: ${envFile}\n`);
  require('dotenv').config({ path: envFile });
} else {
  console.log(`⚠️  Environment file not found: ${envFile}\n`);
  warnings.push(`Environment file ${envFile} not found`);
}

// Helper function to mask sensitive values
function maskValue(value, varName) {
  if (!value) return 'Not set';
  if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASS')) {
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
  return value.length > 50 ? `${value.substring(0, 47)}...` : value;
}

// Check core required variables
console.log('Core Required Variables:');
coreRequiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '') {
    console.error(`   ❌ ${varName}: Missing or empty`);
    errors.push(`${varName} is required`);
  } else {
    const masked = maskValue(value, varName);
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Check production required variables
console.log('\nProduction Required Variables:');
productionRequiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '') {
    console.error(`   ❌ ${varName}: Missing or empty`);
    errors.push(`${varName} is required`);
  } else {
    const masked = maskValue(value, varName);
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Check optional variables
console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === '') {
    console.log(`   ⚠️  ${varName}: Not set`);
    warnings.push(`${varName} is not set - some features may be unavailable`);
  } else {
    const masked = maskValue(value, varName);
    console.log(`   ✅ ${varName}: ${masked}`);
  }
});

// Check for additional configuration
console.log('\nConfiguration:');
console.log(`   📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   🌐 API URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`);

// Summary
console.log('\n' + '='.repeat(60));
const hasErrors = errors.length > 0;
const hasWarnings = warnings.length > 0;

if (hasErrors) {
  console.error(`❌ Validation failed with ${errors.length} errors:`);
  errors.forEach(error => console.error(`   • ${error}`));
}

if (hasWarnings) {
  console.warn(`\n⚠️  ${warnings.length} warnings:`);
  warnings.forEach(warning => console.warn(`   • ${warning}`));
}

if (!hasErrors && !hasWarnings) {
  console.log('✅ All environment variables are properly configured!');
} else if (!hasErrors) {
  console.log('✅ Environment is valid (with warnings)');
}

if (hasErrors) {
  console.error('\n💡 Tips:');
  console.error('   1. Copy .env.example to .env.local');
  console.error('   2. Fill in all required values');
  console.error('   3. See docs/ENVIRONMENT_SETUP.md for detailed instructions\n');
  
  process.exit(1);
} else {
  console.log('\n🚀 Ready to start the application!\n');
  process.exit(0);
}