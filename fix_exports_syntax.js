const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/exports.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the syntax error in the imports
content = content.replace(/Tooltip,\s*,\s*FormControlLabel,/g, 'Tooltip,\n  FormControlLabel,');

// Replace all instances of Description with TextIcon
content = content.replace(/<Description sx={{ color: /g, '<TextIcon sx={{ color: ');

// Write the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('Fixed syntax error in exports file!');
