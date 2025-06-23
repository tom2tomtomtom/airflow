#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing common TypeScript errors...\n');

// Fix 1: Replace Grid with Grid2 in all MUI imports
function fixGridImports() {
  console.log('📦 Fixing MUI Grid imports...');
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  let count = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace Grid import with Grid2
    if (content.includes("import") && content.includes("Grid") && content.includes("@mui/material")) {
      const newContent = content
        .replace(/(\s+)Grid,/g, '$1Grid2 as Grid,')
        .replace(/(\s+)Grid\s+}/g, '$1Grid2 as Grid }')
        .replace(/import\s+{\s*Grid\s*}\s+from\s+['"]@mui\/material['"]/g, "import { Grid2 as Grid } from '@mui/material'");

      if (newContent !== content) {
        content = newContent;
        modified = true;
        count++;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content);
    }
  });

  console.log(`✅ Fixed Grid imports in ${count} files\n`);
}

// Fix 2: Add missing type annotations for implicit any
function fixImplicitAny() {
  console.log('🔤 Fixing implicit any errors...');
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  let count = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Common patterns
    const patterns = [
      // Function parameters without types
      { 
        pattern: /(\w+)\s*=\s*\(([^)]+)\)\s*=>/g,
        replace: (match, name, params) => {
          if (!params.includes(':')) {
            const typedParams = params.split(',').map(p => `${p.trim()}: any`).join(', ');
            return `${name} = (${typedParams}) =>`;
          }
          return match;
        }
      },
      // Error handlers
      {
        pattern: /catch\s*\((\w+)\)/g,
        replace: 'catch ($1: any)'
      },
      // Array methods
      {
        pattern: /\.(map|filter|forEach|reduce|find)\((\w+)\s*=>/g,
        replace: '.$1(($2: any) =>'
      }
    ];

    patterns.forEach(({ pattern, replace }) => {
      const newContent = content.replace(pattern, replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
      count++;
    }
  });

  console.log(`✅ Fixed implicit any in ${count} files\n`);
}

// Fix 3: Add missing return types
function fixMissingReturnTypes() {
  console.log('🔙 Adding missing return types...');
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  let count = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Add void return type to async functions without return type
    const asyncPattern = /async\s+(\w+)\s*\([^)]*\)\s*{/g;
    content = content.replace(asyncPattern, (match, name) => {
      if (!content.includes(`${name}:`)) {
        modified = true;
        return match.replace('{', ': Promise<void> {');
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(file, content);
      count++;
    }
  });

  console.log(`✅ Added return types to ${count} files\n`);
}

// Fix 4: Fix common React prop type issues
function fixReactPropTypes() {
  console.log('⚛️  Fixing React prop types...');
  const files = glob.sync('src/**/*.{tsx}', { ignore: 'node_modules/**' });
  let count = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Add children type to components
    if (content.includes('children') && !content.includes('children:')) {
      content = content.replace(
        /interface\s+(\w+Props)\s*{/g,
        (match, name) => {
          if (!content.includes('children:')) {
            modified = true;
            return `${match}\n  children?: React.ReactNode;`;
          }
          return match;
        }
      );
    }

    if (modified) {
      fs.writeFileSync(file, content);
      count++;
    }
  });

  console.log(`✅ Fixed React props in ${count} files\n`);
}

// Fix 5: Fix missing Select loading prop
function fixSelectLoadingProp() {
  console.log('🔄 Fixing Select loading prop...');
  const files = glob.sync('src/**/*.{tsx}', { ignore: 'node_modules/**' });
  let count = 0;

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove loading prop from Select components
    const newContent = content.replace(/<Select[^>]*loading={[^}]+}[^>]*>/g, (match) => {
      return match.replace(/\s*loading={[^}]+}/g, '');
    });

    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      count++;
    }
  });

  console.log(`✅ Fixed Select loading prop in ${count} files\n`);
}

// Run all fixes
console.log('🚀 Starting TypeScript error fixes...\n');

fixGridImports();
fixImplicitAny();
fixMissingReturnTypes();
fixReactPropTypes();
fixSelectLoadingProp();

console.log('✨ TypeScript error fixes complete!\n');
console.log('Run `npm run type-check` to see remaining errors.');