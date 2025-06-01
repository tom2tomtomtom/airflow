#!/usr/bin/env node

/**
 * Fix PerformanceDashboard.tsx syntax errors
 */

const fs = require('fs');

console.log('🔧 Fixing PerformanceDashboard.tsx syntax errors...');

const filePath = 'src/components/analytics/PerformanceDashboard.tsx';

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add missing Select import
if (!content.includes('Select,')) {
  content = content.replace(
    'FormControl,',
    'FormControl,\n  Select,'
  );
  console.log('✅ Added Select import');
}

// Fix 2: Replace empty components with proper components
const fixes = [
  // Loading spinner
  { from: '< />', to: 'CircularProgress' },
  
  // Card content wrappers
  { from: '<>', to: 'CardContent' },
  { from: '</>', to: '</CardContent>' },
  
  // Missing icon
  { from: '< sx={{ color: \'primary.main\' }} />', to: 'VisibilityIcon sx={{ color: \'primary.main\' }}' },
  
  // Tab icon
  { from: 'icon={< />}', to: 'icon={<AnalyticsIcon />}' },
  
  // Divider
  { from: '{index < insights.optimization_opportunities.length - 1 && < />}', to: '{index < insights.optimization_opportunities.length - 1 && <Divider />}' }
];

fixes.forEach(({ from, to }) => {
  if (content.includes(from)) {
    content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    console.log(`✅ Fixed: ${from} → ${to}`);
  }
});

// Fix 3: Add missing imports
const missingImports = ['CircularProgress', 'Divider'];
missingImports.forEach(importName => {
  if (!content.includes(`${importName},`) && content.includes(importName)) {
    content = content.replace(
      '} from \'@mui/material\';',
      `,\n  ${importName},\n} from '@mui/material';`
    );
    console.log(`✅ Added missing import: ${importName}`);
  }
});

// Write the fixed content
fs.writeFileSync(filePath, content);
console.log('✅ PerformanceDashboard.tsx syntax errors fixed!');
