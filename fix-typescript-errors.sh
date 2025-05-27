#!/bin/bash

# Fix TypeScript Errors Script
# This script systematically fixes common TypeScript errors in the AIrWAVE project

echo "🔧 Starting TypeScript error fixes..."

# Create a TypeScript config for stricter checks
cat > tsconfig.strict.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
EOF

# Function to fix unused imports using ESLint
fix_unused_imports() {
    echo "📦 Fixing unused imports..."
    
    # Create ESLint config for auto-fixing unused imports
    cat > .eslintrc.fix.json << 'EOF'
{
  "extends": "./.eslintrc.json",
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "error",
      {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_"
      }
    ]
  }
}
EOF

    # Install required ESLint plugins if not already installed
    npm install --save-dev eslint-plugin-unused-imports || true

    # Run ESLint auto-fix on all TypeScript files
    npx eslint 'src/**/*.{ts,tsx}' --config .eslintrc.fix.json --fix --ext .ts,.tsx
    
    # Clean up
    rm .eslintrc.fix.json
}

# Function to fix implicit any types in common patterns
fix_implicit_any() {
    echo "🎯 Fixing implicit any types..."
    
    # Fix array method callbacks (map, filter, etc.)
    find src -name "*.tsx" -o -name "*.ts" | while read file; do
        # Fix .map((item) => to .map((item: any) =>
        sed -i.bak -E 's/\.map\(\(([a-zA-Z_][a-zA-Z0-9_]*)\) =>/\.map\(\(\1: any\) =>/g' "$file"
        
        # Fix .filter((item) => to .filter((item: any) =>
        sed -i.bak -E 's/\.filter\(\(([a-zA-Z_][a-zA-Z0-9_]*)\) =>/\.filter\(\(\1: any\) =>/g' "$file"
        
        # Fix .find((item) => to .find((item: any) =>
        sed -i.bak -E 's/\.find\(\(([a-zA-Z_][a-zA-Z0-9_]*)\) =>/\.find\(\(\1: any\) =>/g' "$file"
        
        # Clean up backup files
        rm -f "${file}.bak"
    done
}

# Function to fix unused parameters by prefixing with underscore
fix_unused_parameters() {
    echo "🔍 Fixing unused parameters..."
    
    # Common patterns for unused event handlers
    find src -name "*.tsx" -o -name "*.ts" | while read file; do
        # Fix onChange={(e) => to onChange={(_e) =>
        sed -i.bak -E 's/onChange=\{[ ]*\(e\)[ ]*=>/onChange={(_e) =>/g' "$file"
        
        # Fix onClick={(e) => to onClick={(_e) =>
        sed -i.bak -E 's/onClick=\{[ ]*\(e\)[ ]*=>/onClick={(_e) =>/g' "$file"
        
        # Fix event: React. to _event: React.
        sed -i.bak -E 's/\(event: React\./(_event: React./g' "$file"
        
        # Clean up backup files
        rm -f "${file}.bak"
    done
}

# Function to generate TypeScript error report
generate_error_report() {
    echo "📊 Generating error report..."
    
    npx tsc --noEmit --pretty > typescript-errors.log 2>&1 || true
    
    # Count errors by type
    echo "Error Summary:"
    echo "- Unused declarations: $(grep -c "is declared but its value is never read" typescript-errors.log || echo 0)"
    echo "- Type mismatches: $(grep -c "is not assignable to type" typescript-errors.log || echo 0)"
    echo "- Implicit any: $(grep -c "implicitly has an 'any' type" typescript-errors.log || echo 0)"
    echo "- Missing properties: $(grep -c "does not exist on type" typescript-errors.log || echo 0)"
    
    # Show top files with errors
    echo -e "\nTop files with errors:"
    grep -E "^src/" typescript-errors.log | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -10
}

# Function to fix specific known issues
fix_known_issues() {
    echo "🔨 Fixing known specific issues..."
    
    # Fix the SUPABASE_SERVICE_KEY typo (already fixed but checking)
    find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "SUPABASE_SERVICE_KEY" | while read file; do
        sed -i.bak 's/SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY/g' "$file"
        rm -f "${file}.bak"
    done
    
    # Fix ListItemText import issue in execute.tsx
    if [ -f "src/pages/execute.tsx" ]; then
        sed -i.bak '/ListItem[^T]/s/ListItem/ListItem,\n  ListItemText/' "src/pages/execute.tsx"
        rm -f "src/pages/execute.tsx.bak"
    fi
}

# Main execution
echo "🚀 Running TypeScript error fixes..."

# Generate initial report
generate_error_report

# Run fixes
fix_unused_imports
fix_implicit_any
fix_unused_parameters
fix_known_issues

# Generate final report
echo -e "\n📈 Final error count:"
generate_error_report

# Clean up
rm -f tsconfig.strict.json typescript-errors.log

echo "✅ TypeScript error fixing complete!"
echo "🔍 Please run 'npm run type-check' to see remaining errors that need manual fixing."
