const fs = require('fs');

const files = [
  'src/hooks/useCSRF.ts',
  'src/lib/supabase/config.ts', 
  'src/pages/clients.tsx',
  'src/pages/execute.tsx',
  'src/pages/preview.tsx'
];

files.forEach(file => {
  try {
    const filePath = `/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/${file}`;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix },,  patterns
    content = content.replace(/\}\s*,\s*,/g, '},');
    
    // Fix socialMedia: {, ... } patterns  
    content = content.replace(/(socialMedia:\s*client\.socialMedia\s*\|\|\s*)\{\s*,\s*\n\s*\}/g, '$1{}');
    
    // Fix headers: { ... },, patterns
    content = content.replace(/headers:\s*\{\s*([^}]+)\s*\}\s*,\s*,/g, 'headers: {\n        $1\n      },');
    
    // Fix object property followed by missing comma
    content = content.replace(/(\}\s*)\n\s*([a-zA-Z_]\w*:\s*)/g, '$1,\n          $2');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('Fixed final syntax issues!');