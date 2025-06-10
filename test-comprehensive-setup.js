/**
 * Comprehensive Testing Setup Validation
 * Verifies that all testing infrastructure is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 AIrWAVE Comprehensive Testing Setup Validation');
console.log('================================================');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  console.log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
  return exists;
}

function validatePackageScripts() {
  console.log('\n📦 Package.json Scripts:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'test:comprehensive',
      'test:auth:integrated',
      'test:assets:integrated',
      'test:mobile',
      'test:performance',
      'test:visual',
      'test:debug'
    ];
    
    let allPresent = true;
    requiredScripts.forEach(script => {
      const exists = script in scripts;
      console.log(`${exists ? '✅' : '❌'} ${script}`);
      if (!exists) allPresent = false;
    });
    
    return allPresent;
  } catch (error) {
    console.log('❌ Could not read package.json');
    return false;
  }
}

function validateTestStructure() {
  console.log('\n📁 Test Directory Structure:');
  
  const testPaths = [
    // Core infrastructure
    { path: 'tests', description: 'Tests directory', type: 'dir' },
    { path: 'playwright.config.comprehensive.ts', description: 'Comprehensive Playwright config', type: 'file' },
    
    // Test utilities
    { path: 'tests/utils', description: 'Test utilities directory', type: 'dir' },
    { path: 'tests/utils/auth-helper.ts', description: 'Authentication helper', type: 'file' },
    { path: 'tests/utils/file-helper.ts', description: 'File upload helper', type: 'file' },
    { path: 'tests/utils/api-mock-helper.ts', description: 'API mocking helper', type: 'file' },
    { path: 'tests/utils/test-database.ts', description: 'Test database helper', type: 'file' },
    { path: 'tests/utils/global-setup.ts', description: 'Global setup', type: 'file' },
    { path: 'tests/utils/global-teardown.ts', description: 'Global teardown', type: 'file' },
    
    // Page objects
    { path: 'tests/pages', description: 'Page objects directory', type: 'dir' },
    { path: 'tests/pages/auth-page.ts', description: 'Authentication page object', type: 'file' },
    { path: 'tests/pages/dashboard-page.ts', description: 'Dashboard page object', type: 'file' },
    { path: 'tests/pages/assets-page.ts', description: 'Assets page object', type: 'file' },
    
    // Test suites
    { path: 'tests/e2e', description: 'E2E tests directory', type: 'dir' },
    { path: 'tests/e2e/auth-flow-integrated.spec.ts', description: 'Auth flow integrated tests', type: 'file' },
    { path: 'tests/e2e/asset-management-integrated.spec.ts', description: 'Asset management integrated tests', type: 'file' },
    
    // Test fixtures
    { path: 'tests/fixtures', description: 'Test fixtures directory', type: 'dir' },
    { path: 'tests/fixtures/test-assets.json', description: 'Test assets fixture', type: 'file' },
    { path: 'tests/fixtures/api-mocks.json', description: 'API mocks fixture', type: 'file' },
    
    // Documentation
    { path: 'tests/README.md', description: 'Testing documentation', type: 'file' }
  ];
  
  let allPresent = true;
  testPaths.forEach(({ path: testPath, description, type }) => {
    const exists = type === 'dir' ? 
      checkDirectory(testPath, description) : 
      checkFile(testPath, description);
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function validateDependencies() {
  console.log('\n📚 Dependencies:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const devDeps = packageJson.devDependencies || {};
    const deps = packageJson.dependencies || {};
    const allDeps = { ...deps, ...devDeps };
    
    const requiredDeps = [
      '@playwright/test',
      '@supabase/supabase-js',
      'typescript'
    ];
    
    let allPresent = true;
    requiredDeps.forEach(dep => {
      const exists = dep in allDeps;
      console.log(`${exists ? '✅' : '❌'} ${dep}`);
      if (!exists) allPresent = false;
    });
    
    return allPresent;
  } catch (error) {
    console.log('❌ Could not validate dependencies');
    return false;
  }
}

function validateConfiguration() {
  console.log('\n⚙️ Configuration Files:');
  
  const configs = [
    { path: 'playwright.config.comprehensive.ts', description: 'Comprehensive Playwright config' },
    { path: 'tsconfig.json', description: 'TypeScript configuration' },
    { path: 'next.config.js', description: 'Next.js configuration' }
  ];
  
  let allPresent = true;
  configs.forEach(({ path: configPath, description }) => {
    const exists = checkFile(configPath, description);
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function checkTestExamples() {
  console.log('\n🎯 Test Examples and Patterns:');
  
  const examples = [
    {
      file: 'tests/e2e/auth-flow-integrated.spec.ts',
      patterns: [
        'test.describe',
        'test.step',
        'FUNCTIONAL:',
        'UX:',
        'expect('
      ]
    },
    {
      file: 'tests/e2e/asset-management-integrated.spec.ts',
      patterns: [
        'drag-and-drop',
        'upload',
        'performance',
        'mobile'
      ]
    }
  ];
  
  let allValid = true;
  examples.forEach(({ file, patterns }) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      patterns.forEach(pattern => {
        const hasPattern = content.includes(pattern);
        console.log(`${hasPattern ? '✅' : '❌'} ${file} contains "${pattern}"`);
        if (!hasPattern) allValid = false;
      });
    } else {
      console.log(`❌ ${file} not found`);
      allValid = false;
    }
  });
  
  return allValid;
}

async function runValidation() {
  console.log('Starting comprehensive testing setup validation...\n');
  
  const results = {
    structure: validateTestStructure(),
    scripts: validatePackageScripts(),
    dependencies: validateDependencies(),
    configuration: validateConfiguration(),
    examples: checkTestExamples()
  };
  
  console.log('\n📊 Validation Summary:');
  console.log('=====================');
  
  Object.entries(results).forEach(([category, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(Boolean);
  
  console.log('\n🎯 Overall Status:');
  if (allPassed) {
    console.log('✅ COMPREHENSIVE TESTING SETUP IS COMPLETE!');
    console.log('🚀 Ready to run comprehensive tests');
    console.log('\nNext steps:');
    console.log('1. npm run test:comprehensive         # Run all tests');
    console.log('2. npm run test:auth:integrated       # Run auth tests');
    console.log('3. npm run test:assets:integrated     # Run asset tests');
    console.log('4. npm run test:debug                 # Debug mode');
    console.log('5. npm run test:report                # View results');
  } else {
    console.log('❌ SETUP INCOMPLETE - Some components missing');
    console.log('Please review the failed items above and complete setup');
  }
  
  return allPassed;
}

// Run validation
runValidation().catch(console.error);