#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 ESLINT AUTO-FIX');
console.log('==================');

const FIXES = [
  {
    pattern: /console\.log\([^)]*\);\s*\n/g,
    replacement: '',
    description: 'Remove console.log statements'
  },
  {
    pattern: /\.map\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[^>]+)(?!\s+key=)/g,
    replacement: '.map(($1, $2) => $3 key={$2 || `item-${$1}`}',
    description: 'Add missing key props'
  },
  {
    pattern: /<img\s+([^>]*?)(?<!alt=['"][^'"]*['"])\s*\/?>/g,
    replacement: '<img $1 alt="" />',
    description: 'Add missing alt props'
  }
];

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    FIXES.forEach(({ pattern, replacement, description }) => {
      const beforeLength = newContent.length;
      newContent = newContent.replace(pattern, replacement);
      const afterLength = newContent.length;
      
      if (beforeLength !== afterLength) {
        hasChanges = true;
        console.log(`   🧹 ${description} in ${filePath}`);
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent);
    }

    return hasChanges;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dirPath) {
  let totalFixed = 0;
  
  function scanRecursive(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanRecursive(itemPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
          if (fixFile(itemPath)) {
            totalFixed++;
          }
        }
      });
    } catch (error) {
      console.error(`Error scanning directory ${currentPath}:`, error.message);
    }
  }
  
  scanRecursive(dirPath);
  return totalFixed;
}

const projectRoot = process.cwd();
const totalFixed = scanDirectory(path.join(projectRoot, 'src'));

console.log(`\n✅ ESLint auto-fix complete! Fixed ${totalFixed} files.`);
