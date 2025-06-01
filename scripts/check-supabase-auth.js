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

async function checkSupabaseAuth() {
  console.log('🔍 Checking Supabase Authentication Configuration...\n');

  try {
    // 1. Check if the user exists
    console.log('1. Checking user account for tomh@redbaez.com...');
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    const targetUser = userData.users.find(u => u.email === 'tomh@redbaez.com');
    
    if (!targetUser) {
      console.log('❌ User tomh@redbaez.com not found in auth.users');
      console.log('📋 Available users:');
      userData.users.slice(0, 5).forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
      return;
    }

    console.log('✅ User found:', {
      id: targetUser.id,
      email: targetUser.email,
      email_confirmed_at: targetUser.email_confirmed_at,
      created_at: targetUser.created_at,
      last_sign_in_at: targetUser.last_sign_in_at
    });

    // 2. Check user profile
    console.log('\n2. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      
      // Try to create profile if it doesn't exist
      if (profileError.code === 'PGRST116') {
        console.log('🔧 Profile not found, attempting to create...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: targetUser.id,
            email: targetUser.email,
            first_name: 'Tom',
            last_name: 'H',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating profile:', createError);
        } else {
          console.log('✅ Profile created:', newProfile);
        }
      }
    } else {
      console.log('✅ Profile found:', profile);
    }

    // 3. Check RLS policies on profiles table
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('pg_get_rls_policies', { table_name: 'profiles' })
      .single();

    if (policyError) {
      console.log('ℹ️ Could not fetch RLS policies directly, checking table info...');
      
      // Alternative: Check if RLS is enabled
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');

      if (tableError) {
        console.error('❌ Error checking table info:', tableError);
      } else {
        console.log('📋 Table info:', tableInfo);
      }
    } else {
      console.log('📋 RLS Policies:', policies);
    }

    // 4. Test authentication flow
    console.log('\n4. Testing authentication flow...');
    
    // Create a regular client (non-admin)
    const regularClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg');
    
    const { data: authData, error: authError } = await regularClient.auth.signInWithPassword({
      email: 'tomh@redbaez.com',
      password: 'Wijlre2010'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError);
    } else {
      console.log('✅ Authentication successful!');
      console.log('🔑 Session info:', {
        access_token: authData.session?.access_token ? 'Present' : 'Missing',
        refresh_token: authData.session?.refresh_token ? 'Present' : 'Missing',
        expires_at: authData.session?.expires_at,
        user_id: authData.user?.id
      });

      // 5. Test API access with the token
      console.log('\n5. Testing API access with token...');
      
      if (authData.session?.access_token) {
        // Test accessing profiles table with the user's token
        const authenticatedClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg', {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session.access_token}`
            }
          }
        });

        const { data: testData, error: testError } = await authenticatedClient
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id);

        if (testError) {
          console.error('❌ Authenticated API call failed:', testError);
        } else {
          console.log('✅ Authenticated API call successful:', testData);
        }

        // Test clients table access
        const { data: clientsData, error: clientsError } = await authenticatedClient
          .from('user_clients')
          .select('*')
          .eq('user_id', authData.user.id);

        if (clientsError) {
          console.error('❌ Clients API call failed:', clientsError);
        } else {
          console.log('✅ Clients API call successful:', clientsData);
        }
      }
    }

    // 6. Check database schema
    console.log('\n6. Checking database schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
    } else {
      console.log('📋 Available tables:', tables.map(t => t.table_name));
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkSupabaseAuth();