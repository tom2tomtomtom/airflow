#!/bin/bash

# AIRWAVE Recovery Plan Script
# This script helps recover the codebase to a working state

echo "🔧 AIRWAVE Recovery Plan"
echo "========================"

# Step 1: Identify the last known good commit
echo -e "\n📍 Step 1: Finding last known good commit..."
echo "Checking commits before the automated syntax fixes..."

# Look for commits before the problematic fixes
git log --oneline --before="2025-06-23" --grep="^feat:" --grep="^fix:" | head -10

echo -e "\n❓ Which approach would you like to take?"
echo "1. Surgical Fix - Fix syntax errors in current state (3-5 days)"
echo "2. Clean Revert - Go back to working state and re-apply changes (2-3 days)"
echo "3. Analyze Only - Just show me what needs fixing"

read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo -e "\n🔧 Surgical Fix Approach Selected"
    echo "Creating a syntax fix branch..."
    git checkout -b syntax-recovery-$(date +%Y%m%d)
    
    # Create a smarter fix script
    cat > smart-syntax-fix.js << 'EOF'
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix patterns that are definitely broken
const fixes = [
  // Fix empty object syntax
  {
    pattern: /(\w+):\s*{\s*}\s*\n\s*'/gm,
    replacement: '$1: {\n    \''
  },
  // Fix trailing commas in interfaces
  {
    pattern: /,\s*\n\s*}/gm,
    replacement: '\n}'
  },
  // Fix double commas
  {
    pattern: /,,/g,
    replacement: ','
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    fixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Error in ${filePath}: ${err.message}`);
  }
  return false;
}

// Start with the most critical files
const criticalFiles = [
  'src/utils/ai-cost-estimation.ts',
  'src/lib/config/environments.ts',
  'src/types/database.ts',
  'src/middleware/__tests__/withAuth.test.ts'
];

console.log('Fixing critical files first...');
criticalFiles.forEach(fixFile);

console.log('\nRun "npm run type-check" to see remaining issues');
EOF
    ;;
    
  2)
    echo -e "\n🔄 Clean Revert Approach Selected"
    echo "Finding a stable commit to revert to..."
    
    # Find the last commit before the syntax massacre
    LAST_GOOD=$(git log --oneline --before="2025-06-22" -1 --format="%H")
    echo "Last known good commit: $LAST_GOOD"
    
    git checkout -b recovery-clean-$(date +%Y%m%d) $LAST_GOOD
    echo "✅ Created recovery branch from stable commit"
    
    echo -e "\nNow you can:"
    echo "1. Cherry-pick your feature commits"
    echo "2. Re-apply security fixes manually"
    echo "3. Skip all the automated syntax fix commits"
    ;;
    
  3)
    echo -e "\n📊 Analysis Mode"
    echo "Checking TypeScript compilation issues..."
    
    # Try to compile and capture errors
    echo "Running TypeScript check (this will fail, but we'll analyze the output)..."
    npx tsc --noEmit 2>&1 | head -50 | tee typescript-errors.log
    
    echo -e "\n📈 Error Summary:"
    echo "Total TS files: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)"
    echo "Files with syntax errors: $(grep -l "error TS" typescript-errors.log | wc -l)"
    
    echo -e "\nMost common error patterns:"
    grep "error TS" typescript-errors.log | cut -d: -f3- | sort | uniq -c | sort -nr | head -10
    ;;
esac

echo -e "\n📋 Next Steps:"
echo "1. Fix the most critical syntax errors first"
echo "2. Get TypeScript to compile (even with some type errors)"
echo "3. Fix the test suite syntax errors"
echo "4. Run tests and fix failures"
echo "5. Complete type safety fixes"
