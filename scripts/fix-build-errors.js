#!/usr/bin/env node

/**
 * Fix Critical Build Errors
 * Fixes syntax errors preventing the build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Critical Build Errors');
console.log('================================\n');

let fixCount = 0;

// Fix 1: campaigns/new.tsx - Missing TextField components
function fixCampaignsNew() {
  console.log('1. Fixing campaigns/new.tsx...');
  const filePath = 'src/pages/campaigns/new.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ File not found:', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add TextField import if missing
  if (!content.includes('TextField,')) {
    content = content.replace(
      'FormControlLabel,',
      'FormControlLabel,\n  TextField,'
    );
    modified = true;
  }

  // Add Divider import if missing
  if (!content.includes('Divider,')) {
    content = content.replace(
      'TextField,',
      'TextField,\n  Divider,'
    );
    modified = true;
  }

  // Add CardContent import if missing
  if (!content.includes('CardContent,')) {
    content = content.replace(
      'Divider,',
      'Divider,\n  CardContent,'
    );
    modified = true;
  }

  // Fix missing TextField components
  const textFieldFixes = [
    { from: '<\n                        fullWidth\n                        label="Campaign Name"', to: '<TextField\n                        fullWidth\n                        label="Campaign Name"' },
    { from: '<\n                        fullWidth\n                        label="Campaign Objective"', to: '<TextField\n                        fullWidth\n                        label="Campaign Objective"' },
    { from: '<\n                        fullWidth\n                        label="Description (Optional)"', to: '<TextField\n                        fullWidth\n                        label="Description (Optional)"' },
    { from: '<\n                              select\n                              label="Campaign Type"', to: '<TextField\n                              select\n                              label="Campaign Type"' },
    { from: '<\n                              select\n                              label="Priority"', to: '<TextField\n                              select\n                              label="Priority"' },
    { from: '<\n                            select\n                            label="Link to Brief (Optional)"', to: '<TextField\n                            select\n                            label="Link to Brief (Optional)"' },
    { from: '<\n                        fullWidth\n                        label="Campaign Budget"', to: '<TextField\n                        fullWidth\n                        label="Campaign Budget"' },
    { from: '<\n                          label="Add Tag"', to: '<TextField\n                          label="Add Tag"' }
  ];

  textFieldFixes.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  // Fix missing closing tags
  content = content.replace(/<\/>/g, '</TextField>');
  
  // Fix CardContent components
  content = content.replace(/< sx={{ textAlign: 'center', p: 2 }}>/g, '<CardContent sx={{ textAlign: "center", p: 2 }}>');
  content = content.replace(/< sx={{ my: 3 }} \/>/g, '<Divider sx={{ my: 3 }} />');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log('  ✅ Fixed campaigns/new.tsx');
    fixCount++;
  } else {
    console.log('  ✅ campaigns/new.tsx already correct');
  }
}

// Fix 2: create-client.tsx - Missing TextField
function fixCreateClient() {
  console.log('2. Fixing create-client.tsx...');
  const filePath = 'src/pages/create-client.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ File not found:', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix missing TextField component
  if (content.includes('<\n                fullWidth')) {
    content = content.replace('<\n                fullWidth', '<TextField\n                fullWidth');
    fs.writeFileSync(filePath, content);
    console.log('  ✅ Fixed create-client.tsx');
    fixCount++;
  } else {
    console.log('  ✅ create-client.tsx already correct');
  }
}

// Fix 3: execute.tsx - Missing React Fragment
function fixExecute() {
  console.log('3. Fixing execute.tsx...');
  const filePath = 'src/pages/execute.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ File not found:', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix React Fragment syntax
  if (content.includes('return (\n    <>\n      <Head>')) {
    content = content.replace('return (\n    <>\n      <Head>', 'return (\n    <React.Fragment>\n      <Head>');
    content = content.replace('</>\n  );', '</React.Fragment>\n  );');
    fs.writeFileSync(filePath, content);
    console.log('  ✅ Fixed execute.tsx');
    fixCount++;
  } else {
    console.log('  ✅ execute.tsx already correct');
  }
}

// Fix 4: matrix.tsx - Missing DashboardLayout
function fixMatrix() {
  console.log('4. Fixing matrix.tsx...');
  const filePath = 'src/pages/matrix.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ File not found:', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if DashboardLayout is imported
  if (!content.includes('import DashboardLayout')) {
    content = content.replace(
      "import { useAuth } from '@/contexts/AuthContext';",
      "import { useAuth } from '@/contexts/AuthContext';\nimport DashboardLayout from '@/components/DashboardLayout';"
    );
    fs.writeFileSync(filePath, content);
    console.log('  ✅ Fixed matrix.tsx imports');
    fixCount++;
  } else {
    console.log('  ✅ matrix.tsx already correct');
  }
}

// Main execution
async function main() {
  try {
    fixCampaignsNew();
    fixCreateClient();
    fixExecute();
    fixMatrix();

    console.log(`\n🎉 Applied ${fixCount} critical build fixes!`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run build');
    console.log('2. If successful, run: npm run dev');
    console.log('3. Test authentication flow');

  } catch (error) {
    console.error('❌ Build fix script failed:', error);
    process.exit(1);
  }
}

main();
