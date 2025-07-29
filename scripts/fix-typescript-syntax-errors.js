#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Starting TypeScript syntax error fixes...');

// Files with known syntax errors
const problematicFiles = [
  'src/pages/api/approval-workflow.ts',
  'src/pages/api/approvals/bulk.ts',
  'src/pages/api/auth/csrf-token.ts',
  'src/pages/api/docs.ts',
  'src/pages/api/execution-schedule.ts',
  'src/pages/api/health/live.ts',
  'src/pages/api/motivation-select.ts',
  'src/pages/api/status.ts',
  'src/pages/api/templates.ts'
];

let fixedFilesCount = 0;
let totalErrorsFixed = 0;

function fixSyntaxErrors(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let errorsFixed = 0;

  // Fix malformed try-catch blocks
  // Pattern: return try { res.status(...).json(...) } catch (error) { ... });
  const malformedTryCatchPattern = /return try \{\s*res\.status\([^}]+\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*\);?/g;
  
  content = content.replace(malformedTryCatchPattern, (match) => {
    errorsFixed++;
    
    // Extract status and message
    const statusMatch = match.match(/res\.status\((\d+)\)\.json\(([^}]+\})\)/);
    if (statusMatch) {
      const status = statusMatch[1];
      const jsonContent = statusMatch[2];
      return `return res.status(${status}).json(${jsonContent});`;
    }
    
    // Fallback: return a basic 405 error
    return `return res.status(405).json({ success: false, message: 'Method not allowed' });`;
  });

  // Fix Expression expected errors after return statements
  content = content.replace(/return try \{([^}]+)\}/, 'try {\n    $1\n  }');

  // Fix missing semicolons and commas in object literals
  content = content.replace(/\}\s*\)\s*;\s*\}\s*catch/g, '}\n  } catch');
  
  // Fix missing imports for logger and handleApiError
  if (content.includes('logger.error') && !content.includes('import') && !content.includes('logger')) {
    content = `import { logger } from '@/lib/logger';\nimport { handleApiError } from '@/lib/api-response';\n\n${content}`;
    errorsFixed++;
  }

  // Fix declaration or statement expected errors
  content = content.replace(/\s*\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*\);?\s*\}/g, '\n  }');

  // Clean up any remaining malformed patterns
  content = content.replace(/\s*\}\s*\);\s*\}\s*catch/g, '\n  } catch');
  content = content.replace(/\s*\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*\);/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    fixedFilesCount++;
    totalErrorsFixed += errorsFixed;
    console.log(`✅ Fixed ${errorsFixed} errors in ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
  }

  return errorsFixed;
}

// Process all problematic files
problematicFiles.forEach(filePath => {
  fixSyntaxErrors(filePath);
});

// Also scan for other .ts and .tsx files that might have similar issues
const allTsFiles = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'] 
});

let additionalFilesChecked = 0;

allTsFiles.forEach(filePath => {
  if (!problematicFiles.includes(filePath)) {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for malformed try-catch patterns
    if (content.includes('return try {') || content.match(/\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*\);/)) {
      console.log(`🔍 Found potential syntax issues in ${filePath}`);
      fixSyntaxErrors(filePath);
    }
    additionalFilesChecked++;
  }
});

console.log('\n📊 TypeScript Syntax Fix Summary:');
console.log(`✅ Files fixed: ${fixedFilesCount}`);
console.log(`🔧 Total errors fixed: ${totalErrorsFixed}`);
console.log(`📁 Additional files checked: ${additionalFilesChecked}`);

if (fixedFilesCount > 0) {
  console.log('\n🎉 TypeScript syntax errors have been fixed!');
  console.log('🔄 Run "npm run type-check" to verify the fixes.');
} else {
  console.log('\n✨ No syntax errors found or all files were already clean.');
}