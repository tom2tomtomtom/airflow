#!/bin/bash

# AIrWAVE Client Creation Fix - Quick Implementation Script
# This script automatically applies the fixes for Supabase multiple instances and API errors

echo "🔧 AIrWAVE Client Creation Fix - Starting..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Create backup directory
echo "📦 Creating backups..."
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Backup original files
echo "💾 Backing up original files to $BACKUP_DIR..."
cp src/lib/supabase.ts $BACKUP_DIR/supabase.ts.backup 2>/dev/null || echo "  - src/lib/supabase.ts not found (ok)"
cp src/middleware/withAuth.ts $BACKUP_DIR/withAuth.ts.backup 2>/dev/null || echo "  - src/middleware/withAuth.ts not found (ok)"
cp src/contexts/SupabaseAuthContext.tsx $BACKUP_DIR/SupabaseAuthContext.tsx.backup 2>/dev/null || echo "  - src/contexts/SupabaseAuthContext.tsx not found (ok)"
cp src/pages/api/clients.ts $BACKUP_DIR/clients.ts.backup 2>/dev/null || echo "  - src/pages/api/clients.ts not found (ok)"

# Apply fixes
echo "🔄 Applying fixes..."

# 1. Update Supabase client
echo "  1. Updating Supabase client..."
cp src/lib/supabase-unified.ts src/lib/supabase.ts
echo "     ✅ src/lib/supabase.ts updated"

# 2. Remove duplicate client file
echo "  2. Removing duplicate client file..."
rm -f src/lib/supabase/client.ts
echo "     ✅ src/lib/supabase/client.ts removed"

# 3. Update withAuth middleware
echo "  3. Updating withAuth middleware..."
cp src/middleware/withAuth-fixed.ts src/middleware/withAuth.ts
echo "     ✅ src/middleware/withAuth.ts updated"

# 4. Update SupabaseAuthContext
echo "  4. Updating SupabaseAuthContext..."
cp src/contexts/SupabaseAuthContext-fixed.tsx src/contexts/SupabaseAuthContext.tsx
echo "     ✅ src/contexts/SupabaseAuthContext.tsx updated"

# 5. Update clients API
echo "  5. Updating clients API..."
cp src/pages/api/clients-fixed.ts src/pages/api/clients.ts
echo "     ✅ src/pages/api/clients.ts updated"

# 6. Create missing utils file if needed
echo "  6. Creating missing utilities..."
mkdir -p src/utils
if [ ! -f "src/utils/supabase-browser.ts" ]; then
    cat > src/utils/supabase-browser.ts << 'EOF'
// src/utils/supabase-browser.ts
import { getSupabaseClient } from '@/lib/supabase';

export const createSupabaseBrowserClient = () => {
  return getSupabaseClient();
};
EOF
    echo "     ✅ src/utils/supabase-browser.ts created"
else
    echo "     ⏭️ src/utils/supabase-browser.ts already exists"
fi

# Clean up the fixed files (they're now applied)
echo "🧹 Cleaning up temporary files..."
rm -f src/lib/supabase-unified.ts
rm -f src/middleware/withAuth-fixed.ts
rm -f src/contexts/SupabaseAuthContext-fixed.tsx
rm -f src/pages/api/clients-fixed.ts

echo ""
echo "🎉 Fixes applied successfully!"
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Open browser to: http://localhost:3000"
echo "3. Login with: tomh@redbaez.com / Wijlre2010"
echo "4. Test client creation: /clients → Add Client"
echo ""
echo "🔍 What to expect:"
echo "✅ No 'Multiple GoTrueClient instances' warning"
echo "✅ Successful login and navigation"
echo "✅ Client creation returns 201 instead of 500"
echo "✅ Detailed console logs for debugging"
echo ""
echo "📞 If issues persist, check CLIENT_CREATION_FIX_GUIDE.md"
echo ""
echo "🔄 To rollback, restore files from: $BACKUP_DIR"
echo ""
echo "================================================"
echo "✨ Happy coding!"
