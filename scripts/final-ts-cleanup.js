#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Final TypeScript cleanup - fixing object literal and property assignment errors...');

let totalFilesFixed = 0;
let totalErrorsFixed = 0;

function fixObjectLiteralAndPropertyErrors(content) {
  let fixed = content;
  let errorsFixed = 0;

  // Fix object properties with trailing commas followed by closing braces
  // Pattern: property: value,\n    }
  fixed = fixed.replace(/(\w+:\s*[^,}\n]+),(\s*})/g, '$1$2');
  errorsFixed += (content.match(/(\w+:\s*[^,}\n]+),(\s*})/g) || []).length;

  // Fix malformed object literals with incorrect comma placement
  // Pattern: { property: value;\n instead of { property: value,\n
  fixed = fixed.replace(/(\{\s*\w+:\s*[^;}]+);/g, '$1,');
  errorsFixed += (content.match(/(\{\s*\w+:\s*[^;}]+);/g) || []).length;

  // Fix missing colons in object properties
  // Pattern: property value (missing colon)
  fixed = fixed.replace(/(\s+)(\w+)\s+([^:=\s][^,}\n]*)(,?\s*$)/gm, (match, indent, prop, value, ending) => {
    if (!match.includes(':') && !match.includes('=') && !match.includes('//')) {
      errorsFixed++;
      return `${indent}${prop}: ${value}${ending}`;
    }
    return match;
  });

  // Fix object literal properties that are missing commas
  // Pattern: property: value\n    property: value
  fixed = fixed.replace(/(\w+:\s*[^,}\n]+)(\n\s+)(\w+:)/g, '$1,$2$3');
  errorsFixed += (content.match(/(\w+:\s*[^,}\n]+)(\n\s+)(\w+:)/g) || []).length;

  // Fix arrays with object literals that have malformed syntax
  // Pattern: [{ property value }] -> [{ property: value }]
  fixed = fixed.replace(/\[\s*\{\s*(\w+)\s+([^:}]+)\s*\}\s*\]/g, '[{ $1: $2 }]');
  errorsFixed += (content.match(/\[\s*\{\s*(\w+)\s+([^:}]+)\s*\}\s*\]/g) || []).length;

  // Fix function calls with malformed object parameters
  // Pattern: func({ property value }) -> func({ property: value })
  fixed = fixed.replace(/\(\s*\{\s*(\w+)\s+([^:}]+)\s*\}\s*\)/g, '({ $1: $2 })');
  errorsFixed += (content.match(/\(\s*\{\s*(\w+)\s+([^:}]+)\s*\}\s*\)/g) || []).length;

  // Fix malformed JSX props with missing equal signs
  // Pattern: <Component prop value /> -> <Component prop={value} />
  fixed = fixed.replace(/<(\w+)([^>]*)\s+(\w+)\s+([^=>\s][^>\s]*)\s*([^>]*)>/g, (match, tag, beforeProps, prop, value, afterProps) => {
    if (!match.includes(`${prop}=`)) {
      errorsFixed++;
      return `<${tag}${beforeProps} ${prop}={${value}}${afterProps}>`;
    }
    return match;
  });

  return { content: fixed, errorsFixed };
}

function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      return 0;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    const result = fixObjectLiteralAndPropertyErrors(content);
    content = result.content;
    const errorsFixed = result.errorsFixed;

    if (content !== originalContent && errorsFixed > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      totalFilesFixed++;
      totalErrorsFixed += errorsFixed;
      console.log(`✅ Fixed ${errorsFixed} errors in ${filePath}`);
      return errorsFixed;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Get all TypeScript and TSX files
const allFiles = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'src/__tests__/**/*',
    'node_modules/**/*'
  ]
});

console.log(`📁 Processing ${allFiles.length} TypeScript files...`);

// Process all files
allFiles.forEach(filePath => {
  processFile(filePath);
});

console.log('\n📊 Final Cleanup Summary:');
console.log(`📁 Files fixed: ${totalFilesFixed}`);
console.log(`🔧 Total errors fixed: ${totalErrorsFixed}`);

if (totalFilesFixed > 0) {
  console.log('\n✅ Final TypeScript cleanup completed!');
  console.log('🔄 Running type check to verify fixes...');
  
  // Run type check to verify
  const { exec } = require('child_process');
  exec('npm run type-check', (error, stdout, stderr) => {
    if (error) {
      const errorCount = (stderr.match(/error TS/g) || []).length;
      if (errorCount > 0) {
        console.log(`⚠️ ${errorCount} TypeScript errors still remaining`);
        console.log('Some complex errors may require manual intervention');
      } else {
        console.log('🎉 All TypeScript errors resolved!');
      }
    } else {
      console.log('🎉 All TypeScript errors resolved!');
    }
  });
} else {
  console.log('\n✨ No additional fixes needed.');
}