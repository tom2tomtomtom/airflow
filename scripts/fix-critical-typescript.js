#!/usr/bin/env node

/**
 * Critical TypeScript Fixes
 * Fixes the most critical TypeScript errors that prevent building
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Critical TypeScript Fixes');
console.log('============================\n');

let fixCount = 0;

// Fix 1: Remove unused imports
function removeUnusedImports() {
  console.log('1. Removing unused imports...');
  
  const unusedImports = [
    // From error report - most critical ones
    { file: 'src/components/ActivityFeed.tsx', imports: ['Alert', 'ExpandMoreIcon', 'ExpandLessIcon'] },
    { file: 'src/components/AIImageGenerator.tsx', imports: ['Slider'] },
    { file: 'src/components/AssetUploadModal.tsx', imports: ['Chip'] },
    { file: 'src/pages/dashboard.tsx', imports: ['useEffect', 'LinearProgress', 'DashboardIcon', 'VideoIcon'] },
    { file: 'src/pages/analytics.tsx', imports: ['IconButton', 'ListItemIcon', 'LineChart', 'Line'] },
    { file: 'src/pages/execute.tsx', imports: ['CardActions', 'IconButton'] },
    { file: 'src/pages/generate-enhanced.tsx', imports: ['CardActionArea', 'Divider', 'FormControl'] },
    { file: 'src/pages/matrix.tsx', imports: ['SpeedDial', 'SpeedDialAction', 'SpeedDialIcon', 'Tooltip', 'Badge'] }
  ];

  unusedImports.forEach(({ file, imports }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      imports.forEach(importName => {
        // Remove from import statements
        const importRegex = new RegExp(`\\s*,?\\s*${importName}\\s*,?`, 'g');
        const newContent = content.replace(importRegex, (match) => {
          // If it's the only import, remove the whole line
          if (content.includes(`import { ${importName} }`)) {
            return '';
          }
          // Otherwise just remove the import name
          return match.replace(importName, '').replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
        });

        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed imports in ${file}`);
        fixCount++;
      }
    }
  });
}

// Fix 2: Add missing type annotations
function addTypeAnnotations() {
  console.log('2. Adding type annotations...');
  
  const typeFixes = [
    {
      file: 'src/pages/clients.tsx',
      fixes: [
        { from: '(client)', to: '(client: any)' },
        { from: '.map((client)', to: '.map((client: any)' }
      ]
    },
    {
      file: 'src/pages/execute.tsx',
      fixes: [
        { from: '(c)', to: '(c: any)' },
        { from: '(m)', to: '(m: any)' },
        { from: '(campaign)', to: '(campaign: any)' }
      ]
    },
    {
      file: 'src/pages/matrix.tsx',
      fixes: [
        { from: '(t)', to: '(t: any)' },
        { from: '(template)', to: '(template: any)' },
        { from: '(asset)', to: '(asset: any)' }
      ]
    }
  ];

  typeFixes.forEach(({ file, fixes }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      fixes.forEach(({ from, to }) => {
        if (content.includes(from) && !content.includes(to)) {
          content = content.replace(new RegExp(from.replace(/[()]/g, '\\$&'), 'g'), to);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Added type annotations in ${file}`);
        fixCount++;
      }
    }
  });
}

// Fix 3: Fix type mismatches
function fixTypeMismatches() {
  console.log('3. Fixing type mismatches...');
  
  // Fix specific type issues from the error report
  const typeFixes = [
    {
      file: 'src/contexts/ClientContext.tsx',
      from: 'lastModified: string;',
      to: 'lastModified?: string;'
    },
    {
      file: 'src/pages/api/auth/login.ts',
      from: 'name: string;',
      to: 'name?: string;'
    }
  ];

  typeFixes.forEach(({ file, from, to }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      if (content.includes(from) && !content.includes(to)) {
        content = content.replace(from, to);
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed type mismatch in ${file}`);
        fixCount++;
      }
    }
  });
}

// Fix 4: Remove unused variables
function removeUnusedVariables() {
  console.log('4. Fixing unused variables...');
  
  const variableFixes = [
    { file: 'src/components/ActivityFeed.tsx', from: 'const user =', to: 'const _user =' },
    { file: 'src/pages/assets.tsx', from: 'const event =', to: 'const _event =' },
    { file: 'src/pages/campaigns/[id].tsx', from: 'const event =', to: 'const _event =' },
    { file: 'src/pages/execute.tsx', from: 'const router =', to: 'const _router =' },
    { file: 'src/pages/execute.tsx', from: 'const assets =', to: 'const _assets =' }
  ];

  variableFixes.forEach(({ file, from, to }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      if (content.includes(from) && !content.includes(to)) {
        content = content.replace(from, to);
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed unused variable in ${file}`);
        fixCount++;
      }
    }
  });
}

// Fix 5: Fix missing properties
function fixMissingProperties() {
  console.log('5. Fixing missing properties...');
  
  // Add optional chaining where properties might not exist
  const propertyFixes = [
    {
      file: 'src/pages/campaigns/[id].tsx',
      from: '.total',
      to: '?.total'
    },
    {
      file: 'src/pages/campaigns/[id]/edit.tsx',
      from: '.schedule',
      to: '?.schedule'
    }
  ];

  propertyFixes.forEach(({ file, from, to }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Only replace if not already using optional chaining
      const regex = new RegExp(`([a-zA-Z_$][a-zA-Z0-9_$]*)${from.replace('.', '\\.')}`, 'g');
      content = content.replace(regex, (match, varName) => {
        if (!match.includes('?.')) {
          modified = true;
          return varName + to;
        }
        return match;
      });

      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed missing properties in ${file}`);
        fixCount++;
      }
    }
  });
}

// Fix 6: Clean up import statements
function cleanupImports() {
  console.log('6. Cleaning up import statements...');
  
  const files = [
    'src/pages/api/auth/login.ts',
    'src/pages/api/auth/signup.ts'
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Remove empty import lines
      content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]*['"];\s*\n/g, '');
      
      // Clean up imports with only commas
      content = content.replace(/import\s*{\s*,\s*}\s*from/g, 'import {} from');
      
      // Remove trailing commas in imports
      content = content.replace(/import\s*{\s*([^}]*),\s*}\s*from/g, 'import { $1 } from');

      if (content !== fs.readFileSync(file, 'utf8')) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Cleaned up imports in ${file}`);
        fixCount++;
        modified = true;
      }
    }
  });
}

// Main execution
async function main() {
  try {
    removeUnusedImports();
    addTypeAnnotations();
    fixTypeMismatches();
    removeUnusedVariables();
    fixMissingProperties();
    cleanupImports();

    console.log(`\n🎉 Applied ${fixCount} critical TypeScript fixes!`);
    
    // Test the fixes
    console.log('\n🧪 Testing TypeScript compilation...');
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful!');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`⚠️  ${errorCount} TypeScript errors remaining (down from 276)`);
      
      // Save remaining errors
      fs.writeFileSync('typescript-errors-remaining.log', output);
      console.log('📝 Saved remaining errors to typescript-errors-remaining.log');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test: npm run debug:auth');
    console.log('3. Test: npm run test:auth');

  } catch (error) {
    console.error('❌ Fix script failed:', error);
    process.exit(1);
  }
}

main();
