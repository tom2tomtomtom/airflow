#!/bin/bash

# AIrWAVE Supabase Setup Script
# This script helps you set up the environment for real Supabase data integration

echo "🚀 AIrWAVE Supabase Setup"
echo "========================"

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Creating backup..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy example env file
echo "📝 Creating .env.local from .env.example..."
cp .env.example .env.local

# Function to prompt for environment variables
prompt_for_var() {
    local var_name=$1
    local description=$2
    local current_value=$(grep "^$var_name=" .env.local | cut -d'=' -f2)
    
    echo ""
    echo "📌 $description"
    echo "Variable: $var_name"
    if [ ! -z "$current_value" ]; then
        echo "Current value: $current_value"
    fi
    read -p "Enter new value (press Enter to keep current): " new_value
    
    if [ ! -z "$new_value" ]; then
        # Escape special characters for sed
        escaped_value=$(echo "$new_value" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -i.bak "s|^$var_name=.*|$var_name=$escaped_value|" .env.local
    fi
}

echo ""
echo "🔧 Let's configure your Supabase connection..."
echo ""

# Set demo mode to false
sed -i.bak "s|^NEXT_PUBLIC_DEMO_MODE=.*|NEXT_PUBLIC_DEMO_MODE=false|" .env.local
echo "✅ Demo mode disabled"

# Prompt for Supabase credentials
prompt_for_var "NEXT_PUBLIC_SUPABASE_URL" "Your Supabase project URL (found in Settings > API)"
prompt_for_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Your Supabase anon/public key (found in Settings > API)"
prompt_for_var "SUPABASE_SERVICE_ROLE_KEY" "Your Supabase service role key (found in Settings > API)"

# Generate JWT secret if not exists
current_jwt=$(grep "^JWT_SECRET=" .env.local | cut -d'=' -f2)
if [ -z "$current_jwt" ] || [ "$current_jwt" = "your-secure-jwt-secret-at-least-32-characters" ]; then
    echo ""
    echo "🔐 Generating secure JWT secret..."
    jwt_secret=$(openssl rand -base64 32)
    sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env.local
    echo "✅ JWT secret generated"
fi

# Optional: Configure other services
echo ""
read -p "Would you like to configure optional services (OpenAI, Email, etc.)? (y/N): " configure_optional
if [[ $configure_optional =~ ^[Yy]$ ]]; then
    prompt_for_var "OPENAI_API_KEY" "OpenAI API key for AI features (optional)"
    prompt_for_var "CREATOMATE_API_KEY" "Creatomate API key for video generation (optional)"
fi

# Clean up backup files
rm -f .env.local.bak

echo ""
echo "✅ Environment configuration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run the database migrations in your Supabase project:"
echo "   - Go to your Supabase Dashboard > SQL Editor"
echo "   - Run the migrations in order:"
echo "     • supabase/migrations/001_initial_schema.sql"
echo "     • supabase/migrations/002_production_optimization.sql"
echo ""
echo "2. Create the storage bucket:"
echo "   - Go to Storage in your Supabase Dashboard"
echo "   - Create a new bucket called 'assets'"
echo "   - Make it public if you want direct asset access"
echo ""
echo "3. Test the connection:"
echo "   npm run test:supabase"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "Happy coding! 🎉"
