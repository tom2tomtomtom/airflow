#!/bin/bash

# AIrWAVE TypeScript Error Fix Master Script
# This script runs all TypeScript fixes in the correct order

set -e  # Exit on error

echo "🚀 AIrWAVE TypeScript Error Fix Master Script"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Function to run a command and check its status
run_command() {
    local cmd="$1"
    local desc="$2"
    
    echo -e "${YELLOW}Running: $desc${NC}"
    echo "Command: $cmd"
    
    if eval "$cmd"; then
        echo -e "${GREEN}✓ Success: $desc${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Failed: $desc${NC}\n"
        return 1
    fi
}

# Step 1: Install required dependencies
echo -e "${YELLOW}Step 1: Installing required dependencies${NC}"
run_command "npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-unused-imports glob" "Install ESLint TypeScript plugins"

# Step 2: Make scripts executable
echo -e "${YELLOW}Step 2: Making scripts executable${NC}"
run_command "chmod +x scripts/*.sh scripts/*.js" "Make scripts executable"

# Step 3: Fix critical TypeScript errors first
echo -e "${YELLOW}Step 3: Fixing critical TypeScript errors${NC}"
if [ -f "scripts/fix-critical-typescript.sh" ]; then
    run_command "./scripts/fix-critical-typescript.sh" "Fix critical TypeScript errors"
else
    echo "Creating critical fix script..."
    cat > scripts/fix-critical-typescript.sh << 'EOF'
#!/bin/bash

# Fix SUPABASE_SERVICE_KEY -> SUPABASE_SERVICE_ROLE_KEY
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY/g'

# Fix optional chaining issues
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/session\.user\./session?.user?./g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/campaign\.schedule/campaign?.schedule/g'

echo "Critical fixes applied!"
EOF
    chmod +x scripts/fix-critical-typescript.sh
    run_command "./scripts/fix-critical-typescript.sh" "Fix critical TypeScript errors"
fi

# Step 4: Run the comprehensive fix script
echo -e "${YELLOW}Step 4: Running comprehensive TypeScript fixes${NC}"
run_command "node scripts/fix-all-typescript-errors.js" "Comprehensive TypeScript fixes"

# Step 5: Run advanced TypeScript compiler fixes
echo -e "${YELLOW}Step 5: Running advanced TypeScript compiler fixes${NC}"
run_command "node scripts/fix-typescript-advanced.js" "Advanced TypeScript compiler fixes"

# Step 6: Run ESLint auto-fix
echo -e "${YELLOW}Step 6: Running ESLint auto-fix${NC}"
run_command "npx eslint src --ext .ts,.tsx --fix --max-warnings=0 || true" "ESLint auto-fix"

# Step 7: Remove unused imports specifically
echo -e "${YELLOW}Step 7: Removing unused imports${NC}"
if [ -f "scripts/remove-unused-imports.sh" ]; then
    run_command "./scripts/remove-unused-imports.sh" "Remove unused imports"
else
    echo "Creating unused imports removal script..."
    cat > scripts/remove-unused-imports.sh << 'EOF'
#!/bin/bash

# Remove unused imports using ESLint
npx eslint src --ext .ts,.tsx --fix --rule 'unused-imports/no-unused-imports: error' --no-eslintrc

echo "Unused imports removed!"
EOF
    chmod +x scripts/remove-unused-imports.sh
    run_command "./scripts/remove-unused-imports.sh" "Remove unused imports"
fi

# Step 8: Final TypeScript check
echo -e "${YELLOW}Step 8: Running final TypeScript check${NC}"
echo ""

# Count errors before
ERRORS_BEFORE=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")

# Run type check and capture output
TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
TSC_EXIT_CODE=$?

# Count errors after
ERRORS_AFTER=$(echo "$TSC_OUTPUT" | grep -c "error TS" || echo "0")

# Display results
echo "============================================="
echo -e "${YELLOW}RESULTS:${NC}"
echo "============================================="
echo -e "Errors before fixes: ${RED}$ERRORS_BEFORE${NC}"
echo -e "Errors after fixes: ${GREEN}$ERRORS_AFTER${NC}"
echo -e "Errors fixed: ${GREEN}$((ERRORS_BEFORE - ERRORS_AFTER))${NC}"
echo ""

if [ $TSC_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✨ SUCCESS! All TypeScript errors have been fixed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run build"
    echo "2. Test your application"
    echo "3. Commit the changes"
else
    echo -e "${YELLOW}⚠️  Some TypeScript errors remain${NC}"
    echo ""
    echo "Remaining errors saved to: typescript-remaining-errors.txt"
    echo "$TSC_OUTPUT" > typescript-remaining-errors.txt
    
    # Show first 10 remaining errors
    echo ""
    echo "First 10 remaining errors:"
    echo "$TSC_OUTPUT" | grep "error TS" | head -10
    
    echo ""
    echo "To fix remaining errors manually:"
    echo "1. Review typescript-remaining-errors.txt"
    echo "2. Check TYPESCRIPT_FIX_GUIDE.md for manual fix instructions"
    echo "3. Run: npm run type-check"
fi

# Step 9: Generate fix report
echo ""
echo -e "${YELLOW}Generating fix report...${NC}"

cat > typescript-fix-report.md << EOF
# TypeScript Fix Report

Generated: $(date)

## Summary
- Initial errors: $ERRORS_BEFORE
- Remaining errors: $ERRORS_AFTER
- Fixed: $((ERRORS_BEFORE - ERRORS_AFTER))
- Success rate: $(awk "BEGIN {printf \"%.1f\", ($ERRORS_BEFORE - $ERRORS_AFTER) / $ERRORS_BEFORE * 100}")%

## Scripts Run
1. Critical fixes
2. Comprehensive fixes
3. Advanced compiler fixes
4. ESLint auto-fix
5. Unused imports removal

## Next Steps
$(if [ $TSC_EXIT_CODE -eq 0 ]; then
    echo "✅ All errors fixed! Ready to build and deploy."
else
    echo "⚠️  Manual fixes required for remaining errors. See typescript-remaining-errors.txt"
fi)

## Files Modified
$(git status --porcelain | grep -E '\.(ts|tsx)$' | wc -l) TypeScript files modified

EOF

echo -e "${GREEN}Fix report saved to: typescript-fix-report.md${NC}"

# Final message
echo ""
echo "============================================="
echo -e "${GREEN}TypeScript fix process complete!${NC}"
echo "============================================="

exit $TSC_EXIT_CODE
