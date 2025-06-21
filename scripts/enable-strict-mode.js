#!/usr/bin/env node

/**
 * Gradually Enable TypeScript Strict Mode
 * This script helps enable TypeScript strict mode incrementally
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

// Strict mode options to enable incrementally
const strictOptions = [
  {
    name: 'noImplicitAny',
    description: 'Raise error on expressions and declarations with an implied any type',
    current: false
  },
  {
    name: 'strictNullChecks',
    description: 'Enable strict null checks',
    current: false
  },
  {
    name: 'strictFunctionTypes',
    description: 'Enable strict checking of function types',
    current: false
  },
  {
    name: 'strictBindCallApply',
    description: 'Enable strict bind, call, and apply methods on functions',
    current: false
  },
  {
    name: 'strictPropertyInitialization',
    description: 'Enable strict checking of property initialization in classes',
    current: false
  },
  {
    name: 'noImplicitThis',
    description: 'Raise error on this expressions with an implied any type',
    current: false
  },
  {
    name: 'alwaysStrict',
    description: 'Parse in strict mode and emit "use strict" for each source file',
    current: false
  },
  {
    name: 'noUnusedLocals',
    description: 'Report errors on unused locals',
    current: false
  },
  {
    name: 'noUnusedParameters',
    description: 'Report errors on unused parameters',
    current: false
  }
];

function readTsConfig() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    throw new Error('tsconfig.json not found');
  }
  
  const content = fs.readFileSync(tsConfigPath, 'utf8');
  return JSON.parse(content);
}

function writeTsConfig(config) {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2) + '\n');
}

function createBackup() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  const backupPath = path.join(process.cwd(), `tsconfig.backup.${Date.now()}.json`);
  fs.copyFileSync(tsConfigPath, backupPath);
  log(`✓ Created backup: ${path.basename(backupPath)}`, 'green');
  return backupPath;
}

function checkTypeScript() {
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    return { success: true, errors: 0 };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    return { success: false, errors: errorCount, output };
  }
}

function enableStrictOption(optionName) {
  const config = readTsConfig();
  
  if (!config.compilerOptions) {
    config.compilerOptions = {};
  }
  
  config.compilerOptions[optionName] = true;
  writeTsConfig(config);
  
  log(`✓ Enabled ${optionName}`, 'green');
}

function disableStrictOption(optionName) {
  const config = readTsConfig();
  
  if (config.compilerOptions && config.compilerOptions[optionName] !== undefined) {
    config.compilerOptions[optionName] = false;
    writeTsConfig(config);
    log(`✗ Disabled ${optionName} (too many errors)`, 'yellow');
  }
}

function main() {
  logBold('🔧 TypeScript Strict Mode Enabler', 'cyan');
  console.log('');
  
  // Check current state
  log('📊 Checking current TypeScript compilation...', 'blue');
  const initialCheck = checkTypeScript();
  
  if (!initialCheck.success) {
    log(`❌ Current build has ${initialCheck.errors} TypeScript errors`, 'red');
    log('Please fix existing errors before enabling strict mode', 'yellow');
    process.exit(1);
  }
  
  log('✅ Current build is clean, proceeding with strict mode enablement', 'green');
  console.log('');
  
  // Create backup
  const backupPath = createBackup();
  console.log('');
  
  // Try enabling each strict option
  logBold('🎯 Enabling strict mode options incrementally...', 'blue');
  console.log('');
  
  let enabledCount = 0;
  const maxErrors = 10; // Maximum acceptable errors per option
  
  for (const option of strictOptions) {
    log(`Testing ${option.name}...`, 'cyan');
    log(`  ${option.description}`, 'white');
    
    // Enable the option
    enableStrictOption(option.name);
    
    // Check if it breaks the build
    const check = checkTypeScript();
    
    if (check.success) {
      log(`  ✅ Enabled successfully (0 errors)`, 'green');
      enabledCount++;
    } else if (check.errors <= maxErrors) {
      log(`  ⚠️  Enabled with ${check.errors} errors (acceptable)`, 'yellow');
      enabledCount++;
    } else {
      log(`  ❌ Too many errors (${check.errors}), disabling`, 'red');
      disableStrictOption(option.name);
    }
    
    console.log('');
  }
  
  // Final summary
  logBold('📋 Summary:', 'magenta');
  log(`✓ Successfully enabled ${enabledCount}/${strictOptions.length} strict mode options`, 'green');
  
  if (enabledCount === strictOptions.length) {
    log('🎉 Full strict mode enabled!', 'green');
    
    // Enable the main strict flag
    const config = readTsConfig();
    config.compilerOptions.strict = true;
    writeTsConfig(config);
    log('✓ Enabled main "strict" flag', 'green');
  } else {
    log(`📝 ${strictOptions.length - enabledCount} options need manual fixes`, 'yellow');
    log('Run this script again after fixing TypeScript errors', 'yellow');
  }
  
  console.log('');
  log(`💾 Backup saved to: ${path.basename(backupPath)}`, 'cyan');
  log('🔧 Run "npm run type-check" to verify the configuration', 'cyan');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the script
main();
