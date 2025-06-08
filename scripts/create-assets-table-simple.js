#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAssetsTable() {
  try {
    console.log('🔧 Creating assets table...');
    
    // Try to create the basic table first
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.assets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text', 'voice')),
          url TEXT NOT NULL,
          thumbnail_url TEXT,
          description TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          client_id UUID NOT NULL,
          created_by UUID NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          size_bytes BIGINT,
          mime_type TEXT,
          duration_seconds INTEGER,
          width INTEGER,
          height INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;
    
    // Since we can't execute raw SQL directly, let's try a different approach
    // Let's test if the table exists by trying to query it
    console.log('🔍 Checking if assets table exists...');
    
    const { data, error } = await supabase
      .from('assets')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('❌ Assets table does not exist');
      console.log('\n📋 Please create the assets table manually in Supabase:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to the SQL editor');
      console.log('3. Run the following SQL:');
      console.log('\n' + '='.repeat(80));
      console.log(createTableSQL);
      
      // Add indexes
      console.log(`
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_assets_client_id ON public.assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON public.assets USING GIN(tags);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view assets from their clients" ON public.assets
    FOR SELECT
    USING (
        client_id IN (
            SELECT client_id 
            FROM public.user_clients 
            WHERE user_id = auth.uid()
        )
    );
      `);
      console.log('='.repeat(80));
      
      return false;
    } else if (error) {
      console.error('❌ Unexpected error:', error.message);
      return false;
    } else {
      console.log('✅ Assets table already exists!');
      console.log(`📊 Current assets count: ${data.length}`);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testAssetsAPI() {
  console.log('\n🧪 Testing assets API...');
  
  // Test if we can create an asset via the API
  console.log('Testing asset creation via API...');
  
  // This would be done via HTTP request in a real test
  console.log('💡 To test the API:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to /assets page');
  console.log('3. Try creating a new asset');
  console.log('4. Check the server logs for any errors');
}

// Run the setup
createAssetsTable().then(success => {
  if (success) {
    testAssetsAPI();
  }
  console.log('\n🎯 Next steps:');
  console.log('1. Create the assets table using the SQL above (if needed)');
  console.log('2. Test the assets page in your application');
  console.log('3. Upload some test assets to verify functionality');
});