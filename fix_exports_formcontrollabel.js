const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src/pages/exports.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the MUI imports
const muiImportRegex = /import \{([^}]+)\} from '@mui\/material';/;
const muiImportMatch = content.match(muiImportRegex);

if (muiImportMatch) {
  // Check if FormControlLabel is already imported
  if (!muiImportMatch[1].includes('FormControlLabel')) {
    // Add FormControlLabel to the imports
    const newMuiImports = muiImportMatch[1] + ',\n  FormControlLabel,';
    content = content.replace(muiImportRegex, `import {${newMuiImports}} from '@mui/material';`);
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content);
    console.log('Added FormControlLabel import to exports file!');
  } else {
    console.log('FormControlLabel is already imported.');
  }
} else {
  console.log('Could not find MUI imports in the file.');
}
