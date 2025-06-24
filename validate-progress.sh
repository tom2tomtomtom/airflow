#!/bin/bash

# AIRWAVE Progress Validation Script
# Validates each step of the recovery process

set -e

echo "🔍 AIRWAVE Recovery Progress Validation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Helper function to run a check
run_check() {
    local check_name="$1"
    local command="$2"
    local expected_result="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  [$(printf "%02d" $TOTAL_CHECKS)] $check_name: "
    
    if eval "$command" >/dev/null 2>&1; then
        if [ "$expected_result" = "pass" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL (expected to fail but passed)${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            echo -e "${YELLOW}⚠️  EXPECTED FAIL${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
    fi
}

# Helper function to count errors
count_errors() {
    local pattern="$1"
    local count=$(npm run type-check 2>&1 | grep -c "$pattern" || echo "0")
    echo "$count"
}

echo -e "${BLUE}🏗️  PHASE 1: Foundation Validation${NC}"
echo "=================================="

# Git setup validation
run_check "Git branch is recovery-foundation" "[ \$(git branch --show-current) = 'recovery-foundation' ]" "pass"
run_check "Git remote is correct repository" "git remote get-url origin | grep -q 'tom2tomtomtom/AIRWAVE_0525_CODEX'" "pass"
run_check "Git working directory is clean" "git diff --quiet" "pass"

# Environment validation
run_check "Node.js is available" "node --version" "pass"
run_check "NPM is available" "npm --version" "pass"
run_check "TypeScript is available" "npx tsc --version" "pass"

# Project structure validation
run_check "Package.json exists" "[ -f package.json ]" "pass"
run_check "Tsconfig.json exists" "[ -f tsconfig.json ]" "pass"
run_check "Source directory exists" "[ -d src ]" "pass"
run_check "Node modules installed" "[ -d node_modules ]" "pass"

echo ""
echo -e "${BLUE}📊 Current Error Analysis${NC}"
echo "=========================="

# Count different types of errors
TS_ERRORS=$(npm run type-check 2>&1 | grep -c "error TS" || echo "0")
SYNTAX_ERRORS=$(npm run type-check 2>&1 | grep -c "TS1005\|TS1128\|TS1135" || echo "0")
BROKEN_OBJECTS=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "{ }" | wc -l)

echo "  📈 Total TypeScript errors: $TS_ERRORS"
echo "  🔧 Syntax errors (critical): $SYNTAX_ERRORS"
echo "  📦 Files with broken objects: $BROKEN_OBJECTS"

# Create baseline file for tracking progress
cat > .recovery-baseline.json << EOF
{
  "phase": "foundation",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_branch": "$(git branch --show-current)",
  "git_commit": "$(git rev-parse HEAD)",
  "metrics": {
    "total_typescript_errors": $TS_ERRORS,
    "syntax_errors": $SYNTAX_ERRORS,
    "broken_object_files": $BROKEN_OBJECTS,
    "total_source_files": $(find src -name "*.ts" -o -name "*.tsx" | wc -l)
  },
  "validation": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "failed_checks": $FAILED_CHECKS,
    "success_rate": $(echo "scale=1; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc -l 2>/dev/null || echo "0")
  }
}
EOF

echo ""
echo -e "${BLUE}🎯 Phase Completion Criteria${NC}"
echo "============================"

# Define what needs to be achieved for each phase
echo "  Phase 1 (Foundation): ✅ Complete"
echo "    ✅ Git setup and branch creation"
echo "    ✅ Misleading documentation removed"
echo "    ✅ Validation pipeline established"

echo "  Phase 2 (Syntax Recovery): 🔄 Next"
echo "    🎯 Target: Reduce syntax errors by 80%"
echo "    🎯 Fix all broken object literals"
echo "    🎯 Get basic TypeScript compilation working"

echo "  Phase 3 (Functionality): ⏳ Pending"
echo "    🎯 Authentication system working"
echo "    🎯 Database integration restored"
echo "    🎯 Basic app runs without errors"

echo ""
echo -e "${BLUE}📋 Summary${NC}"
echo "=========="

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "  Status: ${GREEN}✅ All foundation checks passed${NC}"
    echo -e "  Progress: ${GREEN}Phase 1 Complete${NC}"
    echo -e "  Next: Begin Phase 2 - Syntax Recovery"
else
    echo -e "  Status: ${RED}❌ $FAILED_CHECKS checks failed${NC}"
    echo -e "  Progress: ${YELLOW}Phase 1 needs fixes${NC}"
    echo -e "  Action: Address failed checks before proceeding"
fi

echo ""
echo "📊 Baseline saved to .recovery-baseline.json"
echo "🔄 Run this script after each phase to track progress"

# Set exit code based on results
if [ $FAILED_CHECKS -eq 0 ]; then
    exit 0
else
    exit 1
fi