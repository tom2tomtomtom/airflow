const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixMalformedObjects(content) {
  let fixed = content;
  
  // Pattern 1: Fix object: {, ... } -> object: { ... }
  fixed = fixed.replace(/(\w+):\s*\{\s*,\s*\n\s*\}\s*(\w+)/g, '$1: {},\n  $2');
  
  // Pattern 2: Fix object: {, ... } followed by property
  fixed = fixed.replace(/(\w+):\s*\{\s*,\s*\n\s*\}\s*([a-zA-Z_][\w]*\s*:)/g, '$1: {},\n  $2');
  
  // Pattern 3: Fix trailing || ; at end of lines
  fixed = fixed.replace(/\|\|\s*;/g, '');
  
  // Pattern 4: Fix },; -> },
  fixed = fixed.replace(/\}\s*,\s*;/g, '},');
  
  // Pattern 5: Fix object: {, followed by property on next lines
  fixed = fixed.replace(/(\w+):\s*\{\s*,\s*\n\s*\}\s*\n\s*([a-zA-Z_][\w]*\s*:)/g, '$1: {\n    $2');
  
  // Pattern 6: Fix headers: { 'Content-Type': 'application/json' , } -> headers: { 'Content-Type': 'application/json' },
  fixed = fixed.replace(/headers:\s*\{\s*([^}]+)\s*,\s*\n\s*\}/g, 'headers: {\n        $1\n      },');
  
  return fixed;
}

// Get all TypeScript and JavaScript files in src/
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { 
  cwd: '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX',
  absolute: true 
});

let filesFixed = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const fixed = fixMalformedObjects(content);
    
    if (content !== fixed) {
      fs.writeFileSync(file, fixed);
      console.log(`Fixed: ${path.relative('/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX', file)}`);
      filesFixed++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nCompleted! Fixed ${filesFixed} files.`);