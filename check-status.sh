#!/bin/bash

# AIRFLOW Local Development Status Check
# Run this to see your current development state

echo "🔍 AIRFLOW Local Development Status"
echo "==================================="
echo ""

# Current directory
echo "📁 Working Directory:"
pwd
echo ""

# Git branch and status
echo "🌿 Git Branch:"
git branch --show-current
echo ""

echo "📊 Git Status Summary:"
MODIFIED=$(git status --porcelain | grep "^ M" | wc -l | tr -d ' ')
ADDED=$(git status --porcelain | grep "^A" | wc -l | tr -d ' ')
DELETED=$(git status --porcelain | grep "^D" | wc -l | tr -d ' ')
UNTRACKED=$(git status --porcelain | grep "^??" | wc -l | tr -d ' ')

echo "  Modified files: $MODIFIED"
echo "  Added files: $ADDED"
echo "  Deleted files: $DELETED"
echo "  Untracked files: $UNTRACKED"
echo ""

# TypeScript check
echo "🔧 TypeScript Status:"
if npx tsc --noEmit --pretty false 2>&1 | grep -q "error TS"; then
    ERROR_COUNT=$(npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | wc -l | tr -d ' ')
    echo "  ❌ TypeScript Errors: $ERROR_COUNT"
    echo ""
    echo "  Most common errors:"
    npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | cut -d: -f4 | sort | uniq -c | sort -rn | head -5
else
    echo "  ✅ No TypeScript errors!"
fi
echo ""

# Recent commits
echo "📝 Recent Commits:"
git log --oneline -5
echo ""

# Health check
echo "🏥 Quick Health Check:"
echo -n "  Dev server: "
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Running on port 3000"
else
    echo "⭕ Not running"
fi

echo -n "  Node modules: "
if [ -d "node_modules" ]; then
    echo "✅ Installed"
else
    echo "❌ Not installed (run 'npm install')"
fi

echo -n "  Environment: "
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "⚠️  .env.local missing"
fi
echo ""

# Safety reminder
echo "🛡️  Safety Reminders:"
echo "  • Work on ONE file at a time"
echo "  • Test after EVERY change"
echo "  • Commit frequently"
echo "  • Run 'npm run type-check' often"
echo ""

# Next recommended action
echo "💡 Recommended Next Action:"
if [ $MODIFIED -gt 0 ]; then
    echo "  You have $MODIFIED modified files. Consider:"
    echo "  1. Test your changes: npm run dev"
    echo "  2. Check types: npm run type-check"
    echo "  3. Commit your work: git add . && git commit -m 'fix: description'"
elif [ $ERROR_COUNT -gt 0 ]; then
    echo "  Fix TypeScript errors one file at a time"
    echo "  Start with: npx tsc --noEmit | head -20"
else
    echo "  Everything looks good! Continue fixing syntax errors."
fi
