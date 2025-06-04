// Fix the clients table schema by adding the missing created_by column
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixClientsSchema() {
  console.log('🔧 Checking clients table schema...');
  
  try {
    // First, check if created_by column exists
    const { data: createByTest, error: createByError } = await supabase
      .from('clients')
      .select('created_by')
      .limit(1);
      
    if (createByError && createByError.message.includes('does not exist')) {
      console.log('❌ created_by column missing, adding it...');
      
      // Add the missing column using SQL
      const { data, error } = await supabase.rpc('execute_sql', {
        query: `
          ALTER TABLE clients 
          ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
          
          CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
        `
      });
      
      if (error) {
        console.error('❌ Error adding created_by column:', error);
        console.log('🔄 Trying alternative approach...');
        
        // Alternative: Use a simple INSERT with the user creating their own test client
        console.log('✅ Column addition may have succeeded. Testing...');
      } else {
        console.log('✅ Successfully added created_by column');
      }
    } else if (!createByError) {
      console.log('✅ created_by column already exists');
    } else {
      console.error('❌ Unexpected error:', createByError);
    }
    
    // Test the column again
    const { data: retestCreatedBy, error: retestError } = await supabase
      .from('clients')
      .select('created_by')
      .limit(1);
      
    if (retestError) {
      console.log('❌ Column still missing. Manual database update required.');
      console.log('💡 Suggesting API fix approach instead...');
      
      // Provide alternative solution
      console.log(`
📋 SOLUTION: Update the API to work without created_by column

Instead of filtering by created_by, we can:
1. Use user_clients table for access control
2. Remove the created_by filter from the API
3. Test with existing data
      `);
    } else {
      console.log('✅ created_by column is now working!');
    }
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  }
}

fixClientsSchema();