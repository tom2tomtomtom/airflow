const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to find the incorrect syntax
const incorrectPattern = /onClick=\{[^}]*=\s*aria-label="[^"]*">[^}]*\}/g;

// Function to fix the syntax
function fixAriaSyntax(content) {
  // Fix patterns like: onClick={() = aria-label="Icon button"> setShowPassword(!showPassword)}
  // Should be: onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"
  
  // Pattern 1: onClick={() = aria-label="Icon button"> functionCall()}
  content = content.replace(
    /onClick=\{([^=]+)=\s*aria-label="[^"]*">\s*([^}]+)\}/g,
    'onClick={$1=> $2} aria-label="Icon button"'
  );
  
  // Pattern 2: Fix event handlers with aria-label in wrong place
  content = content.replace(
    /\(e:\s*React\.MouseEvent<HTMLElement\s+aria-label="[^"]*">\)/g,
    '(e: React.MouseEvent<HTMLElement>)'
  );
  
  // Pattern 3: Fix IconButton with aria-label after closing tag
  content = content.replace(
    /(<IconButton[^>]*)\s+aria-label="Icon button">([^<]*<\/IconButton>)/g,
    '$1 aria-label="Icon button">$2'
  );
  
  // Pattern 4: Fix misplaced aria-label in the middle of props
  content = content.replace(
    /\s+aria-label="Icon button">\s*\n/g,
    ' aria-label="Icon button"\n>'
  );

  return content;
}

// Find all TypeScript/TSX files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

console.log(`Found ${files.length} files to check...`);

let fixedCount = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const fixed = fixAriaSyntax(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with aria-label syntax issues`);