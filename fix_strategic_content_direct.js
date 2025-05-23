const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/strategic-content.tsx');
const originalContent = fs.readFileSync(filePath, 'utf8');

// Fix specific issues
let fixedContent = originalContent;

// Fix the import statement
fixedContent = fixedContent.replace(
  /import DashboardLayout from '@\/components\/DashboardLayout";/,
  "import DashboardLayout from '@/components/DashboardLayout';"
);

// Fix the id
fixedContent = fixedContent.replace(
  /id: 'sc1",/,
  "id: 'sc1',"
);

// Fix the founder's corner string
fixedContent = fixedContent.replace(
  /'([^']*?)founder's([^']*?)'/g,
  '"$1founder\'s$2"'
);

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent);

console.log('Strategic content file fixed directly!');
