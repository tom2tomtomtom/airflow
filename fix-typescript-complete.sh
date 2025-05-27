#!/bin/bash
# fix-typescript-complete.sh - Complete TypeScript error fixing script

echo "🚀 Starting complete TypeScript error fixing process..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p utils types

# Step 1: Run the comprehensive fix script
echo ""
echo "🔧 Step 1: Running automated fixes..."
echo "------------------------------------"
npm run fix:typescript:all

# Step 2: Count remaining errors
echo ""
echo "📊 Step 2: Counting remaining errors..."
echo "--------------------------------------"
npm run count:errors

# Step 3: Run ESLint fixes
echo ""
echo "🧹 Step 3: Running ESLint auto-fix..."
echo "------------------------------------"
npx eslint . --fix --ext .ts,.tsx || true

# Step 4: Run type check to see what's left
echo ""
echo "🔍 Step 4: Running type check..."
echo "--------------------------------"
npm run type-check 2>&1 | tee typescript-errors-remaining.log || true

# Step 5: Generate updated error report
echo ""
echo "📄 Step 5: Generating error report..."
echo "------------------------------------"
node -e "
const fs = require('fs');
const errorLog = fs.readFileSync('typescript-errors-remaining.log', 'utf-8');
const lines = errorLog.split('\\n');

const summary = {
  unused: 0,
  typeMismatch: 0,
  implicitAny: 0,
  missingProperty: 0,
  other: 0,
  total: 0
};

const errors = {
  unused: [],
  typeMismatch: [],
  implicitAny: [],
  missingProperty: [],
  other: []
};

lines.forEach(line => {
  if (line.includes('TS6133')) {
    summary.unused++;
    errors.unused.push(line);
  } else if (line.includes('TS2322') || line.includes('TS2345')) {
    summary.typeMismatch++;
    errors.typeMismatch.push(line);
  } else if (line.includes('TS7006')) {
    summary.implicitAny++;
    errors.implicitAny.push(line);
  } else if (line.includes('TS2339')) {
    summary.missingProperty++;
    errors.missingProperty.push(line);
  } else if (line.includes('error TS')) {
    summary.other++;
    errors.other.push(line);
  }
});

summary.total = summary.unused + summary.typeMismatch + summary.implicitAny + summary.missingProperty + summary.other;

const report = {
  timestamp: new Date().toISOString(),
  summary,
  errors
};

fs.writeFileSync('typescript-errors-final.json', JSON.stringify(report, null, 2));

console.log('\\n📊 Error Summary:');
console.log('=================');
console.log(\`Total Errors: \${summary.total}\`);
console.log(\`- Unused Declarations: \${summary.unused}\`);
console.log(\`- Type Mismatches: \${summary.typeMismatch}\`);
console.log(\`- Implicit Any: \${summary.implicitAny}\`);
console.log(\`- Missing Properties: \${summary.missingProperty}\`);
console.log(\`- Other: \${summary.other}\`);
"

# Step 6: Create TypeScript strict config
echo ""
echo "📝 Step 6: Creating stricter TypeScript config..."
echo "------------------------------------------------"
cat > tsconfig.strict.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
EOF

echo "✅ Created tsconfig.strict.json for gradual migration"

# Step 7: Summary and next steps
echo ""
echo "🎉 TypeScript Error Fixing Complete!"
echo "===================================="
echo ""
echo "📋 Next Steps:"
echo "1. Review the remaining errors in 'typescript-errors-remaining.log'"
echo "2. Manually fix any complex type issues that couldn't be automated"
echo "3. Gradually migrate to stricter TypeScript by:"
echo "   - Renaming tsconfig.strict.json to tsconfig.json when ready"
echo "   - Or enabling one strict option at a time in tsconfig.json"
echo ""
echo "🔧 Useful Commands:"
echo "   npm run type-check        - Check for TypeScript errors"
echo "   npm run fix:typescript:all - Run automated fixes again"
echo "   npm run count:errors      - Count errors by type"
echo "   npm run lint             - Run ESLint"
echo ""
echo "💡 Tips:"
echo "   - Most remaining errors will be complex type issues"
echo "   - Consider using 'any' temporarily for difficult types"
echo "   - Add // @ts-ignore for truly problematic lines (use sparingly)"
echo "   - Enable strict mode gradually, one option at a time"

# Check if there are no errors
if grep -q "Found 0 errors" typescript-errors-remaining.log 2>/dev/null; then
  echo ""
  echo "🎊 Congratulations! All TypeScript errors have been fixed! 🎊"
  echo ""
  echo "Consider enabling strict mode in tsconfig.json for better type safety."
fi
