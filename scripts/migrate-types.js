#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 AIRWAVE TypeScript Migration Tool\n');

// Common type fixes
const commonFixes = {
  // Fix untyped function parameters
  fixUntypedParams: (content) => {
    // Replace common untyped patterns
    content = content.replace(
      /function\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*{/g,
      (match, funcName, params) => {
        if (params && !params.includes(':')) {
          // Add basic typing for common patterns
          const typedParams = params.split(',').map(param => {
            const trimmed = param.trim();
            if (trimmed.includes('data')) return `${trimmed}: any[]`;
            if (trimmed.includes('id')) return `${trimmed}: string`;
            if (trimmed.includes('event')) return `${trimmed}: Event`;
            if (trimmed.includes('error')) return `${trimmed}: Error`;
            return `${trimmed}: unknown`;
          }).join(', ');
          return `function ${funcName}(${typedParams}) {`;
        }
        return match;
      }
    );

    // Fix arrow functions
    content = content.replace(
      /const\s+(\w+)\s*=\s*\(\s*([^)]*)\s*\)\s*=>/g,
      (match, funcName, params) => {
        if (params && !params.includes(':') && params.trim() !== '') {
          const typedParams = params.split(',').map(param => {
            const trimmed = param.trim();
            if (trimmed.includes('data')) return `${trimmed}: any[]`;
            if (trimmed.includes('id')) return `${trimmed}: string`;
            if (trimmed.includes('event')) return `${trimmed}: Event`;
            return `${trimmed}: unknown`;
          }).join(', ');
          return `const ${funcName} = (${typedParams}) =>`;
        }
        return match;
      }
    );

    return content;
  },

  // Add null checks
  addNullChecks: (content) => {
    // Replace common property access patterns with optional chaining
    content = content.replace(
      /(\w+)\.(\w+)\.(\w+)/g,
      (match, obj, prop1, prop2) => {
        // Only add optional chaining for common patterns that might be null
        if (['user', 'data', 'response', 'props', 'state'].includes(obj)) {
          return `${obj}?.${prop1}?.${prop2}`;
        }
        return match;
      }
    );

    return content;
  },

  // Fix React component props
  fixReactProps: (content) => {
    // Add interface for component props
    content = content.replace(
      /export\s+default\s+function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/g,
      (match, componentName, props) => {
        const propNames = props.split(',').map(p => p.trim());
        const interfaceName = `${componentName}Props`;
        
        const interfaceProps = propNames.map(prop => {
          if (prop.includes('on') && prop.includes('Click')) {
            return `  ${prop}: () => void;`;
          }
          if (prop.includes('children')) {
            return `  ${prop}: React.ReactNode;`;
          }
          return `  ${prop}: any;`;
        }).join('\n');

        const interfaceDeclaration = `interface ${interfaceName} {\n${interfaceProps}\n}\n\n`;
        
        return interfaceDeclaration + `export default function ${componentName}({ ${props} }: ${interfaceName})`;
      }
    );

    return content;
  },

  // Fix imports
  fixImports: (content) => {
    // Add React import if JSX is used but React is not imported
    if (content.includes('<') && content.includes('>') && !content.includes('import React')) {
      content = "import React from 'react';\n" + content;
    }

    return content;
  }
};

// Process files
const files = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'] 
});

console.log(`Found ${files.length} files to process\n`);

let processedCount = 0;
let errorCount = 0;

files.forEach((filePath, index) => {
  console.log(`Processing ${index + 1}/${files.length}: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = commonFixes.fixUntypedParams(content);
    content = commonFixes.addNullChecks(content);
    
    if (filePath.endsWith('.tsx')) {
      content = commonFixes.fixReactProps(content);
      content = commonFixes.fixImports(content);
    }
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      processedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\n✅ Initial migration complete!');
console.log(`📊 Statistics:`);
console.log(`   - Files processed: ${processedCount}`);
console.log(`   - Errors: ${errorCount}`);
console.log('\nNext steps:');
console.log('1. Run: npm run type-check:phase1');
console.log('2. Fix remaining errors manually');
console.log('3. Move to phase 2');
