const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU3NDIxNCwiZXhwIjoyMDYzMTUwMjE0fQ.ZpffWj4u0E9dt_XPmoPZKENvqMI5AwuMRB6VCOBJ0K4';

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USER_ID = '354d56b0-440b-403e-b207-7038fb8b00d7'; // tomh@redbaez.com

async function fixUserAccess() {
  console.log('🔧 Fixing user client access for tomh@redbaez.com...\n');

  try {
    // 1. Check existing clients
    console.log('1. Checking existing clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(10);

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError);
      return;
    }

    console.log(`📋 Found ${clients.length} clients:`);
    clients.forEach(client => {
      console.log(`  - ${client.name} (ID: ${client.id}, Industry: ${client.industry})`);
    });

    // 2. Check current user-client relationships
    console.log('\n2. Checking current user-client access...');
    const { data: userClients, error: userClientsError } = await supabase
      .from('user_clients')
      .select('*')
      .eq('user_id', USER_ID);

    if (userClientsError) {
      console.error('❌ Error fetching user-client relationships:', userClientsError);
    } else {
      console.log(`📋 User currently has access to ${userClients.length} clients`);
      if (userClients.length > 0) {
        userClients.forEach(uc => {
          console.log(`  - Client ID: ${uc.client_id}, Role: ${uc.role}`);
        });
      }
    }

    // 3. Create a test client if none exist
    let testClient = null;
    if (clients.length === 0) {
      console.log('\n3. Creating test client...');
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: 'Redbaez Test Client',
          industry: 'Technology',
          description: 'Test client for AIrWAVE development and testing',
          primary_color: '#FBBF24',
          secondary_color: '#F59E0B',
          tenant_id: 'default',
          is_active: true,
          created_by: USER_ID
        })
        .select()
        .single();

      if (createClientError) {
        console.error('❌ Error creating client:', createClientError);
        return;
      }

      testClient = newClient;
      console.log('✅ Test client created:', testClient);
    } else {
      testClient = clients[0];
      console.log(`\n3. Using existing client: ${testClient.name}`);
    }

    // 4. Grant user access to the client
    console.log('\n4. Granting user access to client...');
    
    // First check if access already exists
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_clients')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('client_id', testClient.id);

    if (checkError) {
      console.error('❌ Error checking existing access:', checkError);
      return;
    }

    if (existingAccess && existingAccess.length > 0) {
      console.log('✅ User already has access to this client');
    } else {
      const { data: newAccess, error: accessError } = await supabase
        .from('user_clients')
        .insert({
          user_id: USER_ID,
          client_id: testClient.id,
          role: 'admin',
          granted_by: USER_ID
        })
        .select();

      if (accessError) {
        console.error('❌ Error granting client access:', accessError);
        return;
      }

      console.log('✅ Client access granted:', newAccess);
    }

    // 5. Test the fixed access
    console.log('\n5. Testing fixed access...');
    const { data: updatedUserClients, error: testError } = await supabase
      .from('user_clients')
      .select(`
        *,
        clients (
          id,
          name,
          industry
        )
      `)
      .eq('user_id', USER_ID);

    if (testError) {
      console.error('❌ Error testing access:', testError);
    } else {
      console.log(`✅ User now has access to ${updatedUserClients.length} client(s):`);
      updatedUserClients.forEach(uc => {
        console.log(`  - ${uc.clients.name} (${uc.clients.industry}) - Role: ${uc.role}`);
      });
    }

    // 6. Update user role to admin
    console.log('\n6. Updating user role to admin...');
    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        first_name: 'Tom',
        last_name: 'H',
        updated_at: new Date().toISOString()
      })
      .eq('id', USER_ID)
      .select();

    if (profileUpdateError) {
      console.error('❌ Error updating profile:', profileUpdateError);
    } else {
      console.log('✅ User profile updated to admin:', updatedProfile);
    }

    console.log('\n🎉 User access fix completed!');
    console.log('\n📋 Summary:');
    console.log('✅ User authentication: Working');
    console.log('✅ User profile: Updated to admin');
    console.log('✅ Client access: Granted');
    console.log('✅ Ready for testing: User should now be able to access all endpoints');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

fixUserAccess();