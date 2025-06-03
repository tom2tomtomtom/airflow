const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease ensure these are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📄 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250602_fix_client_contacts_relationship.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Applying migration to Supabase...');
    console.log('⚠️  Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set in your environment');
    
    // Note: Supabase doesn't allow executing raw SQL through the JS client for security
    // You'll need to run this migration through the Supabase dashboard
    console.log('\n📋 Migration content to copy and run in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new');
    console.log('\n' + '='.repeat(60));
    console.log(migrationSQL);
    console.log('='.repeat(60) + '\n');
    
    console.log('ℹ️  Please:');
    console.log('   1. Copy the SQL above');
    console.log('   2. Go to your Supabase dashboard SQL editor');
    console.log('   3. Paste and run the SQL');
    console.log('   4. Verify the migration was successful');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();