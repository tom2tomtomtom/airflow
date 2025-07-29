#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Comprehensive TypeScript syntax error fixes...');

// Files that need fixing based on the TypeScript error output
const problematicFiles = [
  'src/pages/api/approvals/bulk.ts',
  'src/pages/api/execution-schedule.ts',
  'src/pages/api/health/live.ts',
  'src/pages/api/motivation-select.ts',
  'src/pages/api/status.ts',
  'src/pages/api/templates.ts'
];

let totalFixed = 0;

function fixMalformedTryCatch(content) {
  let fixed = content;
  let changesMade = false;

  // Pattern 1: Malformed try block after return statement
  const pattern1 = /return try \{\s*res\.status\([^}]+\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*\);?/g;
  if (pattern1.test(fixed)) {
    fixed = fixed.replace(pattern1, (match) => {
      // Extract status code and message
      const statusMatch = match.match(/res\.status\((\d+)\)\.json\(([^}]+\})\)/);
      if (statusMatch) {
        const status = statusMatch[1];
        const jsonContent = statusMatch[2];
        return `return res.status(${status}).json(${jsonContent});`;
      }
      return 'return res.status(405).json({ success: false, message: "Method not allowed" });';
    });
    changesMade = true;
  }

  // Pattern 2: Malformed method check with broken try-catch
  const pattern2 = /if \([^{]+\) \{\s*try \{\s*res\.status[^}]*\}\s*return handleApiError[^}]*\}\s*\);?\s*\}/g;
  if (pattern2.test(fixed)) {
    fixed = fixed.replace(pattern2, (match) => {
      // Extract the condition from the if statement
      const conditionMatch = match.match(/if \(([^{]+)\) \{/);
      if (conditionMatch) {
        const condition = conditionMatch[1];
        return `if (${condition}) {\n    return res.status(405).json({ success: false, message: 'Method not allowed' });\n  }`;
      }
      return match;
    });
    changesMade = true;
  }

  // Pattern 3: Incomplete JSON objects and missing closing braces
  fixed = fixed.replace(/res\.status\(\d+\)\.json\(\{[^}]*$/gm, (match) => {
    if (!match.includes('}')) {
      return match + ' });';
    }
    return match;
  });

  // Pattern 4: Fix standalone catch blocks
  fixed = fixed.replace(/\s*\}\s*catch\s*\([^)]+\)\s*\{[^}]*\}\s*\);?/g, '');

  // Pattern 5: Fix malformed return statements followed by try
  fixed = fixed.replace(/return try \{([^}]+)\}/g, 'try {\n    $1\n  }');

  return { content: fixed, changed: changesMade };
}

function fixSpecificFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  const originalContent = fs.readFileSync(fullPath, 'utf8');
  const result = fixMalformedTryCatch(originalContent);

  if (result.changed) {
    fs.writeFileSync(fullPath, result.content, 'utf8');
    console.log(`✅ Fixed syntax errors in ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
    return false;
  }
}

// Fix all problematic files
problematicFiles.forEach(filePath => {
  if (fixSpecificFile(filePath)) {
    totalFixed++;
  }
});

console.log(`\n📊 Fixed ${totalFixed} files with syntax errors`);

// Run type check to verify fixes
console.log('\n🔍 Running type check to verify fixes...');
const { exec } = require('child_process');

exec('npm run type-check', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Type check still shows errors:');
    console.log(stderr);
  } else {
    console.log('✅ Type check passed! All syntax errors fixed.');
  }
});