#!/bin/bash

# ====================================================================
# AIRWAVE NETLIFY ENVIRONMENT SETUP SCRIPT
# This script helps you configure all necessary environment variables
# for deploying AIrWAVE to Netlify with Supabase integration
# ====================================================================

set -e

echo "🚀 AIrWAVE Netlify Environment Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the root of your AIrWAVE project"
    exit 1
fi

print_info "This script will guide you through setting up environment variables for Netlify deployment."
echo ""

# ====================================================================
# GATHER SUPABASE INFORMATION
# ====================================================================

print_info "First, let's gather your Supabase project information."
echo "You can find these values in your Supabase Dashboard > Settings > API"
echo ""

# Supabase URL
while true; do
    read -p "Enter your Supabase Project URL (https://your-project.supabase.co): " SUPABASE_URL
    if [[ $SUPABASE_URL =~ ^https://.*\.supabase\.co$ ]]; then
        break
    else
        print_error "Please enter a valid Supabase URL (https://your-project.supabase.co)"
    fi
done

# Supabase Anon Key
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
if [ -z "$SUPABASE_ANON_KEY" ]; then
    print_error "Anon key is required"
    exit 1
fi

# Supabase Service Role Key
read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_KEY
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    print_error "Service role key is required"
    exit 1
fi

# ====================================================================
# GENERATE JWT SECRET
# ====================================================================

print_info "Generating a secure JWT secret..."
JWT_SECRET=$(openssl rand -hex 32)
print_success "JWT secret generated: ${JWT_SECRET:0:8}..."

# ====================================================================
# GATHER OPTIONAL API KEYS
# ====================================================================

echo ""
print_info "Now let's configure optional AI service API keys."
print_warning "You can skip these by pressing Enter, but some features may not work."
echo ""

# OpenAI API Key
read -p "Enter your OpenAI API Key (optional, for AI generation): " OPENAI_API_KEY

# Creatomate API Key
read -p "Enter your Creatomate API Key (optional, for video generation): " CREATOMATE_API_KEY

# ElevenLabs API Key
read -p "Enter your ElevenLabs API Key (optional, for voice generation): " ELEVENLABS_API_KEY

# Runway API Key
read -p "Enter your Runway API Key (optional, for video generation): " RUNWAY_API_KEY

# ====================================================================
# EMAIL CONFIGURATION
# ====================================================================

echo ""
print_info "Email configuration (optional, for notifications and user management):"
echo ""

read -p "SMTP Host (e.g., smtp.resend.com): " SMTP_HOST
read -p "SMTP Port (e.g., 587): " SMTP_PORT
read -p "SMTP Username: " SMTP_USER
read -s -p "SMTP Password: " SMTP_PASS
echo ""
read -p "From Email Address: " SMTP_FROM

# ====================================================================
# MONITORING CONFIGURATION
# ====================================================================

echo ""
print_info "Monitoring configuration (optional):"
echo ""

read -p "Sentry DSN (optional, for error tracking): " SENTRY_DSN

# ====================================================================
# FEATURE FLAGS
# ====================================================================

echo ""
print_info "Feature flags configuration:"
echo ""

# Determine feature flags based on API keys
ENABLE_AI_FEATURES="false"
ENABLE_VIDEO_GENERATION="false"
ENABLE_SOCIAL_PUBLISHING="false"

if [ ! -z "$OPENAI_API_KEY" ]; then
    ENABLE_AI_FEATURES="true"
fi

if [ ! -z "$CREATOMATE_API_KEY" ] || [ ! -z "$RUNWAY_API_KEY" ]; then
    ENABLE_VIDEO_GENERATION="true"
fi

print_info "Based on your API keys, setting feature flags:"
echo "  - AI Features: $ENABLE_AI_FEATURES"
echo "  - Video Generation: $ENABLE_VIDEO_GENERATION"
echo "  - Social Publishing: $ENABLE_SOCIAL_PUBLISHING"

# ====================================================================
# GENERATE NETLIFY ENVIRONMENT VARIABLES
# ====================================================================

echo ""
print_info "Generating environment variables for Netlify..."
echo ""

ENV_FILE="netlify-env-vars.txt"

cat > "$ENV_FILE" << EOF
# ====================================================================
# AIRWAVE NETLIFY ENVIRONMENT VARIABLES
# Copy these values to your Netlify site's environment variables
# Site Settings > Environment Variables
# ====================================================================

# Core Application Settings
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-netlify-site.netlify.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Authentication & Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Storage Configuration
STORAGE_BUCKET=airwave-assets
MAX_FILE_SIZE=52428800

# AI Services (Optional)
EOF

if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> "$ENV_FILE"
fi

if [ ! -z "$CREATOMATE_API_KEY" ]; then
    echo "CREATOMATE_API_KEY=$CREATOMATE_API_KEY" >> "$ENV_FILE"
fi

if [ ! -z "$ELEVENLABS_API_KEY" ]; then
    echo "ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY" >> "$ENV_FILE"
fi

if [ ! -z "$RUNWAY_API_KEY" ]; then
    echo "RUNWAY_API_KEY=$RUNWAY_API_KEY" >> "$ENV_FILE"
fi

cat >> "$ENV_FILE" << EOF

# Email Configuration (Optional)
EOF

if [ ! -z "$SMTP_HOST" ]; then
    cat >> "$ENV_FILE" << EOF
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM
EOF
fi

cat >> "$ENV_FILE" << EOF

# Monitoring (Optional)
EOF

if [ ! -z "$SENTRY_DSN" ]; then
    echo "SENTRY_DSN=$SENTRY_DSN" >> "$ENV_FILE"
    echo "SENTRY_ENVIRONMENT=production" >> "$ENV_FILE"
fi

cat >> "$ENV_FILE" << EOF

# Feature Flags
ENABLE_AI_FEATURES=$ENABLE_AI_FEATURES
ENABLE_VIDEO_GENERATION=$ENABLE_VIDEO_GENERATION
ENABLE_SOCIAL_PUBLISHING=$ENABLE_SOCIAL_PUBLISHING

# Security Headers
ALLOWED_ORIGINS=https://your-domain.com,https://your-netlify-site.netlify.app

# ====================================================================
# IMPORTANT NOTES:
# 
# 1. Replace 'your-netlify-site.netlify.app' with your actual Netlify URL
# 2. Update ALLOWED_ORIGINS with your actual domain(s)
# 3. Never commit these values to version control
# 4. Keep your Service Role Key secure - it has admin access
# 5. Rotate API keys regularly for security
# ====================================================================
EOF

print_success "Environment variables saved to: $ENV_FILE"

# ====================================================================
# GENERATE LOCAL DEVELOPMENT FILE
# ====================================================================

print_info "Generating local development environment file..."

LOCAL_ENV_FILE=".env.local"

cat > "$LOCAL_ENV_FILE" << EOF
# ====================================================================
# AIRWAVE LOCAL DEVELOPMENT ENVIRONMENT
# This file is for local development only
# DO NOT COMMIT THIS FILE TO VERSION CONTROL
# ====================================================================

# Core Application Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Authentication & Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Storage Configuration
STORAGE_BUCKET=airwave-assets
MAX_FILE_SIZE=52428800
EOF

if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> "$LOCAL_ENV_FILE"
fi

if [ ! -z "$CREATOMATE_API_KEY" ]; then
    echo "CREATOMATE_API_KEY=$CREATOMATE_API_KEY" >> "$LOCAL_ENV_FILE"
fi

if [ ! -z "$ELEVENLABS_API_KEY" ]; then
    echo "ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY" >> "$LOCAL_ENV_FILE"
fi

if [ ! -z "$RUNWAY_API_KEY" ]; then
    echo "RUNWAY_API_KEY=$RUNWAY_API_KEY" >> "$LOCAL_ENV_FILE"
fi

if [ ! -z "$SMTP_HOST" ]; then
    cat >> "$LOCAL_ENV_FILE" << EOF

# Email Configuration
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM
EOF
fi

if [ ! -z "$SENTRY_DSN" ]; then
    cat >> "$LOCAL_ENV_FILE" << EOF

# Monitoring
SENTRY_DSN=$SENTRY_DSN
SENTRY_ENVIRONMENT=development
EOF
fi

cat >> "$LOCAL_ENV_FILE" << EOF

# Feature Flags
ENABLE_AI_FEATURES=$ENABLE_AI_FEATURES
ENABLE_VIDEO_GENERATION=$ENABLE_VIDEO_GENERATION
ENABLE_SOCIAL_PUBLISHING=$ENABLE_SOCIAL_PUBLISHING

# Development Security
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF

print_success "Local environment file saved to: $LOCAL_ENV_FILE"

# ====================================================================
# UPDATE GITIGNORE
# ====================================================================

print_info "Updating .gitignore to exclude sensitive files..."

# Add to .gitignore if not already present
if ! grep -q "netlify-env-vars.txt" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Environment configuration files" >> .gitignore
    echo "netlify-env-vars.txt" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env*.local" >> .gitignore
fi

print_success "Updated .gitignore"

# ====================================================================
# GENERATE NETLIFY CLI COMMANDS
# ====================================================================

print_info "Generating Netlify CLI commands for easy setup..."

NETLIFY_COMMANDS_FILE="netlify-setup-commands.sh"

cat > "$NETLIFY_COMMANDS_FILE" << EOF
#!/bin/bash
# ====================================================================
# NETLIFY CLI COMMANDS FOR AIRWAVE SETUP
# Run these commands if you have Netlify CLI installed
# ====================================================================

# Install Netlify CLI if not installed
# npm install -g netlify-cli

# Login to Netlify
# netlify login

# Link your site (run from project root)
# netlify link

# Set environment variables (replace with your actual site ID)
echo "Setting up environment variables..."

netlify env:set NODE_ENV "production"
netlify env:set NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_KEY"
netlify env:set JWT_SECRET "$JWT_SECRET"
netlify env:set JWT_EXPIRY "7d"
netlify env:set REFRESH_TOKEN_EXPIRY "30d"
netlify env:set STORAGE_BUCKET "airwave-assets"
netlify env:set MAX_FILE_SIZE "52428800"
netlify env:set ENABLE_AI_FEATURES "$ENABLE_AI_FEATURES"
netlify env:set ENABLE_VIDEO_GENERATION "$ENABLE_VIDEO_GENERATION"
netlify env:set ENABLE_SOCIAL_PUBLISHING "$ENABLE_SOCIAL_PUBLISHING"
EOF

if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "netlify env:set OPENAI_API_KEY \"$OPENAI_API_KEY\"" >> "$NETLIFY_COMMANDS_FILE"
fi

if [ ! -z "$CREATOMATE_API_KEY" ]; then
    echo "netlify env:set CREATOMATE_API_KEY \"$CREATOMATE_API_KEY\"" >> "$NETLIFY_COMMANDS_FILE"
fi

if [ ! -z "$ELEVENLABS_API_KEY" ]; then
    echo "netlify env:set ELEVENLABS_API_KEY \"$ELEVENLABS_API_KEY\"" >> "$NETLIFY_COMMANDS_FILE"
fi

if [ ! -z "$RUNWAY_API_KEY" ]; then
    echo "netlify env:set RUNWAY_API_KEY \"$RUNWAY_API_KEY\"" >> "$NETLIFY_COMMANDS_FILE"
fi

if [ ! -z "$SMTP_HOST" ]; then
    cat >> "$NETLIFY_COMMANDS_FILE" << EOF
netlify env:set SMTP_HOST "$SMTP_HOST"
netlify env:set SMTP_PORT "$SMTP_PORT"
netlify env:set SMTP_USER "$SMTP_USER"
netlify env:set SMTP_PASS "$SMTP_PASS"
netlify env:set SMTP_FROM "$SMTP_FROM"
EOF
fi

if [ ! -z "$SENTRY_DSN" ]; then
    cat >> "$NETLIFY_COMMANDS_FILE" << EOF
netlify env:set SENTRY_DSN "$SENTRY_DSN"
netlify env:set SENTRY_ENVIRONMENT "production"
EOF
fi

cat >> "$NETLIFY_COMMANDS_FILE" << EOF

echo "✅ All environment variables set!"
echo "🚀 You can now deploy with: netlify deploy --prod"
EOF

chmod +x "$NETLIFY_COMMANDS_FILE"
print_success "Netlify CLI commands saved to: $NETLIFY_COMMANDS_FILE"

# ====================================================================
# FINAL INSTRUCTIONS
# ====================================================================

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_success "Generated files:"
echo "  📄 $ENV_FILE - Copy these to Netlify environment variables"
echo "  🔧 $LOCAL_ENV_FILE - For local development"
echo "  🚀 $NETLIFY_COMMANDS_FILE - Netlify CLI commands"
echo ""
print_info "Next Steps:"
echo ""
echo "1. 📋 Copy environment variables to Netlify:"
echo "   - Go to your Netlify site dashboard"
echo "   - Navigate to Site Settings > Environment Variables"
echo "   - Add each variable from $ENV_FILE"
echo ""
echo "2. 🗄️  Set up your Supabase database:"
echo "   - Go to your Supabase Dashboard > SQL Editor"
echo "   - Run the script: scripts/setup-supabase-complete.sql"
echo ""
echo "3. 🚀 Deploy to Netlify:"
echo "   - Push your changes to your Git repository"
echo "   - Netlify will automatically build and deploy"
echo ""
echo "4. 🔗 Update your domain:"
echo "   - Replace 'your-netlify-site.netlify.app' in NEXT_PUBLIC_API_URL"
echo "   - Update ALLOWED_ORIGINS with your actual domain"
echo ""
print_warning "Security Reminders:"
echo "  🔒 Never commit .env.local or netlify-env-vars.txt to version control"
echo "  🔑 Keep your Service Role Key secure - it has admin access to your database"
echo "  🔄 Rotate API keys regularly for security"
echo ""
print_success "Your AIrWAVE application is ready for production deployment! 🚀"