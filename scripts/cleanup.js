#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to remove
const filesToRemove = [
  // Duplicate page files
  'src/pages/matrix.tsx.new',
  'src/pages/strategic-content-fixed.tsx',
  'src/pages/generate-new.tsx',
  'src/pages/templates-new.tsx',
  'src/pages/matrix-new.tsx',
  
  // Fix scripts (no longer needed)
  'fix_all_quotes.js',
  'fix_exports.js',
  'fix_exports_all.js',
  'fix_exports_formcontrollabel.js',
  'fix_exports_syntax.js',
  'fix_script.js',
  'fix_strategic_content.js',
  'fix_strategic_content_direct.js',
  
  // Temporary files
  'temp.txt',
  'test.php',
  'tsconfig.tsbuildinfo', // Build artifact, should be gitignored
];

// Clean up files
filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${file}`);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

// Update .gitignore to include build artifacts
const gitignorePath = path.join(process.cwd(), '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

if (!gitignoreContent.includes('tsconfig.tsbuildinfo')) {
  fs.appendFileSync(gitignorePath, '\n# TypeScript build info\ntsconfig.tsbuildinfo\n');
  console.log('✅ Added tsconfig.tsbuildinfo to .gitignore');
}

console.log('\n🎉 Cleanup complete!');
