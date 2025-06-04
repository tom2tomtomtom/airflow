// Simple test to check what's causing the 500 error
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Database connection error:', error);
      return;
    }
    console.log('✅ Database connection working');
    
    // Test profiles table schema
    console.log('Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('Sample profile schema:', profiles[0] ? Object.keys(profiles[0]) : 'No profiles found');
    }
    
    // Test clients table
    console.log('Testing clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.error('Clients table error:', clientsError);
    } else {
      console.log('✅ Clients table accessible');
      console.log('Sample client schema:', clients[0] ? Object.keys(clients[0]) : 'No clients found');
    }
    
    // Check if created_by column exists
    console.log('Testing clients table schema...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('clients')
      .select('id, created_at')
      .limit(1);
    
    if (schemaTest !== null) {
      console.log('✅ Basic client columns work');
      
      // Test with created_by to see the exact error
      const { data: createByTest, error: createByError } = await supabase
        .from('clients')
        .select('created_by')
        .limit(1);
        
      if (createByError) {
        console.log('❌ created_by column error:', createByError.message);
        console.log('Hint:', createByError.hint);
      } else {
        console.log('✅ created_by column exists');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabase();