#!/usr/bin/env node

/**
 * Cleanup Script
 * 
 * This script removes duplicate and temporary files from the repository
 * Part of Issue #12: Clean up duplicate page files and temporary files
 */

const fs = require('fs');
const path = require('path');

// Files to be removed
const filesToRemove = [
  'src/pages/matrix-new.tsx',
  'src/pages/templates-new.tsx', 
  'src/pages/generate-new.tsx',
  // Add any other temporary or duplicate files here
];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

console.log('🧹 Starting cleanup of duplicate and temporary files...\n');

let removedCount = 0;
let notFoundCount = 0;

filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`${colors.green}✅ Removed: ${file}${colors.reset}`);
      removedCount++;
    } else {
      console.log(`${colors.yellow}⚠️  Not found: ${file}${colors.reset}`);
      notFoundCount++;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error removing ${file}: ${error.message}${colors.reset}`);
  }
});

// Summary
console.log('\n📊 Cleanup Summary:');
console.log(`${colors.green}✅ Files removed: ${removedCount}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Files not found: ${notFoundCount}${colors.reset}`);

// Check for other potential cleanup candidates
console.log('\n🔍 Checking for other potential cleanup candidates...');

const patternsToCheck = [
  { pattern: /\.tmp$/, description: 'Temporary files' },
  { pattern: /\.bak$/, description: 'Backup files' },
  { pattern: /^\./, description: 'Hidden files (excluding .env, .git)' },
  { pattern: /-old\.(tsx?|jsx?)$/, description: 'Old versions' },
  { pattern: /-backup\.(tsx?|jsx?)$/, description: 'Backup versions' },
  { pattern: /\.log$/, description: 'Log files' },
];

function checkDirectory(dir, patterns) {
  const candidates = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
        candidates.push(...checkDirectory(filePath, patterns));
      } else if (stat.isFile()) {
        patterns.forEach(({ pattern, description }) => {
          if (pattern.test(file)) {
            // Exclude important files
            if (!file.includes('.env') && !file.includes('.git') && !file.includes('config')) {
              candidates.push({ path: filePath, type: description });
            }
          }
        });
      }
    });
  } catch (error) {
    // Ignore permission errors
  }
  
  return candidates;
}

const candidates = checkDirectory('.', patternsToCheck);

if (candidates.length > 0) {
  console.log('\n💡 Found potential cleanup candidates:');
  candidates.forEach(({ path: filePath, type }) => {
    console.log(`   ${colors.yellow}- ${filePath} (${type})${colors.reset}`);
  });
  console.log('\n💡 Review these files and remove manually if needed.');
} else {
  console.log(`${colors.green}✅ No additional cleanup candidates found.${colors.reset}`);
}

console.log('\n✨ Cleanup complete!');