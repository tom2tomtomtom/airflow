#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Aggressive Console Statement Cleanup Tool
 * Removes console.log, console.warn, console.error, console.debug, console.info
 * while preserving console.assert and console.trace for critical debugging
 */

// Patterns to match console statements (preserving console.assert and console.trace)
const CONSOLE_PATTERNS = [
  /console\.log\s*\([^)]*\);?\s*$/gm,
  /console\.warn\s*\([^)]*\);?\s*$/gm,
  /console\.error\s*\([^)]*\);?\s*$/gm,
  /console\.debug\s*\([^)]*\);?\s*$/gm,
  /console\.info\s*\([^)]*\);?\s*$/gm,
  // Multi-line console statements
  /console\.(log|warn|error|debug|info)\s*\(\s*[\s\S]*?\)\s*;?\s*$/gm,
];

// Files to exclude from cleanup
const EXCLUDED_PATTERNS = [
  '**/node_modules/**',
  '**/coverage/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/*.min.js',
  '**/scripts/aggressive-console-cleanup.js', // Don't clean this file
];

// File extensions to process
const EXTENSIONS = ['js', 'ts', 'jsx', 'tsx'];

let totalFilesProcessed = 0;
let totalStatementsRemoved = 0;
const cleanupReport = [];

function shouldExcludeFile(filePath) {
  return EXCLUDED_PATTERNS.some(pattern => {
    // Simple pattern matching without minimatch for now
    const regex = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    return new RegExp(regex).test(filePath);
  });
}

function cleanConsoleStatements(content, filePath) {
  let cleanedContent = content;
  let statementsRemoved = 0;
  
  CONSOLE_PATTERNS.forEach(pattern => {
    const matches = cleanedContent.match(pattern);
    if (matches) {
      statementsRemoved += matches.length;
      cleanedContent = cleanedContent.replace(pattern, '');
    }
  });
  
  // Clean up empty lines left behind
  cleanedContent = cleanedContent.replace(/^\s*\n/gm, '');
  
  return { cleanedContent, statementsRemoved };
}

function processFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { cleanedContent, statementsRemoved } = cleanConsoleStatements(content, filePath);
    
    if (statementsRemoved > 0) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      cleanupReport.push({
        file: filePath,
        statementsRemoved,
        relativePath: path.relative(process.cwd(), filePath)
      });
      totalStatementsRemoved += statementsRemoved;
      console.log(`✓ Cleaned ${statementsRemoved} console statements from ${path.relative(process.cwd(), filePath)}`);
    }
    
    totalFilesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function generateReport() {
  const reportPath = path.join(process.cwd(), `console-cleanup-report-${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFilesProcessed,
      totalStatementsRemoved,
      filesModified: cleanupReport.length
    },
    files: cleanupReport
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Cleanup report saved to: ${reportPath}`);
  
  return report;
}

// Main execution
console.log('🧹 Starting aggressive console statement cleanup...\n');

const startTime = Date.now();

// Find all files to process
const allFiles = [];
EXTENSIONS.forEach(ext => {
  const pattern = `**/*.${ext}`;
  const files = glob.sync(pattern, { ignore: EXCLUDED_PATTERNS });
  allFiles.push(...files);
});

console.log(`Found ${allFiles.length} files to process\n`);

// Process each file
allFiles.forEach(processFile);

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

// Generate and display summary
const report = generateReport();

console.log('\n🎉 Console cleanup completed!');
console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
console.log(`📁 Files processed: ${report.summary.totalFilesProcessed}`);
console.log(`📝 Files modified: ${report.summary.filesModified}`);
console.log(`🗑️  Console statements removed: ${report.summary.totalStatementsRemoved}`);

if (report.summary.totalStatementsRemoved > 0) {
  console.log('\n📋 Top files cleaned:');
  cleanupReport
    .sort((a, b) => b.statementsRemoved - a.statementsRemoved)
    .slice(0, 10)
    .forEach(item => {
      console.log(`   • ${item.relativePath}: ${item.statementsRemoved} statements`);
    });
}