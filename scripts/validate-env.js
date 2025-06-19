#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set
 * and checks their format where applicable.
 */

const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('❌ Error: .env file not found');
  console.log('💡 Tip: Copy .env.example to .env and fill in your values');
  process.exit(1);
}

config({ path: envPath });

// Define required and optional variables with validation rules
const ENV_CONFIG = {
  required: {
    // Application Core
    NEXT_PUBLIC_API_URL: {
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      error: 'Must be a valid URL (e.g., http://localhost:3000)'
    },
    NODE_ENV: {
      validate: (value) => ['development', 'production', 'test'].includes(value),
      error: 'Must be one of: development, production, test'
    },
    
    // Authentication
    JWT_SECRET: {
      validate: (value) => value.length >= 32,
      error: 'Must be at least 32 characters long'
    },
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: {
      validate: (value) => value.includes('.supabase.co'),
      error: 'Must be a valid Supabase URL (e.g., https://xxxxx.supabase.co)'
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      validate: (value) => value.startsWith('eyJ'),
      error: 'Must be a valid Supabase anon key (JWT format)'
    },
    SUPABASE_SERVICE_KEY: {
      validate: (value) => value.startsWith('eyJ'),
      error: 'Must be a valid Supabase service key (JWT format)'
    }
  },
  optional: {
    // Authentication
    JWT_EXPIRY: {
      validate: (value) => /^\\d+[dhms]$/.test(value),
      error: 'Must be in format: 7d, 24h, 60m, 3600s'
    },
    REFRESH_TOKEN_EXPIRY: {
      validate: (value) => /^\\d+[dhms]$/.test(value),
      error: 'Must be in format: 30d, 720h, etc.'
    },
    
    // AI Services
    OPENAI_API_KEY: {
      validate: (value) => value.startsWith('sk-'),
      error: 'Must start with sk-'
    },
    
    // Storage
    MAX_FILE_SIZE: {
      validate: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
      error: 'Must be a positive number (bytes)'
    },
    
    // Email
    SMTP_PORT: {
      validate: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) < 65536,
      error: 'Must be a valid port number (1-65535)'
    },
    SMTP_USER: {
      validate: (value) => value.includes('@'),
      error: 'Must be a valid email address'
    }
  }
};

// Validation functions
function validateRequired() {
  console.log('\\n🔍 Checking required variables...\\n');
  let hasErrors = false;
  
  for (const [key, config] of Object.entries(ENV_CONFIG.required)) {
    const value = process.env[key];
    
    if (!value) {
      console.error(`❌ ${key}: Missing (required)`);
      hasErrors = true;
    } else if (config.validate && !config.validate(value)) {
      console.error(`❌ ${key}: Invalid format - ${config.error}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${key}: Set and valid`);
    }
  }
  
  return !hasErrors;
}

function validateOptional() {
  console.log('\\n🔍 Checking optional variables...\\n');
  
  for (const [key, config] of Object.entries(ENV_CONFIG.optional)) {
    const value = process.env[key];
    
    if (!value) {
      console.log(`⚪ ${key}: Not set (optional)`);
    } else if (config.validate && !config.validate(value)) {
      console.warn(`⚠️  ${key}: Invalid format - ${config.error}`);
    } else {
      console.log(`✅ ${key}: Set and valid`);
    }
  }
}

function checkDuplicateKeys() {
  console.log('\\n🔍 Checking for duplicate keys...\\n');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\\n');
  const keys = {};
  
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const key = line.split('=')[0].trim();
      if (keys[key]) {
        console.warn(`⚠️  Duplicate key "${key}" found on lines ${keys[key] + 1} and ${index + 1}`);
      } else {
        keys[key] = index;
      }
    }
  });
}

function checkUnusedVariables() {
  console.log('\\n🔍 Checking for unused variables...\\n');
  
  const allDefinedKeys = [...Object.keys(ENV_CONFIG.required), ...Object.keys(ENV_CONFIG.optional)];
  const envKeys = Object.keys(process.env).filter(key => 
    !key.startsWith('npm_') && 
    !key.startsWith('NODE_') && 
    key !== 'PATH' &&
    key !== 'HOME' &&
    key !== 'USER' &&
    key !== 'SHELL' &&
    key !== 'PWD'
  );
  
  const unusedKeys = envKeys.filter(key => !allDefinedKeys.includes(key));
  
  if (unusedKeys.length > 0) {
    console.log('⚪ Found environment variables that are not documented:');
    unusedKeys.forEach(key => console.log(`   - ${key}`));
    console.log('\\n💡 Consider adding these to the configuration if they are used by the application.');
  }
}

async function testConnections() {
  console.log('\\n🔍 Testing service connections...\\n');
  
  // Test Supabase connection
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        }
      });
      
      if (response.ok || response.status === 401) {
        console.log('✅ Supabase: Connection successful');
      } else {
        console.error('❌ Supabase: Connection failed (status:', response.status, ')');
      }
    } catch (error) {
      console.error('❌ Supabase: Connection failed:', error.message);
    }
  }
  
  // Test API URL
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV !== 'development') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        console.log('✅ API: Connection successful');
      } else {
        console.warn('⚠️  API: Health check returned status', response.status);
      }
    } catch (error) {
      console.warn('⚠️  API: Could not connect (this is normal if the API is not running)');
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 AIrWAVE Environment Validation\\n');
  console.log(`📁 Checking: ${envPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'Not set'}\\n`);
  
  // Run all checks
  const requiredValid = validateRequired();
  validateOptional();
  checkDuplicateKeys();
  checkUnusedVariables();
  
  // Only test connections if all required variables are valid
  if (requiredValid) {
    await testConnections();
  }
  
  // Summary
  console.log('\\n📊 Summary\\n');
  
  if (requiredValid) {
    console.log('✅ All required environment variables are set and valid!');
    console.log('\\n🎉 Your environment is ready for development.');
  } else {
    console.error('\\n❌ Some required environment variables are missing or invalid.');
    console.log('\\n💡 Please fix the issues above and run this script again.');
    process.exit(1);
  }
}

// Run the validation
main().catch(console.error);