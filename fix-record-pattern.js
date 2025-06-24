const fs = require('fs');
const glob = require('glob');

// Get all TypeScript and JavaScript files in src/
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  absolute: true,
});

let filesFixed = 0;
let totalReplacements = 0;

console.log(`Scanning ${files.length} files for Record<string, unknown>$1 patterns...`);

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    let replacements = 0;

    // Fix Pattern 1: Record<string, unknown>$1 at start of object
    const pattern1 = /Record<string, unknown>\$1/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
      content = content.replace(pattern1, '{}');
      replacements += matches1.length;
    }

    // Fix Pattern 2: socialMedia: Record<string, unknown>$1 followed by property
    content = content.replace(
      /(\w+):\s*Record<string,\s*unknown>\$1\s*\n\s*([a-zA-Z_]\w*\s*:)/g,
      '$1: {},\n  $2'
    );

    // Fix Pattern 3: Fix object structure with missing braces after Record replacement
    content = content.replace(/(\w+):\s*\{\}\s*\n\s*([a-zA-Z_]\w*\s*:)/g, '$1: {},\n  $2');

    // Fix Pattern 4: Missing opening brace in object definitions
    content = content.replace(/(\w+):\s*\n\s*([a-zA-Z_]\w*\s*:)/g, '$1: {\n    $2');

    // Fix Pattern 5: Missing closing braces for nested objects
    content = content.replace(
      /(required:\s*(true|false),\s*\n\s*type:\s*'[^']*'\s*as\s*const,?\s*\n\s*[a-zA-Z_]\w*:)/g,
      (match, p1) => {
        // Count opening braces vs closing braces to determine if we need to close
        const openBraces = (match.match(/\{/g) || []).length;
        const closeBraces = (match.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          return match.replace(/([^}]),\s*\n\s*([a-zA-Z_]\w*:)/, '$1\n  },\n  $2');
        }
        return match;
      }
    );

    if (content !== originalContent) {
      // Validate the content before writing
      try {
        // Basic syntax validation - check for unmatched braces
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;

        if (Math.abs(openBraces - closeBraces) > 5 || Math.abs(openParens - closeParens) > 5) {
          console.warn(`Skipping ${file.replace(process.cwd(), '.')} - potential syntax issues`);
          return;
        }

        fs.writeFileSync(file, content);
        console.log(`Fixed: ${file.replace(process.cwd(), '.')} (${replacements} replacements)`);
        filesFixed++;
        totalReplacements += replacements;
      } catch (writeError) {
        console.error(`Error writing ${file}:`, writeError.message);
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(
  `\n✅ Completed! Fixed ${filesFixed} files with ${totalReplacements} total replacements.`
);
console.log(`\n🔧 Run 'npm run build' to test the fixes.`);
