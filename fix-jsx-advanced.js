#!/usr/bin/env node

const fs = require('fs');

const filePath = '/Users/thomasdowuona-hyde/AIRFLOW/src/pages/clients.tsx';

console.log('Fixing advanced JSX issues in clients.tsx...');

let content = fs.readFileSync(filePath, 'utf-8');
let changes = 0;

// Advanced patterns to fix
const patterns = [
  // Missing semicolons after property declarations
  [/(\w+):\s*string\s*\n/g, '$1: string;\n'],
  [/keyMessages:\s*string\[\]\s*\};\s*\}/g, 'keyMessages: string[];\n  };\n}'],

  // Fix missing semicolons and broken lines
  [/\.filter\(Boolean\)\)\s*$/gm, '.filter(Boolean));'],
  [/\.toLowerCase\(\)\s*$/gm, '.toLowerCase();'],
  [/event\.stopPropagation\(\)\s*$/gm, 'event.stopPropagation();'],

  // Fix broken Grid/Box components
  [
    /<Grid container spacing=\{2\} alignItems="center">\s*<Grid/g,
    '<Grid container spacing={2} alignItems="center">\n              <Grid',
  ],
  [/<\/Grid>\s*<Grid/g, '</Grid>\n              <Grid'],

  // Fix broken JSX attribute syntax
  [/InputProps=\{\{;\s*startAdornment:/g, 'InputProps={{\n                    startAdornment:'],
  [/sx=\{\{;\s*/g, 'sx={{\n                    '],
  [/onClick=\{\(\) => \{;\s*/g, 'onClick={() => {\n                  '],
  [
    /onChange=\{\(e\) => setFormData\(\{;\s*/g,
    'onChange={(e) => setFormData({\n                        ',
  ],

  // Fix broken closing braces and tags
  [/\}\}\)\s*>\s*<\/TextField>/g, '}}\n                    />\n                  </TextField>'],
  [
    /\}\}\)\s*>\s*<InputAdornment/g,
    '}}\n                      >\n                      <InputAdornment',
  ],
  [/\}\}\)(\s*\/\s*>)/g, '}}\n                    />'],

  // Fix typography and button elements
  [
    /<Typography variant="h6" gutterBottom>;\s*/g,
    '<Typography variant="h6" gutterBottom>\n                    ',
  ],
  [
    /<Typography variant="body2" color="text.secondary" paragraph>;\s*/g,
    '<Typography variant="body2" color="text.secondary" paragraph>\n                      ',
  ],
  [
    /<Typography variant="caption" color="text.secondary">;\s*/g,
    '<Typography variant="caption" color="text.secondary">\n                        ',
  ],
  [/<IconButton size="small">;\s*/g, '<IconButton size="small">\n                              '],

  // Fix Tooltip and other elements
  [
    /<Tooltip title="Website">\s*<IconButton size="small">\s*<WebsiteIcon fontSize="small" \/>\s*<\/IconButton>/g,
    '<Tooltip title="Website">\n                          <IconButton size="small">\n                            <WebsiteIcon fontSize="small" />\n                          </IconButton>',
  ],

  // Fix missing closing elements
  [/isActive: true\}\s*;/g, 'isActive: true\n                          };'],
];

patterns.forEach(([pattern, replacement]) => {
  const before = content;
  content = content.replace(pattern, replacement);
  const matches = (before.match(pattern) || []).length;
  if (matches > 0) {
    changes += matches;
    console.log(`Fixed ${matches} instances of advanced pattern`);
  }
});

// Final cleanup patterns
const cleanupPatterns = [
  // Remove extra semicolons after closing JSX tags
  [/(\/>)\s*;/g, '$1'],
  [/(<\/\w+>)\s*;/g, '$1'],

  // Fix spacing issues
  [/\}\s*\}\s*\}/g, '}\n    }\n  }'],
  [/\n\s*\n\s*\n/g, '\n\n'],
];

cleanupPatterns.forEach(([pattern, replacement]) => {
  const before = content;
  content = content.replace(pattern, replacement);
  const matches = (before.match(pattern) || []).length;
  if (matches > 0) {
    changes += matches;
    console.log(`Cleaned up ${matches} instances`);
  }
});

if (changes > 0) {
  fs.writeFileSync(filePath, content);
  console.log(`\nTotal advanced changes made: ${changes}`);
  console.log('Advanced JSX fixes completed!');
} else {
  console.log('No advanced issues found.');
}
