#!/bin/bash

echo "🧹 Cleaning up AIRWAVE repository..."

# Remove fix scripts (they should be run once then deleted)
echo "Removing fix scripts..."
rm -f fix_*.js

# Remove temporary files
echo "Removing temporary files..."
rm -f temp.txt
rm -f test.php

# Remove TypeScript build info (should be gitignored)
echo "Removing build artifacts..."
rm -f tsconfig.tsbuildinfo

# Remove duplicate files - keep the "main" versions, remove duplicates
echo "Cleaning up duplicate files..."
rm -f src/pages/strategic-content-fixed.tsx
rm -f src/pages/matrix.tsx.new

echo "✅ Repository cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run lint:fix' to fix any remaining linting issues"
echo "2. Run 'npm run format' to apply consistent formatting"
echo "3. Run 'npm run validate' to ensure everything is working"
echo "4. Commit the cleaned repository"
