const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix various syntax errors
function fixSyntaxErrors(content, filePath) {
  let fixed = content;
  
  // Fix 1: aria-label placement issues in onClick handlers
  // Pattern: onClick={() => functionCall()} aria-label="Icon button"
  fixed = fixed.replace(
    /onClick=\{([^}]+)\}\s*aria-label="[^"]*"\s*>/g,
    (match, onClick) => {
      // Extract the aria-label
      const ariaMatch = match.match(/aria-label="([^"]*)"/);
      const ariaLabel = ariaMatch ? ariaMatch[1] : 'Icon button';
      // Clean the onClick handler
      const cleanOnClick = onClick.trim();
      return `onClick={${cleanOnClick}} aria-label="${ariaLabel}">`
    }
  );
  
  // Fix 2: Broken lines with aria-label
  // Pattern: aria-label="Icon button"\n>
  fixed = fixed.replace(
    /\s+aria-label="([^"]*)"\s*\n\s*>/g,
    ' aria-label="$1">'
  );
  
  // Fix 3: Fix closing brackets on new lines
  fixed = fixed.replace(
    /}\s*aria-label="([^"]*)"\s*\)>/g,
    ')} aria-label="$1">'
  );
  
  // Fix 4: Fix IconButton specific issues
  fixed = fixed.replace(
    /(<IconButton[^>]*)\s+aria-label="([^"]*)"(\s*\n\s*)>/g,
    '$1 aria-label="$2"$3>'
  );
  
  // Fix 5: Remove "No newline at end of file" messages
  fixed = fixed.replace(/\s*No newline at end of file\s*/g, '\n');
  
  // Fix 6: Fix specific password toggle pattern
  if (filePath.includes('login.tsx')) {
    fixed = fixed.replace(
      'onClick={() => setShowPassword(!showPassword)} aria-label="Icon button"',
      'onClick={() => setShowPassword(!showPassword)}\n                      aria-label="Toggle password visibility"'
    );
  }
  
  // Fix 7: Fix specific pattern in assets.tsx
  if (filePath.includes('assets.tsx')) {
    fixed = fixed.replace(
      /onClick=\{[^}]*}\s*aria-label="Icon button"\)}/g,
      (match) => {
        // Extract the onClick content
        const onClickMatch = match.match(/onClick=\{([^}]+)\}/);
        if (onClickMatch) {
          const onClick = onClickMatch[1].trim();
          return `onClick={${onClick}}`;
        }
        return match;
      }
    );
  }
  
  // Fix 8: Fix generate-enhanced.tsx specific issues
  if (filePath.includes('generate-enhanced.tsx')) {
    // Fix multiline IconButton issues
    fixed = fixed.replace(
      /<IconButton([^>]*)\s+aria-label="[^"]*"\s*\n>/g,
      '<IconButton$1 aria-label="Icon button">'
    );
  }
  
  return fixed;
}

// Find all TypeScript/TSX files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

console.log(`Found ${files.length} files to check for syntax errors...`);

let fixedCount = 0;
const errors = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const fixed = fixSyntaxErrors(content, file);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
    errors.push({ file, error: err.message });
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with syntax errors`);

if (errors.length > 0) {
  console.log(`\n⚠️  ${errors.length} files had errors:`);
  errors.forEach(({ file, error }) => {
    console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`);
  });
}