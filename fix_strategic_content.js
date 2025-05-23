const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/strategic-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace problematic strings with double quotes
content = content.replace(
  /details: '([^']*?)founder's([^']*?)'/g, 
  'details: "$1founder\'s$2"'
);

// Replace any other potential apostrophes in single-quoted strings
content = content.replace(
  /'([^']*?)'s([^']*?)'/g, 
  '"$1\'s$2"'
);

// Write the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('Strategic content file fixed successfully!');
