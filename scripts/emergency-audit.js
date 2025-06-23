#!/usr/bin/env node
/**
 * EMERGENCY TYPESCRIPT AUDIT & TRIAGE TOOL
 * Categorizes and prioritizes 300+ TypeScript errors for systematic fixing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY TYPESCRIPT AUDIT & TRIAGE STARTING...\n');

// Step 1: Get all TypeScript errors
console.log('📊 Collecting TypeScript errors...');
let errorOutput = '';
try {
  execSync('npx tsc --noEmit --pretty false', { encoding: 'utf-8', stdio: 'pipe' });
} catch (error) {
  errorOutput = error.stdout || error.stderr || '';
}

// Step 2: Parse and categorize errors
const errors = errorOutput.split('\n').filter(line => line.includes('error TS'));
console.log(`Found ${errors.length} TypeScript errors`);

// Error categorization
const errorCategories = {
  syntax: { pattern: /TS1\d{3}/, errors: [], priority: 1 },
  imports: { pattern: /TS2304|TS2307|TS2306/, errors: [], priority: 2 },
  types: { pattern: /TS2\d{3}/, errors: [], priority: 3 },
  unused: { pattern: /TS6133|TS6196/, errors: [], priority: 4 },
  other: { pattern: /.*/, errors: [], priority: 5 }
};

// File impact analysis
const fileErrors = {};
const errorDetails = [];

errors.forEach(error => {
  const match = error.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (match) {
    const [, file, line, col, code, message] = match;
    
    // Count errors per file
    if (!fileErrors[file]) fileErrors[file] = [];
    fileErrors[file].push({ line: parseInt(line), col: parseInt(col), code, message });
    
    // Categorize error
    const errorDetail = { file, line: parseInt(line), col: parseInt(col), code, message, error };
    errorDetails.push(errorDetail);
    
    // Assign to category
    let categorized = false;
    for (const [category, data] of Object.entries(errorCategories)) {
      if (category !== 'other' && data.pattern.test(code)) {
        data.errors.push(errorDetail);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      errorCategories.other.errors.push(errorDetail);
    }
  }
});

// Step 3: Generate comprehensive audit report
const auditReport = {
  timestamp: new Date().toISOString(),
  totalErrors: errors.length,
  categories: {},
  criticalFiles: [],
  quickWins: [],
  automationTargets: [],
  recommendations: []
};

// Analyze categories
Object.entries(errorCategories).forEach(([category, data]) => {
  auditReport.categories[category] = {
    count: data.errors.length,
    priority: data.priority,
    percentage: ((data.errors.length / errors.length) * 100).toFixed(1)
  };
});

// Identify critical files (most errors)
const sortedFiles = Object.entries(fileErrors)
  .sort(([,a], [,b]) => b.length - a.length)
  .slice(0, 10);

auditReport.criticalFiles = sortedFiles.map(([file, errors]) => ({
  file: file.replace(process.cwd() + '/', ''),
  errorCount: errors.length,
  types: [...new Set(errors.map(e => e.code))].slice(0, 5)
}));

// Identify quick wins (single error files)
const quickWinFiles = Object.entries(fileErrors)
  .filter(([,errors]) => errors.length === 1)
  .slice(0, 20);

auditReport.quickWins = quickWinFiles.map(([file, errors]) => ({
  file: file.replace(process.cwd() + '/', ''),
  error: errors[0].code,
  message: errors[0].message.slice(0, 100)
}));

// Automation targets (repeated patterns)
const codeFrequency = {};
errorDetails.forEach(error => {
  codeFrequency[error.code] = (codeFrequency[error.code] || 0) + 1;
});

auditReport.automationTargets = Object.entries(codeFrequency)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([code, count]) => ({ code, count }));

// Generate recommendations
auditReport.recommendations = [
  `1. CRITICAL: Fix ${auditReport.criticalFiles.length} files with highest error density`,
  `2. QUICK WINS: Address ${auditReport.quickWins.length} single-error files first`,
  `3. AUTOMATION: Create fixers for top ${auditReport.automationTargets.length} error patterns`,
  `4. SYNTAX PRIORITY: ${auditReport.categories.syntax.count} syntax errors (${auditReport.categories.syntax.percentage}%)`,
  `5. IMPORT ISSUES: ${auditReport.categories.imports.count} import errors (${auditReport.categories.imports.percentage}%)`
];

// Step 4: Output results
console.log('\n📋 EMERGENCY AUDIT RESULTS');
console.log('='.repeat(50));
console.log(`Total Errors: ${auditReport.totalErrors}`);
console.log('\nError Categories:');
Object.entries(auditReport.categories).forEach(([category, data]) => {
  console.log(`  ${category.toUpperCase()}: ${data.count} errors (${data.percentage}%)`);
});

console.log('\n🔥 TOP 10 CRITICAL FILES:');
auditReport.criticalFiles.forEach((file, i) => {
  console.log(`  ${i+1}. ${file.file} (${file.errorCount} errors)`);
});

console.log('\n⚡ QUICK WIN OPPORTUNITIES:');
auditReport.quickWins.slice(0, 5).forEach((file, i) => {
  console.log(`  ${i+1}. ${file.file} - ${file.error}`);
});

console.log('\n🤖 AUTOMATION TARGETS:');
auditReport.automationTargets.slice(0, 5).forEach((target, i) => {
  console.log(`  ${i+1}. ${target.code} (${target.count} occurrences)`);
});

console.log('\n💡 RECOMMENDATIONS:');
auditReport.recommendations.forEach(rec => console.log(`  ${rec}`));

// Step 5: Save detailed report
const reportPath = path.join(process.cwd(), 'emergency-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));

console.log(`\n📄 Detailed report saved to: ${reportPath}`);
console.log('\n🎯 EMERGENCY AUDIT COMPLETE - READY FOR SYSTEMATIC FIXING');