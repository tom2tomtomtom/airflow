const fs = require('fs');
const glob = require('glob');

// Get all TypeScript and JavaScript files in src/
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { 
  cwd: '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX',
  absolute: true 
});

let filesFixed = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Pattern 1: Fix object property with trailing comma and newline - { prop: value , }
    content = content.replace(/(\w+):\s*([^,\n]+)\s*,\s*\n\s*\}/g, '$1: $2 }');
    
    // Pattern 2: Fix malformed objects with empty braces followed by property
    content = content.replace(/(\w+):\s*\{\s*,\s*\n\s*\}\s*\n\s*([a-zA-Z_]\w*\s*:)/g, '$1: {},\n      $2');
    
    // Pattern 3: Fix },,  -> },
    content = content.replace(/\}\s*,\s*,/g, '},');
    
    // Pattern 4: Fix structure: { , } -> structure: {}
    content = content.replace(/(\w+):\s*\{\s*,\s*\n\s*\}/g, '$1: {}');
    
    // Pattern 5: Fix configuration: {}, followed by property on same line
    content = content.replace(/configuration:\s*\{\}\s*,\s*\n\s*([a-zA-Z_]\w*\s*:)/g, 'configuration: {},\n  $1');
    
    // Pattern 6: Fix missing commas between object properties
    content = content.replace(/(\}\s*)\n\s*([a-zA-Z_]\w*\s*:)/g, '$1,\n  $2');
    
    // Pattern 7: Fix empty objects at end of property lists
    content = content.replace(/structure:\s*currentTemplate\?\.\w+\s*\|\|\s*\{\s*,\s*\n\s*\}/g, 'structure: currentTemplate?.structure || {}');
    
    // Pattern 8: Fix JSX fragments
    content = content.replace(/<>\s*\n\s*([^<])/g, '<>\n      $1');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file.replace('/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/', '')}`);
      filesFixed++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nCompleted! Fixed ${filesFixed} files.`);