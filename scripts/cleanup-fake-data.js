#!/usr/bin/env node

/**
 * Comprehensive Fake Data Cleanup Script
 * Removes all mock, placeholder, and test data from the AIrWAVE platform
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 AIrWAVE Fake Data Cleanup Script');
console.log('=====================================');

const CLEANUP_OPERATIONS = [
  '1. Remove mock data from UI components',
  '2. Clean API endpoints of mock responses',
  '3. Remove placeholder content from services',
  '4. Update seed scripts to be empty/disabled',
  '5. Clean up test data in components'
];

console.log('\nOperations to perform:');
CLEANUP_OPERATIONS.forEach(op => console.log(`  ${op}`));
console.log('\n');

// Files to clean up
const CLEANUP_FILES = [
  {
    file: 'src/pages/preview.tsx',
    description: 'Remove mock templates data',
    action: 'replace_mock_data'
  },
  {
    file: 'src/pages/generate-enhanced.tsx',
    description: 'Remove mock generated images and voices',
    action: 'replace_mock_data'
  },
  {
    file: 'src/pages/api/assets/[id].ts',
    description: 'Remove mock assets array',
    action: 'replace_mock_data'
  },
  {
    file: 'src/pages/api/ai/generate.ts',
    description: 'Remove mock AI generation functions',
    action: 'replace_mock_data'
  },
  {
    file: 'src/components/GlobalSearch.tsx',
    description: 'Remove mock search data',
    action: 'replace_mock_data'
  },
  {
    file: 'src/pages/dashboard-clean.tsx',
    description: 'Remove hardcoded project data',
    action: 'replace_mock_data'
  },
  {
    file: 'scripts/seed.ts',
    description: 'Disable seed script',
    action: 'disable_script'
  },
  {
    file: 'scripts/seed-data.js',
    description: 'Disable seed script',
    action: 'disable_script'
  },
  {
    file: 'scripts/seed-test-data.js',
    description: 'Disable seed script',
    action: 'disable_script'
  }
];

async function cleanupFile(fileInfo) {
  const filePath = path.join(process.cwd(), fileInfo.file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileInfo.file}`);
    return;
  }

  console.log(`🧹 Cleaning: ${fileInfo.file} - ${fileInfo.description}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    if (fileInfo.action === 'replace_mock_data') {
      // Replace mock data arrays with empty arrays or proper API calls
      content = content.replace(/const mock\w+.*?=\s*\[[\s\S]*?\];/g, (match) => {
        const variableName = match.match(/const (mock\w+)/)?.[1];
        if (variableName) {
          modified = true;
          return `const ${variableName}: any[] = []; // Cleaned: was mock data`;
        }
        return match;
      });

      // Replace mock functions
      content = content.replace(/const mock\w+.*?=\s*\([^)]*\)\s*=>\s*{[\s\S]*?};/g, (match) => {
        const functionName = match.match(/const (mock\w+)/)?.[1];
        if (functionName) {
          modified = true;
          return `const ${functionName} = () => []; // Cleaned: was mock function`;
        }
        return match;
      });

    } else if (fileInfo.action === 'disable_script') {
      // Add early return to disable seed scripts
      if (!content.includes('// DISABLED: Dummy data cleanup')) {
        content = content.replace(
          /(async\s+function\s+main\s*\(\s*\)\s*{)/,
          '$1\n  console.log("⚠️  DISABLED: Dummy data cleanup - script disabled for production");\n  return;\n'
        );
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${fileInfo.file}`);
    } else {
      console.log(`ℹ️  No changes needed: ${fileInfo.file}`);
    }

  } catch (error) {
    console.error(`❌ Error cleaning ${fileInfo.file}:`, error.message);
  }
}

async function main() {
  console.log('Starting cleanup process...\n');

  for (const fileInfo of CLEANUP_FILES) {
    await cleanupFile(fileInfo);
  }

  console.log('\n🎉 Cleanup completed!');
  console.log('\nNext steps:');
  console.log('1. Review the changes');
  console.log('2. Test the application');
  console.log('3. Commit the cleanup');
}

main().catch(console.error);