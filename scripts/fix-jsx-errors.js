#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixJSXErrors = () => {
  console.log('🔧 FIXING JSX SYNTAX ERRORS');
  console.log('===============================');

  const filesToFix = [
    'src/components/UserMenu.tsx',
    'src/components/workflow/WorkflowContainer.tsx', 
    'src/contexts/AuthContext.tsx',
    'src/contexts/ClientContext.tsx',
    'src/contexts/NotificationContext.tsx'
  ];

  let fixedCount = 0;

  filesToFix.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix specific patterns
    
    // Fix UserMenu JSX context issue - check for missing function context
    if (filePath.includes('UserMenu.tsx')) {
      // Look for return statement without proper function context
      const returnMatch = content.match(/(\s+)return\s*\(\s*<Box>/);
      if (returnMatch) {
        // Check if we're in a proper function
        const beforeReturn = content.substring(0, content.indexOf('return ('));
        if (!beforeReturn.includes('= () => {') && !beforeReturn.includes('function ')) {
          console.log(`  ❌ UserMenu: Missing function context before JSX return`);
          // This needs manual inspection
        }
      }
    }

    // Fix object literal syntax in ClientContext
    if (filePath.includes('ClientContext.tsx')) {
      content = content.replace(/const newClient: Client = \{,/g, 'const newClient: Client = {');
      content = content.replace(/(\w+):\s*([^,}\n]+),\s*\n\s*(\w+):/g, '$1: $2,\n        $3:');
    }

    // Fix JSX component context issues
    content = content.replace(/return\s*\(\s*<(\w+Context\.Provider)/g, 'return (\n    <$1');
    content = content.replace(/return\s*\(\s*<(Dialog|Box|AuthContext)/g, 'return (\n    <$1');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed ${filePath}`);
      fixedCount++;
    } else {
      console.log(`  ⚪ No changes needed for ${filePath}`);
    }
  });

  console.log(`\n📋 SUMMARY: Fixed ${fixedCount} files`);
  return fixedCount;
};

if (require.main === module) {
  fixJSXErrors();
}

module.exports = { fixJSXErrors };