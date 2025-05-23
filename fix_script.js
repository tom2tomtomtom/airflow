const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/generate-new.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace problematic strings with double quotes
content = content.replace(
  /content: '([^']*?)it's([^']*?)isn't([^']*?)'/g, 
  'content: "$1it\'s$2isn\'t$3"'
);

content = content.replace(
  /content: '([^']*?)You're([^']*?)Let's([^']*?)I'll([^']*?)'/g, 
  'content: "$1You\'re$2Let\'s$3I\'ll$4"'
);

content = content.replace(
  /text: '([^']*?)I'll([^']*?)'/g, 
  'text: "$1I\'ll$2"'
);

// Write the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('File fixed successfully!');
