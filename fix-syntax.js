#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common syntax error patterns and their fixes
const patterns = [
  // Pattern 1: headers: {}, property: value}
  {
    regex: /headers:\s*\{\},\s*([^}]+)\}/g,
    replace: 'headers: {\n        $1\n      }'
  },
  // Pattern 2: metadata: {}, property: value}
  {
    regex: /metadata:\s*\{\},\s*([^}]+)\}/g,
    replace: 'metadata: {\n        $1\n      }'
  },
  // Pattern 3: property: value},
  {
    regex: /(\s+)([a-zA-Z_][a-zA-Z0-9_]*:\s*[^,}]+)},\s*$/gm,
    replace: '$1$2,\n$1}'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replace);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findTsFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !entry.includes('node_modules') && !entry.includes('.git')) {
        walk(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
console.log('🔧 Starting syntax fix...');

const srcDir = path.join(__dirname, 'src');
const files = findTsFiles(srcDir);

console.log(`Found ${files.length} TypeScript files`);

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`✅ Fixed ${fixedCount} files`);

// Test build
console.log('🏗️  Testing build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build still has errors, manual fixes needed');
  process.exit(1);
}