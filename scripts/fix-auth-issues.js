#!/usr/bin/env node

/**
 * Quick Fix Script for Authentication Issues
 * Automatically fixes common authentication problems
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 AIrWAVE Authentication Quick Fix');
console.log('===================================\n');

const fixes = [];

// Fix 1: Check and fix cookie name consistency
function fixCookieNames() {
  console.log('1. Checking cookie name consistency...');
  
  const middlewarePath = 'src/middleware.ts';
  if (fs.existsSync(middlewarePath)) {
    let content = fs.readFileSync(middlewarePath, 'utf8');
    
    if (content.includes("request.cookies.get('auth_token')")) {
      content = content.replace(/request\.cookies\.get\('auth_token'\)/g, "request.cookies.get('airwave_token')");
      content = content.replace(/cookies\.delete\('auth_token'\)/g, "cookies.delete('airwave_token')");
      fs.writeFileSync(middlewarePath, content);
      fixes.push('✅ Fixed cookie names in middleware');
    } else {
      fixes.push('✅ Cookie names already correct in middleware');
    }
  }
}

// Fix 2: Check environment variable references
function fixEnvironmentVariables() {
  console.log('2. Checking environment variable references...');
  
  const files = [
    'src/lib/supabase.ts',
    'src/lib/env.ts',
    'src/utils/env.ts'
  ];
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      
      if (content.includes('SUPABASE_SERVICE_KEY') && !content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        content = content.replace(/SUPABASE_SERVICE_KEY/g, 'SUPABASE_SERVICE_ROLE_KEY');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content);
        fixes.push(`✅ Fixed environment variables in ${filePath}`);
      }
    }
  });
}

// Fix 3: Remove duplicate imports
function fixDuplicateImports() {
  console.log('3. Fixing duplicate imports...');
  
  const authFiles = [
    'src/pages/api/auth/login.ts',
    'src/pages/api/auth/signup.ts'
  ];
  
  authFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove duplicate NextApiRequest/NextApiResponse imports
      const lines = content.split('\n');
      const importLines = lines.filter(line => line.includes('NextApiRequest') || line.includes('NextApiResponse'));
      
      if (importLines.length > 1) {
        // Keep only the type import
        content = content.replace(/import { NextApiRequest, NextApiResponse } from 'next';\n/, '');
        fs.writeFileSync(filePath, content);
        fixes.push(`✅ Fixed duplicate imports in ${filePath}`);
      }
    }
  });
}

// Fix 4: Ensure proper error handling
function fixErrorHandling() {
  console.log('4. Checking error handling...');
  
  const loginPath = 'src/pages/api/auth/login.ts';
  if (fs.existsSync(loginPath)) {
    let content = fs.readFileSync(loginPath, 'utf8');
    
    // Ensure name is properly handled
    if (content.includes('name: userName,') && !content.includes('name: userName || \'User\',')) {
      content = content.replace(/name: userName,/g, "name: userName || 'User',");
      fs.writeFileSync(loginPath, content);
      fixes.push('✅ Fixed name handling in login API');
    }
  }
}

// Fix 5: Create missing directories
function createMissingDirectories() {
  console.log('5. Creating missing directories...');
  
  const dirs = [
    'test-results',
    'tests/screenshots'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fixes.push(`✅ Created directory: ${dir}`);
    }
  });
}

// Fix 6: Make scripts executable
function makeScriptsExecutable() {
  console.log('6. Making scripts executable...');
  
  const scripts = [
    'scripts/debug-auth.js',
    'scripts/fix-auth-issues.js'
  ];
  
  scripts.forEach(script => {
    if (fs.existsSync(script)) {
      try {
        fs.chmodSync(script, '755');
        fixes.push(`✅ Made ${script} executable`);
      } catch (error) {
        // Ignore chmod errors on Windows
      }
    }
  });
}

// Fix 7: Check TypeScript configuration
function checkTypeScriptConfig() {
  console.log('7. Checking TypeScript configuration...');
  
  const tsconfigPath = 'tsconfig.json';
  if (fs.existsSync(tsconfigPath)) {
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    
    try {
      const config = JSON.parse(content);
      
      if (!config.compilerOptions.skipLibCheck) {
        config.compilerOptions.skipLibCheck = true;
        fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, 2));
        fixes.push('✅ Added skipLibCheck to TypeScript config');
      }
      
      if (!config.compilerOptions.forceConsistentCasingInFileNames) {
        config.compilerOptions.forceConsistentCasingInFileNames = true;
        fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, 2));
        fixes.push('✅ Added forceConsistentCasingInFileNames to TypeScript config');
      }
    } catch (error) {
      fixes.push('⚠️ Could not parse TypeScript config');
    }
  }
}

// Run all fixes
async function runAllFixes() {
  try {
    fixCookieNames();
    fixEnvironmentVariables();
    fixDuplicateImports();
    fixErrorHandling();
    createMissingDirectories();
    makeScriptsExecutable();
    checkTypeScriptConfig();
    
    console.log('\n🎉 Fix Summary:');
    console.log('===============');
    
    if (fixes.length === 0) {
      console.log('✅ No issues found - everything looks good!');
    } else {
      fixes.forEach(fix => console.log(fix));
    }
    
    console.log('\n📋 Next Steps:');
    console.log('==============');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Test authentication: npm run debug:auth');
    console.log('3. Run comprehensive tests: npm run test:auth');
    console.log('4. Test manually in browser with your credentials');
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('Email: tomh@redbaez.com');
    console.log('Password: Wijlre2010');
    
  } catch (error) {
    console.error('❌ Fix script failed:', error);
    process.exit(1);
  }
}

runAllFixes();
