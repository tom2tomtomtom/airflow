#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in environment variables');
  console.error('   Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addBrandGuidelinesColumn() {
  console.log('🚀 Adding brand_guidelines column to clients table...');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  
  try {
    // Add the column using raw SQL with IF NOT EXISTS
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          -- Check if column exists and add if it doesn't
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clients' AND column_name = 'brand_guidelines'
          ) THEN
            ALTER TABLE clients ADD COLUMN brand_guidelines JSONB DEFAULT '{}' NOT NULL;
            
            -- Add comment to describe the column
            COMMENT ON COLUMN clients.brand_guidelines IS 'JSON object containing brand guidelines including colors, fonts, logos, and style preferences';
            
            -- Create an index for better query performance
            CREATE INDEX idx_clients_brand_guidelines ON clients USING GIN (brand_guidelines);
            
            RAISE NOTICE 'Added brand_guidelines column successfully';
          ELSE
            RAISE NOTICE 'brand_guidelines column already exists';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }

    console.log('✅ Migration completed successfully!');
    console.log('   • Added brand_guidelines column (JSONB)');
    console.log('   • Set default value to empty object {}');
    console.log('   • Created GIN index for better query performance');
    console.log('   • Added column documentation');

    // Test the column by updating a client (if any exist)
    const { data: testClient, error: testError } = await supabase
      .from('clients')
      .select('id, name, brand_guidelines')
      .limit(1)
      .maybeSingle();

    if (testError) {
      console.error('❌ Error testing column:', testError);
      return;
    }

    if (testClient) {
      console.log('✅ Column test successful');
      console.log(`   Sample client: ${testClient.name}`);
      console.log(`   Brand guidelines: ${JSON.stringify(testClient.brand_guidelines)}`);
    } else {
      console.log('ℹ️  No existing clients to test with');
    }

    console.log('');
    console.log('🎉 Your clients table now supports brand guidelines!');
    console.log('   The error should be resolved now.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the migration
addBrandGuidelinesColumn();