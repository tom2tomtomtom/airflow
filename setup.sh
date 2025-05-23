#!/bin/bash

# AIRWAVE Repository Cleanup & Setup Script
# This script cleans up temporary files and sets up the development environment

set -e

echo "🚀 AIRWAVE Repository Cleanup & Setup"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Remove fix scripts
echo "🧹 Cleaning up fix scripts..."
if ls fix_*.js 1> /dev/null 2>&1; then
    rm -f fix_*.js
    print_status "Removed fix scripts"
else
    print_info "No fix scripts found"
fi

# Step 2: Remove temporary files
echo ""
echo "🗑️  Removing temporary files..."
files_to_remove=("temp.txt" "test.php" "tsconfig.tsbuildinfo")
for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        print_status "Removed $file"
    else
        print_info "$file not found"
    fi
done

# Step 3: Remove duplicate files
echo ""
echo "🔄 Removing duplicate files..."
duplicates=("src/pages/strategic-content-fixed.tsx" "src/pages/matrix.tsx.new")
for file in "${duplicates[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        print_status "Removed duplicate: $file"
    else
        print_info "Duplicate not found: $file"
    fi
done

# Step 4: Check for Node.js and npm
echo ""
echo "🔍 Checking development environment..."
if command -v node &> /dev/null; then
    print_status "Node.js found: $(node --version)"
else
    print_error "Node.js not found. Please install Node.js 18.x or higher"
    exit 1
fi

if command -v npm &> /dev/null; then
    print_status "npm found: $(npm --version)"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

# Step 5: Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_status "Dependencies installed"
else
    print_error "package.json not found"
    exit 1
fi

# Step 6: Setup environment file
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning "Created .env.local from .env.example"
        print_info "Please edit .env.local with your API keys"
    else
        print_warning ".env.example not found"
    fi
else
    print_status ".env.local already exists"
fi

# Step 7: Run code quality checks
echo ""
echo "🔧 Running code quality checks..."
print_info "Fixing linting issues..."
npm run lint:fix || print_warning "Some linting issues may need manual attention"

print_info "Formatting code..."
npm run format || print_warning "Some formatting issues may need manual attention"

print_info "Running type check..."
npm run type-check || print_warning "TypeScript issues found - please review"

# Step 8: Test the application
echo ""
echo "🧪 Testing application..."
print_info "Running tests..."
npm test || print_warning "Some tests may be failing"

echo ""
echo "🎉 Cleanup and setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to test the application"
echo ""
echo "Available scripts:"
echo "- npm run dev          # Start development server"
echo "- npm run build        # Build for production"
echo "- npm run test         # Run tests"
echo "- npm run lint:fix     # Fix linting issues"
echo "- npm run format       # Format code"
echo "- npm run validate     # Run all quality checks"
echo "- npm run cleanup:repo # Clean up repository files"
echo ""
print_status "AIRWAVE is ready for development! 🚀"
