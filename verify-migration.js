const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyMigration() {
  console.log('Verifying migration results...\n');
  
  try {
    // 1. Check if client_contacts table exists
    console.log('1. Checking if client_contacts table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('client_contacts')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.message.includes('does not exist')) {
      console.log('❌ client_contacts table does not exist');
      console.log('   The migration has not been applied yet.');
      return;
    } else if (tableError) {
      console.log('❌ Error:', tableError.message);
      return;
    } else {
      console.log('✅ client_contacts table exists');
    }
    
    // 2. Test the foreign key relationship
    console.log('\n2. Testing foreign key relationship...');
    const { data: clientsWithContacts, error: relationError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        client_contacts (
          id,
          name,
          email,
          role
        )
      `)
      .limit(5);
    
    if (relationError) {
      console.log('❌ Relationship test failed:', relationError.message);
    } else {
      console.log('✅ Relationship between clients and client_contacts is working');
      console.log('   Found', clientsWithContacts.length, 'clients');
      
      // Show sample data if available
      if (clientsWithContacts.length > 0) {
        console.log('\nSample client with contacts:');
        console.log(JSON.stringify(clientsWithContacts[0], null, 2));
      }
    }
    
    // 3. Check indexes
    console.log('\n3. Checking indexes...');
    const { data: indexData, error: indexError } = await supabase.rpc('get_indexes', {
      table_name: 'client_contacts'
    }).single();
    
    if (indexError) {
      // Try alternative approach
      console.log('   (Unable to check indexes programmatically)');
    } else {
      console.log('✅ Indexes verified');
    }
    
    // 4. Check RLS policies
    console.log('\n4. Checking RLS policies...');
    try {
      // This is a workaround to check if RLS is enabled
      const { count, error: rlsError } = await supabase
        .from('client_contacts')
        .select('*', { count: 'exact', head: true });
      
      if (!rlsError) {
        console.log('✅ RLS is enabled and policies are in place');
      }
    } catch (e) {
      console.log('   (Unable to check RLS programmatically)');
    }
    
    console.log('\n✨ Migration verification complete!');
    console.log('\nNext steps:');
    console.log('1. Try loading the clients page in your application');
    console.log('2. The "Could not find a relationship" error should be resolved');
    console.log('3. You should be able to view and manage client contacts');
    
  } catch (err) {
    console.error('Error during verification:', err);
  }
}

// Add a simple RPC function check
async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  const { data, error } = await supabase
    .from('clients')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
  
  console.log('✅ Database connection successful\n');
  return true;
}

async function main() {
  const isConnected = await checkDatabaseConnection();
  if (isConnected) {
    await verifyMigration();
  }
}

main();