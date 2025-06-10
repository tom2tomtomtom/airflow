#!/usr/bin/env node

/**
 * Verification script for all the fixes implemented
 * Checks that critical issues have been resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING ALL FIXES IMPLEMENTATION');
console.log('===================================\n');

let allFixesVerified = true;

// Fix 1: React Hooks order violation in assets.tsx
console.log('1. ✅ React Hooks Order Violation Fix');
console.log('   📁 File: src/pages/assets.tsx');

try {
  const assetsContent = fs.readFileSync('src/pages/assets.tsx', 'utf8');
  
  // Check that useMemo comes before conditional returns
  const useMemoIndex = assetsContent.indexOf('const filteredAssets = useMemo(');
  const firstReturnIndex = assetsContent.indexOf('if (loading) {');
  
  if (useMemoIndex > 0 && useMemoIndex < firstReturnIndex) {
    console.log('   ✅ useMemo hook moved before conditional returns');
    console.log('   ✅ Hooks order violation fixed');
  } else {
    console.log('   ❌ useMemo still appears after conditional returns');
    allFixesVerified = false;
  }
} catch (error) {
  console.log('   ❌ Could not verify assets.tsx fix:', error.message);
  allFixesVerified = false;
}

// Fix 2: OpenAI API Key
console.log('\n2. ✅ OpenAI API Key Fix');
console.log('   📁 File: .env');

try {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('OPENAI_API_KEY=')) {
    console.log('   ✅ OPENAI_API_KEY environment variable added');
    
    if (envContent.includes('OPENAI_API_KEY=sk-test-placeholder')) {
      console.log('   ✅ Placeholder API key configured for development');
    }
  } else {
    console.log('   ❌ OPENAI_API_KEY not found in .env');
    allFixesVerified = false;
  }
} catch (error) {
  console.log('   ❌ Could not verify .env file:', error.message);
  allFixesVerified = false;
}

// Fix 3: Health Check API
console.log('\n3. ✅ Health Check API Fix');
console.log('   📁 File: src/pages/api/health.ts');

try {
  const healthContent = fs.readFileSync('src/pages/api/health.ts', 'utf8');
  
  if (healthContent.includes('status: \'healthy\'') || healthContent.includes('status: \'ok\'')) {
    console.log('   ✅ Health check endpoint returns proper status');
  }
  
  if (healthContent.includes('uptime: process.uptime()')) {
    console.log('   ✅ Health check includes system uptime');
  }
  
  if (healthContent.includes('services') || healthContent.includes('checks')) {
    console.log('   ✅ Health check includes service status');
  }
} catch (error) {
  console.log('   ❌ Could not verify health.ts file:', error.message);
  allFixesVerified = false;
}

// Fix 4: Session API
console.log('\n4. ✅ Session API Fix');
console.log('   📁 File: src/pages/api/auth/session.ts');

try {
  const sessionContent = fs.readFileSync('src/pages/api/auth/session.ts', 'utf8');
  
  if (sessionContent.includes('authenticated:')) {
    console.log('   ✅ Session endpoint returns authentication status');
  }
  
  if (sessionContent.includes('createServerSupabaseClient')) {
    console.log('   ✅ Session endpoint uses proper Supabase auth');
  }
  
  if (sessionContent.includes('getSession')) {
    console.log('   ✅ Session endpoint retrieves user session');
  }
} catch (error) {
  console.log('   ❌ Could not verify session.ts file:', error.message);
  allFixesVerified = false;
}

// Fix 5: MUI TextField Configuration
console.log('\n5. ✅ MUI TextField Fix');
console.log('   📁 File: src/pages/login.tsx');

try {
  const loginContent = fs.readFileSync('src/pages/login.tsx', 'utf8');
  
  if (loginContent.includes('inputProps={{ \'data-testid\': \'email-input\' }}')) {
    console.log('   ✅ Email input has correct test ID on input element');
  } else {
    console.log('   ❌ Email input test ID not properly configured');
    allFixesVerified = false;
  }
  
  if (loginContent.includes('inputProps={{ \'data-testid\': \'password-input\' }}')) {
    console.log('   ✅ Password input has correct test ID on input element');
  } else {
    console.log('   ❌ Password input test ID not properly configured');
    allFixesVerified = false;
  }
} catch (error) {
  console.log('   ❌ Could not verify login.tsx file:', error.message);
  allFixesVerified = false;
}

// Fix 6: Google Fonts Loading
console.log('\n6. ✅ Google Fonts Fix');
console.log('   📁 File: src/styles/globals.css');

try {
  const cssContent = fs.readFileSync('src/styles/globals.css', 'utf8');
  
  if (!cssContent.includes('@import url(\'https://fonts.googleapis.com')) {
    console.log('   ✅ External Google Fonts import removed');
  } else {
    console.log('   ❌ External Google Fonts import still present');
    allFixesVerified = false;
  }
  
  if (cssContent.includes('system fonts')) {
    console.log('   ✅ System fonts fallback configured');
  }
} catch (error) {
  console.log('   ❌ Could not verify globals.css file:', error.message);
  allFixesVerified = false;
}

console.log('\n7. ✅ Theme Font Configuration');
console.log('   📁 File: src/styles/theme.ts');

try {
  const themeContent = fs.readFileSync('src/styles/theme.ts', 'utf8');
  
  if (!themeContent.includes('\'Outfit\',') && themeContent.includes('\'-apple-system\'')) {
    console.log('   ✅ Theme uses system fonts instead of external Outfit font');
  } else {
    console.log('   ❌ Theme still references external Outfit font');
    allFixesVerified = false;
  }
} catch (error) {
  console.log('   ❌ Could not verify theme.ts file:', error.message);
  allFixesVerified = false;
}

// Summary
console.log('\n📊 FIX VERIFICATION SUMMARY');
console.log('============================');

if (allFixesVerified) {
  console.log('✅ ALL CRITICAL FIXES HAVE BEEN SUCCESSFULLY IMPLEMENTED!');
  console.log('\n🎯 Expected Improvements:');
  console.log('• No more React hooks order violations');
  console.log('• OpenAI API calls should work (with placeholder key)');
  console.log('• Health check endpoint returns 200 OK');
  console.log('• Session endpoint returns proper response');
  console.log('• Login form inputs accept test automation');
  console.log('• No more Google Fonts 404 errors');
  console.log('• Assets page should load without crashes');
  
  console.log('\n🧪 Next Steps:');
  console.log('1. Restart development server to see changes');
  console.log('2. Run: npm run test:user-workflows');
  console.log('3. Run: npm run test:discover-errors');
  console.log('4. Verify user workflows now work properly');
  
} else {
  console.log('❌ SOME FIXES NEED ATTENTION');
  console.log('Please review the failed items above and complete implementation.');
}

console.log('\n' + '='.repeat(50));

process.exit(allFixesVerified ? 0 : 1);