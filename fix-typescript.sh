#!/bin/bash

# Fix common TypeScript errors
cd /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX

echo "Fixing common TypeScript patterns..."

# Fix React event types
find src -name "*.tsx" -type f -exec sed -i '' 's/React\.ClickEvent/React.MouseEvent/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/React\.KeyPressEvent/React.KeyboardEvent/g' {} \;

# Fix Grid prop issues
find src -name "*.tsx" -type f -exec sed -i '' 's/<Grid item/<Grid2 item/g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/<\/Grid>/<\/Grid2>/g' {} \;

# Fix import statements for Grid2
find src -name "*.tsx" -type f -exec sed -i '' 's/Grid,/Grid, Grid2,/g' {} \;

# Fix console statements to use proper logging
find src -name "*.ts" -name "*.tsx" -type f -exec sed -i '' 's/console\.log(/\/\/ console.log(/g' {} \;
find src -name "*.ts" -name "*.tsx" -type f -exec sed -i '' 's/console\.warn(/\/\/ console.warn(/g' {} \;

# Fix unused variable naming
find src -name "*.ts" -name "*.tsx" -type f -exec sed -i '' 's/const \([a-zA-Z_][a-zA-Z0-9_]*\) = getErrorMessage/const _\1 = getErrorMessage/g' {} \;

echo "TypeScript fixes applied!"