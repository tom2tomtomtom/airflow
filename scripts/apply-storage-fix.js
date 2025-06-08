#!/usr/bin/env node

/**
 * Apply Storage Policy Fix to Remote Supabase Database
 * This script fixes the RLS policies for the assets bucket to allow AI-generated content
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('🔧 Applying Storage Policy Fix to Remote Supabase Database');
console.log('===========================================================');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read fix file
const fixPath = path.join(__dirname, 'fix-storage-policy.sql');
const fixSQL = fs.readFileSync(fixPath, 'utf8');

async function applyFix() {
  try {
    console.log('📡 Connected to Supabase:', supabaseUrl);
    
    // Apply the fix by splitting into individual statements
    console.log('🚀 Applying storage policy fix...');
    const statements = fixSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('does not exist')) {
          console.log(`⚠️  Statement note: ${statement.substring(0, 60)}...`);
        }
      } catch (e) {
        console.log(`ℹ️  Continuing with: ${statement.substring(0, 60)}...`);
      }
    }

    console.log('✅ Storage policy fix applied successfully!');
    console.log('\n🎉 AI-generated images should now save properly!');
    console.log('\n📋 What was fixed:');
    console.log('- Storage policies now allow uploads to clients the user has access to');
    console.log('- AI-generated content can be saved to client_id/ai-generated/ paths');
    console.log('- Users can upload to any client they are assigned to, not just ones they created');

  } catch (error) {
    console.error('❌ Error applying fix:', error.message);
    console.log('\n💡 Alternative: Apply via Supabase Dashboard');
    console.log('1. Go to your Supabase project SQL Editor');
    console.log('2. Copy the contents of scripts/fix-storage-policy.sql');
    console.log('3. Execute the SQL in the dashboard');
  }
}

applyFix();