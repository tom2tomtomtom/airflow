#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = '/Users/thomasdowuona-hyde/AIRFLOW/src/pages/clients.tsx';

console.log('Fixing JSX semicolon issues in clients.tsx...');

let content = fs.readFileSync(filePath, 'utf-8');
let changes = 0;

// Fix patterns that should not have semicolons
const patterns = [
  // JSX attributes with semicolons
  [/(\w+)="([^"]*)";\s*>/g, '$1="$2">'],
  [/(\w+)="([^"]*)";\s*\n/g, '$1="$2"\n'],

  // JSX text content with semicolons
  [/>([^<]*?);\s*</g, '>$1<'],

  // JSX properties with semicolons
  [/(\w+):\s*"([^"]*)";\s*}/g, '$1: "$2" }'],
  [/(\w+):\s*([^,};\s]+);\s*}/g, '$1: $2 }'],

  // Object properties in JSX with semicolons
  [/(\w+):\s*([^,;}]+);\s*,/g, '$1: $2,'],
  [/(\w+):\s*([^,;}]+);\s*\n/g, '$1: $2\n'],

  // Malformed closing braces
  [/}}\s*}/g, '}}'],
  [/}\s*}}/g, '}}'],

  // Common JSX component patterns with semicolons
  [/<Typography([^>]*?);\s*>/g, '<Typography$1>'],
  [/<Button([^>]*?);\s*>/g, '<Button$1>'],
  [/<Box([^>]*?);\s*>/g, '<Box$1>'],
  [/<Grid([^>]*?);\s*>/g, '<Grid$1>'],
  [/<TextField([^>]*?);\s*>/g, '<TextField$1>'],
  [/<IconButton([^>]*?);\s*>/g, '<IconButton$1>'],
  [/<MenuItem([^>]*?);\s*>/g, '<MenuItem$1>'],
  [/<InputAdornment([^>]*?);\s*>/g, '<InputAdornment$1>'],
  [/<Card([^>]*?);\s*>/g, '<Card$1>'],
  [/<Paper([^>]*?);\s*>/g, '<Paper$1>'],
  [/<Avatar([^>]*?);\s*>/g, '<Avatar$1>'],
  [/<Chip([^>]*?);\s*>/g, '<Chip$1>'],
  [/<Tooltip([^>]*?);\s*>/g, '<Tooltip$1>'],
];

patterns.forEach(([pattern, replacement]) => {
  const before = content;
  content = content.replace(pattern, replacement);
  const matches = (before.match(pattern) || []).length;
  if (matches > 0) {
    changes += matches;
    console.log(`Fixed ${matches} instances of pattern: ${pattern}`);
  }
});

if (changes > 0) {
  fs.writeFileSync(filePath, content);
  console.log(`\nTotal changes made: ${changes}`);
  console.log('File updated successfully!');
} else {
  console.log('No semicolon issues found.');
}
