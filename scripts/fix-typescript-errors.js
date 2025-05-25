#!/usr/bin/env node

/**
 * TypeScript Error Fixer Script
 * This script helps fix common TypeScript errors in the AIrWAVE project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting TypeScript Error Fixes...\n');

// Step 1: Fix unused imports automatically
console.log('Step 1: Fixing unused imports...');
try {
  execSync('npm run lint:unused', { stdio: 'inherit' });
  console.log('✅ Unused imports fixed!\n');
} catch (error) {
  console.log('⚠️  Some unused imports could not be automatically fixed.\n');
}

// Step 2: List remaining TypeScript errors
console.log('Step 2: Analyzing remaining TypeScript errors...');
try {
  const output = execSync('npm run type-check 2>&1', { encoding: 'utf-8' });
  console.log('✅ No TypeScript errors found!');
} catch (error) {
  const errorOutput = error.stdout || error.message;
  const lines = errorOutput.split('\n');
  
  // Parse errors by type
  const errorTypes = {
    unused: [],
    typeMismatch: [],
    implicitAny: [],
    missingProperty: [],
    other: []
  };
  
  lines.forEach(line => {
    if (line.includes('TS6133')) {
      errorTypes.unused.push(line);
    } else if (line.includes('TS2322') || line.includes('TS2345')) {
      errorTypes.typeMismatch.push(line);
    } else if (line.includes('TS7006')) {
      errorTypes.implicitAny.push(line);
    } else if (line.includes('TS2339')) {
      errorTypes.missingProperty.push(line);
    } else if (line.includes('error TS')) {
      errorTypes.other.push(line);
    }
  });
  
  // Display summary
  console.log('\n📊 Error Summary:');
  console.log(`- Unused variables/imports: ${errorTypes.unused.length}`);
  console.log(`- Type mismatches: ${errorTypes.typeMismatch.length}`);
  console.log(`- Implicit any types: ${errorTypes.implicitAny.length}`);
  console.log(`- Missing properties: ${errorTypes.missingProperty.length}`);
  console.log(`- Other errors: ${errorTypes.other.length}`);
  console.log(`\nTotal errors: ${Object.values(errorTypes).reduce((sum, arr) => sum + arr.length, 0)}`);
  
  // Save detailed error report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      unused: errorTypes.unused.length,
      typeMismatch: errorTypes.typeMismatch.length,
      implicitAny: errorTypes.implicitAny.length,
      missingProperty: errorTypes.missingProperty.length,
      other: errorTypes.other.length
    },
    details: errorTypes
  };
  
  fs.writeFileSync('typescript-errors-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed error report saved to: typescript-errors-report.json');
}

console.log('\n🎯 Next steps:');
console.log('1. Review typescript-errors-report.json for detailed errors');
console.log('2. Fix type mismatches and implicit any types manually');
console.log('3. Run "npm run type-check" to verify fixes');
console.log('4. Commit changes when all errors are resolved');
