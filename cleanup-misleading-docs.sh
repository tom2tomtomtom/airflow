#!/bin/bash

# Script to remove misleading documentation that claims the project is production-ready
# when it actually has critical compilation errors

echo "🧹 Cleaning up misleading documentation..."
echo "================================================"

# Create backup directory first
mkdir -p .misleading-docs-backup/$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=".misleading-docs-backup/$(date +%Y%m%d-%H%M%S)"

echo "📦 Creating backup in $BACKUP_DIR..."

# List of misleading files to remove
MISLEADING_FILES=(
    # Production readiness claims (when code doesn't compile)
    "AIRWAVE_PRODUCTION_READINESS_REPORT.md"
    "SECURITY_FIXES_COMPLETED.md"
    "CODE_IMPROVEMENTS_REPORT.md" 
    "CLEANUP_IMPROVEMENTS_README.md"
    "AIRWAVE_TEST_COVERAGE_REPORT.md"
    "COMPREHENSIVE_UI_TESTING_PLAN.md"
    "TYPESCRIPT_BUILD_ANALYSIS.md"
    "COMPLETION_PLAN_BACKUP.md"
    "NEXT_PHASES_TASK_LIST.md"
    "PERFORMANCE_BASELINE.md"
    "IMPLEMENTATION_ROADMAP.md"
    
    # Misleading production documentation
    "docs/PRODUCTION_READINESS_FINAL_ASSESSMENT.md"
    "docs/PRODUCTION_READINESS_PLAN.md" 
    "docs/PRODUCTION_OPERATIONS.md"
    "docs/PRODUCTION_READINESS_DEEP_DIVE_ASSESSMENT.md"
    "docs/archive/COMPREHENSIVE_CODE_REVIEW.md"
    "docs/archive/COMPREHENSIVE_PLATFORM_TEST_REPORT.md"
    "docs/archive/FINAL_COMPREHENSIVE_REPORT.md"
    
    # Misleading JSON/HTML reports
    "production-readiness-report.html"
    "production-readiness-report.json"
    "advanced-fix-report.json"
    "emergency-audit-report.json"
    "syntax-fix-report.json"
    "performance-baseline.json"
    "strict-mode-migration-plan.json"
)

# Function to safely move file to backup and remove
move_to_backup() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "📄 Moving $file to backup..."
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp "$file" "$BACKUP_DIR/$file"
        rm "$file"
        echo "   ✅ Removed $file"
    else
        echo "   ⏭️  $file not found, skipping"
    fi
}

# Move misleading files to backup
for file in "${MISLEADING_FILES[@]}"; do
    move_to_backup "$file"
done

# Also remove any other files with misleading names
echo ""
echo "🔍 Searching for other misleading files..."

# Find files with misleading patterns in names
find . -maxdepth 3 -name "*.md" -o -name "*.html" -o -name "*.json" | grep -v node_modules | grep -v .git | while read file; do
    # Check for misleading patterns in filenames
    if echo "$file" | grep -qE "(COMPLETE|SUCCESS|READY|PRODUCTION|COMPREHENSIVE|FINAL)" && [ -f "$file" ]; then
        # Double check it's not a legitimate file we want to keep
        if ! echo "$file" | grep -qE "(package\.json|README\.md|\.next|node_modules|\.git)"; then
            echo "🔍 Found potentially misleading file: $file"
            echo "   Do you want to move this to backup? (y/n/s to skip all)"
            read -n 1 response
            echo ""
            case $response in
                y|Y) move_to_backup "$file" ;;
                s|S) echo "   Skipping remaining files"; break ;;
                *) echo "   Skipping $file" ;;
            esac
        fi
    fi
done

echo ""
echo "🧹 Cleanup Summary:"
echo "=================="
echo "✅ Moved misleading documentation to backup: $BACKUP_DIR"
echo "📁 Backup contains $(find "$BACKUP_DIR" -type f | wc -l) files"
echo ""
echo "💡 Next steps:"
echo "1. Run 'npm run type-check' to see the actual compilation errors"
echo "2. Run 'npm test' to see the real test status"  
echo "3. Create honest documentation based on actual project state"
echo ""
echo "🔄 To restore files if needed:"
echo "   cp -r $BACKUP_DIR/* ."
echo ""
echo "⚠️  Remember: This project currently has critical compilation errors"
echo "   and is NOT production ready despite what the removed docs claimed."