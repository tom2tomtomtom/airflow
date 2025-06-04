#!/bin/bash

# AIRWAVE Deployment Setup Script
# This script configures Supabase + Netlify + Playwright CLI for deployment

set -e

echo "🚀 Setting up AIRWAVE deployment configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running in AIRWAVE directory
if [ ! -f "package.json" ] || ! grep -q '"name": "airwave"' package.json; then
    echo -e "${RED}❌ Error: This script must be run from the AIRWAVE project directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Prerequisites Check${NC}"

# Check Node.js version
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check if npm is available
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check for Playwright
if ! npx playwright --version >/dev/null 2>&1; then
    echo -e "${YELLOW}🎭 Installing Playwright browsers...${NC}"
    npx playwright install chromium
else
    echo -e "${GREEN}✅ Playwright already installed${NC}"
fi

# Check for Supabase CLI
if ! command -v supabase >/dev/null 2>&1; then
    echo -e "${YELLOW}🏗️ Installing Supabase CLI...${NC}"
    npm install -g supabase
else
    echo -e "${GREEN}✅ Supabase CLI available${NC}"
fi

echo -e "\n${BLUE}🔧 Configuration Setup${NC}"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating .env.local from template...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please update .env.local with your actual values${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Verify critical files exist
echo -e "\n${BLUE}✨ Verifying deployment files...${NC}"

FILES_TO_CHECK=(
    "netlify.toml"
    "playwright.config.ts"
    "scripts/setup-supabase-complete.sql"
    "SUPABASE_COMPLETE_SETUP_GUIDE.md"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

echo -e "\n${BLUE}🧪 Testing Configuration${NC}"

# Test TypeScript compilation
echo -e "${YELLOW}🔍 Checking TypeScript...${NC}"
if npm run type-check; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript errors found. Run 'npm run fix:typescript:all' to fix${NC}"
fi

# Test build
echo -e "${YELLOW}🏗️ Testing build...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Check errors above${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo -e "1. Update .env.local with your Supabase credentials"
echo -e "2. Run Supabase migration: ${YELLOW}supabase db push${NC}"
echo -e "3. Deploy to Netlify: ${YELLOW}git push${NC} (if connected to Netlify)"
echo -e "4. Run tests: ${YELLOW}npm run test:e2e${NC}"

echo -e "\n${BLUE}🔗 Useful Commands:${NC}"
echo -e "• ${YELLOW}npm run dev${NC} - Start development server"
echo -e "• ${YELLOW}npm run test:e2e${NC} - Run Playwright tests"
echo -e "• ${YELLOW}npm run test:e2e:ui${NC} - Run Playwright tests with UI"
echo -e "• ${YELLOW}supabase start${NC} - Start local Supabase (if installed)"
echo -e "• ${YELLOW}netlify dev${NC} - Test Netlify deployment locally"

echo -e "\n${GREEN}✨ AIRWAVE is ready for deployment!${NC}"