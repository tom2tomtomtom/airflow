#!/usr/bin/env node

/**
 * Emergency Build Fix - Fix all critical syntax errors
 */

const fs = require('fs');

console.log('🚨 EMERGENCY BUILD FIX');
console.log('======================\n');

// Fix campaigns/new.tsx completely
function fixCampaignsNew() {
  console.log('1. Fixing campaigns/new.tsx completely...');
  const filePath = 'src/pages/campaigns/new.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix all remaining TextField components
  const fixes = [
    // Priority TextField
    { 
      from: `                            <
                              select
                              label="Priority"
                              value={formData.priority}
                              onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, priority: e.target.value })}
                            >`,
      to: `                            <TextField
                              select
                              label="Priority"
                              value={formData.priority}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: e.target.value })}
                            >`
    },
    // Brief TextField
    {
      from: `                          <
                            select
                            label="Link to Brief (Optional)"
                            value={formData.brief_id}
                            onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, brief_id: e.target.value })}
                          >`,
      to: `                          <TextField
                            select
                            label="Link to Brief (Optional)"
                            value={formData.brief_id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, brief_id: e.target.value })}
                          >`
    },
    // Budget TextField
    {
      from: `                        <
                        fullWidth
                        label="Campaign Budget"
                        value={formData.budget}
                        onChange={(e: React.ChangeEvent<HTMLElement>) => setFormData({ ...formData, budget: e.target.value })}`,
      to: `                        <TextField
                        fullWidth
                        label="Campaign Budget"
                        value={formData.budget}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, budget: e.target.value })}`
    },
    // Tag TextField
    {
      from: `                          <
                          label="Add Tag"
                          value={newTag}
                          onChange={(e: React.ChangeEvent<HTMLElement>) => setNewTag(e.target.value)}`,
      to: `                          <TextField
                          label="Add Tag"
                          value={newTag}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}`
    },
    // Fix closing tags
    { from: '</>', to: '</TextField>' },
    // Fix CardContent
    { from: '< sx={{ textAlign: \'center\', p: 2 }}>', to: '<CardContent sx={{ textAlign: "center", p: 2 }}>' },
    { from: '<>', to: '</CardContent>' },
    // Fix Divider
    { from: '< sx={{ my: 3 }} />', to: '<Divider sx={{ my: 3 }} />' }
  ];

  fixes.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(from, to);
      console.log(`  ✅ Fixed: ${from.substring(0, 30)}...`);
    }
  });

  fs.writeFileSync(filePath, content);
  console.log('  ✅ campaigns/new.tsx fixed');
}

// Fix create-client.tsx
function fixCreateClient() {
  console.log('2. Fixing create-client.tsx...');
  const filePath = 'src/pages/create-client.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Add TextField import
  if (!content.includes('TextField,')) {
    content = content.replace(
      'FormControlLabel,',
      'FormControlLabel,\n  TextField,'
    );
  }

  // Fix TextField components
  content = content.replace(/<\s+fullWidth/g, '<TextField fullWidth');
  content = content.replace(/<\/>/g, '</TextField>');

  fs.writeFileSync(filePath, content);
  console.log('  ✅ create-client.tsx fixed');
}

// Fix execute.tsx
function fixExecute() {
  console.log('3. Fixing execute.tsx...');
  const filePath = 'src/pages/execute.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix React Fragment
  content = content.replace('return (\n    <React.Fragment>', 'return (\n    <>');
  content = content.replace('</React.Fragment>\n  );', '</>\n  );');

  fs.writeFileSync(filePath, content);
  console.log('  ✅ execute.tsx fixed');
}

// Fix matrix.tsx
function fixMatrix() {
  console.log('4. Fixing matrix.tsx...');
  const filePath = 'src/pages/matrix.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure DashboardLayout is imported
  if (!content.includes('import DashboardLayout')) {
    content = content.replace(
      "import { useAuth } from '@/contexts/AuthContext';",
      "import { useAuth } from '@/contexts/AuthContext';\nimport DashboardLayout from '@/components/DashboardLayout';"
    );
  }

  fs.writeFileSync(filePath, content);
  console.log('  ✅ matrix.tsx fixed');
}

// Fix PerformanceDashboard.tsx
function fixPerformanceDashboard() {
  console.log('5. Fixing PerformanceDashboard.tsx...');
  const filePath = 'src/components/analytics/PerformanceDashboard.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('  ❌ File not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Add missing imports
  const missingImports = ['Select', 'CircularProgress', 'Divider', 'CardContent'];
  missingImports.forEach(importName => {
    if (!content.includes(`${importName},`)) {
      content = content.replace(
        '} from \'@mui/material\';',
        `,\n  ${importName},\n} from '@mui/material';`
      );
    }
  });

  // Fix syntax errors
  const fixes = [
    { from: '< />', to: '<CircularProgress />' },
    { from: '<>', to: '<CardContent>' },
    { from: '</>', to: '</CardContent>' },
    { from: '< sx={{ color: \'primary.main\' }} />', to: '<VisibilityIcon sx={{ color: "primary.main" }} />' },
    { from: 'icon={< />}', to: 'icon={<AnalyticsIcon />}' },
    { from: '< sx={{ my: 3 }} />', to: '<Divider sx={{ my: 3 }} />' }
  ];

  fixes.forEach(({ from, to }) => {
    content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
  });

  fs.writeFileSync(filePath, content);
  console.log('  ✅ PerformanceDashboard.tsx fixed');
}

// Main execution
async function main() {
  try {
    fixCampaignsNew();
    fixCreateClient();
    fixExecute();
    fixMatrix();
    fixPerformanceDashboard();

    console.log('\n🎉 Emergency build fixes applied!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run build');
    console.log('2. If successful, run: npm run dev');

  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    process.exit(1);
  }
}

main();
