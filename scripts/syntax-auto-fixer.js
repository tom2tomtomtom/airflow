#!/usr/bin/env node
/**
 * EMERGENCY SYNTAX AUTO-FIXER
 * Automatically fixes common syntax patterns causing 448 TypeScript errors
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY SYNTAX AUTO-FIXER STARTING...\n');

// Auto-fix patterns for most common errors
const autoFixPatterns = [
  // TS1005: Missing comma or semicolon
  {
    code: 'TS1005',
    patterns: [
      // Fix missing commas in object literals
      { from: /(\w+)(\s*:\s*[^,}\n]+)(\n\s*)(\w+):/g, to: '$1$2,$3$4:' },
      // Fix missing semicolons after statements
      { from: /(\w+\s*=\s*[^;}\n]+)(\n)/g, to: '$1;$2' },
      // Fix missing commas in function parameters
      { from: /(\w+:\s*\w+)(\s+)(\w+:)/g, to: '$1,$2$3' }
    ]
  },
  
  // TS1128: Declaration or statement expected
  {
    code: 'TS1128',
    patterns: [
      // Fix incomplete function declarations
      { from: /^(\s*)(\w+)\s*\(\s*$/gm, to: '$1export function $2() {' },
      // Fix incomplete variable declarations
      { from: /^(\s*)(\w+)\s*=\s*$/gm, to: '$1const $2 = ' }
    ]
  },
  
  // TS1109: Expression expected
  {
    code: 'TS1109',
    patterns: [
      // Fix incomplete expressions
      { from: /(\w+\s*[+\-*/=]\s*)$/gm, to: '$1undefined' },
      // Fix hanging operators
      { from: /^\s*[+\-*/=]\s*$/gm, to: '' }
    ]
  }
];

// Get list of critical files from audit
const auditReport = JSON.parse(fs.readFileSync('./emergency-audit-report.json'));
const criticalFiles = auditReport.criticalFiles.map(f => f.file);

console.log(`🎯 Auto-fixing ${criticalFiles.length} critical files...`);

let totalFixesApplied = 0;
const fixResults = [];

criticalFiles.forEach((filePath, index) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  console.log(`\n${index + 1}/${criticalFiles.length}: Processing ${filePath}`);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    let fileFixCount = 0;
    
    // Apply auto-fix patterns
    autoFixPatterns.forEach(pattern => {
      pattern.patterns.forEach(fix => {
        const matches = content.match(fix.from);
        if (matches) {
          content = content.replace(fix.from, fix.to);
          const fixCount = matches.length;
          fileFixCount += fixCount;
          console.log(`  ✅ Applied ${fix.from.source.slice(0, 30)}... (${fixCount} fixes)`);
        }
      });
    });
    
    // Emergency syntax fixes for severely broken files
    if (filePath.includes('templateEngine.ts') || filePath.includes('metrics.ts')) {
      console.log(`  🚨 Emergency reconstruction for ${filePath}`);
      
      // Check if file is completely broken
      const syntaxErrorDensity = fileFixCount / content.split('\n').length;
      if (syntaxErrorDensity > 0.1) {
        console.log(`  🔧 High error density (${syntaxErrorDensity.toFixed(2)}), applying emergency fixes`);
        
        // Basic structural fixes
        content = content
          // Fix incomplete function definitions
          .replace(/^\s*export\s+(\w+)\s*\(/gm, 'export function $1(')
          // Fix incomplete object definitions  
          .replace(/^\s*(\w+)\s*:\s*\{$/gm, '$1: {')
          // Fix incomplete type definitions
          .replace(/^\s*(\w+)\s*:\s*$/gm, '$1: any;')
          // Add missing closing braces (basic heuristic)
          .replace(/\{\s*$/gm, '{}')
          // Remove incomplete lines
          .replace(/^\s*[+\-*/=<>!&|]+\s*$/gm, '')
          // Fix incomplete imports
          .replace(/^import\s+\{[^}]*$/gm, '')
          // Add default exports for completely broken files
          .replace(/^export\s*$/gm, 'export default {};');
      }
    }
    
    // Only save if changes were made
    if (content !== originalContent) {
      // Create backup
      fs.writeFileSync(fullPath + '.backup', originalContent);
      fs.writeFileSync(fullPath, content);
      
      totalFixesApplied += fileFixCount;
      fixResults.push({
        file: filePath,
        fixesApplied: fileFixCount,
        status: 'fixed'
      });
      
      console.log(`  ✅ Applied ${fileFixCount} fixes, backup saved`);
    } else {
      console.log(`  ⚠️  No automatic fixes applicable`);
      fixResults.push({
        file: filePath,
        fixesApplied: 0,
        status: 'no_fixes_available'
      });
    }
    
  } catch (error) {
    console.log(`  ❌ Error processing file: ${error.message}`);
    fixResults.push({
      file: filePath,
      fixesApplied: 0,
      status: 'error',
      error: error.message
    });
  }
});

// Save fix results
const fixReport = {
  timestamp: new Date().toISOString(),
  totalFilesProcessed: criticalFiles.length,
  totalFixesApplied,
  fixResults
};

fs.writeFileSync('./syntax-fix-report.json', JSON.stringify(fixReport, null, 2));

console.log('\n📊 AUTO-FIX RESULTS');
console.log('='.repeat(50));
console.log(`Files Processed: ${fixReport.totalFilesProcessed}`);
console.log(`Total Fixes Applied: ${fixReport.totalFixesApplied}`);
console.log(`Success Rate: ${(fixResults.filter(r => r.fixesApplied > 0).length / criticalFiles.length * 100).toFixed(1)}%`);

console.log('\n🎯 NEXT STEPS:');
console.log('1. Run TypeScript compilation check');
console.log('2. Review files that still need manual fixes');
console.log('3. Test build to ensure no regressions');

console.log('\n⚡ EMERGENCY SYNTAX AUTO-FIXER COMPLETE');