const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/exports.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Description with TextIcon
content = content.replace(/<Description sx={{ color: '#3a86ff' }} \/>/g, '<TextIcon sx={{ color: "#3a86ff" }} />');
content = content.replace(/<Description sx={{ color: '#e63946' }} \/>/g, '<TextIcon sx={{ color: "#e63946" }} />');
content = content.replace(/<Description sx={{ color: '#2a9d8f' }} \/>/g, '<TextIcon sx={{ color: "#2a9d8f" }} />');

// Write the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('Exports file fixed successfully!');
