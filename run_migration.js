const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Adding brand_guidelines column to clients table...');
  
  try {
    // Add the brand_guidelines column
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add brand guidelines column to clients table
        ALTER TABLE clients 
        ADD COLUMN IF NOT EXISTS brand_guidelines JSONB DEFAULT '{}' NOT NULL;

        -- Add comment to describe the column
        COMMENT ON COLUMN clients.brand_guidelines IS 'JSON object containing brand guidelines including colors, fonts, logos, and style preferences';

        -- Create an index for better query performance on brand guidelines
        CREATE INDEX IF NOT EXISTS idx_clients_brand_guidelines ON clients USING GIN (brand_guidelines);
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('   • Added brand_guidelines column to clients table');
    console.log('   • Created GIN index for better query performance');
    console.log('   • Added column documentation');

    // Verify the column was added
    const { data: columns, error: verifyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'clients' 
          AND column_name = 'brand_guidelines';
        `
      });

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Column verification successful');
      console.log('   Column details:', columns);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

runMigration();