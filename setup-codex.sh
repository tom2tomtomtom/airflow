#!/bin/bash

# AIRWAVE CODEX - Development Environment Setup Script
# This script sets up the complete development environment for the AIRWAVE project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}\n"
}

print_success() {
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

print_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get Node.js version
get_node_version() {
    node --version 2>/dev/null | sed 's/v//' | cut -d'.' -f1
}

# Function to check Node.js version compatibility
check_node_version() {
    local node_version
    node_version=$(get_node_version)
    
    if [ "$node_version" -ge 18 ]; then
        return 0
    else
        return 1
    fi
}

print_header "AIRWAVE CODEX - Development Setup"

echo -e "${CYAN}🚀 Welcome to AIRWAVE CODEX Setup!${NC}"
echo -e "This script will set up your complete development environment.\n"

# Step 1: System Requirements Check
print_header "SYSTEM REQUIREMENTS CHECK"

print_step "Checking Node.js installation..."
if command_exists node; then
    if check_node_version; then
        print_success "Node.js found: $(node --version) ✓"
    else
        print_error "Node.js version $(node --version) is too old. Please install Node.js 18.x or higher."
        echo -e "${YELLOW}Visit: https://nodejs.org/${NC}"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18.x or higher."
    echo -e "${YELLOW}Visit: https://nodejs.org/${NC}"
    exit 1
fi

print_step "Checking npm installation..."
if command_exists npm; then
    print_success "npm found: $(npm --version) ✓"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

print_step "Checking Git installation..."
if command_exists git; then
    print_success "Git found: $(git --version | cut -d' ' -f3) ✓"
else
    print_warning "Git not found. Git is recommended for version control."
fi

# Step 2: Project Setup
print_header "PROJECT SETUP"

print_step "Verifying project structure..."
if [ -f "package.json" ]; then
    print_success "package.json found ✓"
else
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

if [ -f "next.config.js" ]; then
    print_success "Next.js configuration found ✓"
else
    print_warning "next.config.js not found. This might be expected."
fi

if [ -f "tsconfig.json" ]; then
    print_success "TypeScript configuration found ✓"
else
    print_warning "tsconfig.json not found. TypeScript setup might be incomplete."
fi

# Step 3: Clean up temporary files
print_header "REPOSITORY CLEANUP"

print_step "Cleaning up temporary files..."
cleanup_count=0

# Remove fix scripts
if ls fix_*.js 1> /dev/null 2>&1; then
    rm -f fix_*.js
    cleanup_count=$((cleanup_count + 1))
    print_success "Removed fix scripts"
fi

# Remove temporary files
temp_files=("temp.txt" "test.php" "tsconfig.tsbuildinfo")
for file in "${temp_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        cleanup_count=$((cleanup_count + 1))
        print_success "Removed $file"
    fi
done

# Remove duplicate files
duplicates=("src/pages/strategic-content-fixed.tsx" "src/pages/matrix.tsx.new")
for file in "${duplicates[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        cleanup_count=$((cleanup_count + 1))
        print_success "Removed duplicate: $(basename "$file")"
    fi
done

if [ $cleanup_count -eq 0 ]; then
    print_info "Repository already clean"
else
    print_success "Cleaned up $cleanup_count files"
fi

# Step 4: Dependencies Installation
print_header "DEPENDENCIES INSTALLATION"

print_step "Installing npm dependencies..."
print_info "This may take a few minutes..."

if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check for security vulnerabilities
print_step "Checking for security vulnerabilities..."
if npm audit --audit-level=high --silent; then
    print_success "No high-severity vulnerabilities found"
else
    print_warning "Security vulnerabilities found. Run 'npm audit fix' to resolve."
fi

# Step 5: Environment Configuration
print_header "ENVIRONMENT CONFIGURATION"

print_step "Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Created .env.local from .env.example"
        print_warning "Please edit .env.local with your actual API keys and configuration"
    else
        print_warning ".env.example not found. Creating basic .env.local..."
        cat > .env.local << EOL
# AIRWAVE CODEX Environment Configuration
# Generated by setup script

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-jwt-secret-here-please-change-this-to-something-secure
JWT_EXPIRY=7d

# Supabase (required for database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI Services (required for AI features)
OPENAI_API_KEY=sk-your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# Optional: Video Rendering
CREATOMATE_API_KEY=your-creatomate-key
EOL
        print_success "Created basic .env.local template"
    fi
else
    print_success ".env.local already exists"
fi

# Step 6: Code Quality Setup
print_header "CODE QUALITY SETUP"

print_step "Setting up Git hooks with Husky..."
if command_exists git && [ -d ".git" ]; then
    if npm run prepare 2>/dev/null; then
        print_success "Git hooks configured with Husky"
    else
        print_info "Husky setup skipped (not in git repository or command failed)"
    fi
else
    print_info "Git hooks setup skipped (not a git repository)"
fi

print_step "Running code formatting..."
if npm run format 2>/dev/null; then
    print_success "Code formatted successfully"
else
    print_warning "Code formatting failed. You may need to fix syntax errors first."
fi

print_step "Running linting checks..."
if npm run lint:fix 2>/dev/null; then
    print_success "Linting completed successfully"
else
    print_warning "Linting issues found. Run 'npm run lint:fix' manually to resolve."
fi

# Step 7: TypeScript Check
print_header "TYPESCRIPT VALIDATION"

print_step "Running TypeScript type checking..."
if npm run type-check 2>/dev/null; then
    print_success "TypeScript validation passed"
else
    print_warning "TypeScript errors found. Check your code for type issues."
fi

# Step 8: Build Test
print_header "BUILD VERIFICATION"

print_step "Testing production build..."
if npm run build 2>/dev/null; then
    print_success "Production build successful"
    # Clean up build files to save space
    rm -rf .next
    print_info "Cleaned up build files"
else
    print_warning "Production build failed. Development server should still work."
fi

# Step 9: Final Setup
print_header "FINAL SETUP"

# Create necessary directories
print_step "Creating necessary directories..."
directories=("public/uploads" "logs" ".next")
for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    fi
done

# Set up basic .gitignore additions if needed
if [ -f ".gitignore" ]; then
    if ! grep -q "# AIRWAVE specific" .gitignore; then
        echo "" >> .gitignore
        echo "# AIRWAVE specific" >> .gitignore
        echo ".env.local" >> .gitignore
        echo "logs/" >> .gitignore
        echo "public/uploads/" >> .gitignore
        echo "*.tsbuildinfo" >> .gitignore
        print_success "Updated .gitignore with AIRWAVE-specific entries"
    fi
fi

# Step 10: Success and Next Steps
print_header "SETUP COMPLETE!"

echo -e "${GREEN}🎉 AIRWAVE CODEX development environment is ready!${NC}\n"

echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo -e "1. ${YELLOW}Configure your environment variables:${NC}"
echo -e "   ${BLUE}nano .env.local${NC}"
echo -e "   ${GRAY}(Add your Supabase, OpenAI, and other API keys)${NC}\n"

echo -e "2. ${YELLOW}Start the development server:${NC}"
echo -e "   ${BLUE}npm run dev${NC}\n"

echo -e "3. ${YELLOW}Open your application:${NC}"
echo -e "   ${BLUE}http://localhost:3000${NC}\n"

echo -e "${CYAN}🛠️  USEFUL COMMANDS:${NC}"
echo -e "   ${BLUE}npm run dev${NC}          - Start development server"
echo -e "   ${BLUE}npm run build${NC}        - Build for production"
echo -e "   ${BLUE}npm run test${NC}         - Run tests"
echo -e "   ${BLUE}npm run lint:fix${NC}     - Fix linting issues"
echo -e "   ${BLUE}npm run format${NC}       - Format code"
echo -e "   ${BLUE}npm run validate${NC}     - Run all quality checks"
echo -e "   ${BLUE}npm run cleanup:repo${NC} - Clean up temporary files\n"

echo -e "${CYAN}📚 IMPORTANT FILES:${NC}"
echo -e "   ${BLUE}.env.local${NC}          - Environment configuration"
echo -e "   ${BLUE}package.json${NC}        - Dependencies and scripts"
echo -e "   ${BLUE}tsconfig.json${NC}       - TypeScript configuration"
echo -e "   ${BLUE}next.config.js${NC}      - Next.js configuration\n"

echo -e "${CYAN}🔧 TROUBLESHOOTING:${NC}"
echo -e "   • If you get TypeScript errors, run: ${BLUE}npm run type-check${NC}"
echo -e "   • If you get build errors, check your .env.local file"
echo -e "   • If pages don't load, ensure all dependencies are installed"
echo -e "   • For API issues, verify your Supabase configuration\n"

echo -e "${GREEN}Happy coding! 🚀${NC}"

# Optional: Open the project in default editor if available
if command_exists code; then
    read -p "Would you like to open the project in VS Code? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        code .
        print_success "Opened project in VS Code"
    fi
fi
