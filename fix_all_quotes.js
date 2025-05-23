const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/strategic-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix import statement
content = content.replace(
  /import DashboardLayout from '@\/components\/DashboardLayout";/g,
  "import DashboardLayout from '@/components/DashboardLayout';"
);

// Fix id strings
content = content.replace(/id: 'sc1",/g, "id: 'sc1',");
content = content.replace(/id: 'sc2",/g, "id: 'sc2',");
content = content.replace(/id: 'sc3",/g, "id: 'sc3',");

// Fix details strings with apostrophes
content = content.replace(
  /details: '([^']*?)founder's([^']*?)'/g,
  'details: "$1founder\'s$2"'
);

// Fix any unterminated strings
content = content.replace(
  /details: '([^']*?)([^']*?)"/g,
  'details: "$1$2"'
);

// Write the fixed content back to the file
fs.writeFileSync(filePath, content);

console.log('All quotes fixed in strategic content file!');
