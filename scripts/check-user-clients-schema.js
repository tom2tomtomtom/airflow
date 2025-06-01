const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU3NDIxNCwiZXhwIjoyMDYzMTUwMjE0fQ.ZpffWj4u0E9dt_XPmoPZKENvqMI5AwuMRB6VCOBJ0K4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSchema() {
  console.log('🔍 Checking user_clients table schema...\n');

  try {
    // Try to fetch one record to see the structure
    const { data, error } = await supabase
      .from('user_clients')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error fetching user_clients:', error);
      
      // Try to see if table exists at all
      const { data: tableExists, error: tableError } = await supabase
        .from('user_clients')
        .select('count(*)')
        .single();
      
      if (tableError) {
        console.log('❌ Table might not exist:', tableError);
      }
    } else {
      console.log('✅ user_clients table structure:');
      if (data && data.length > 0) {
        console.log('📋 Sample record:', data[0]);
        console.log('🗂️ Available columns:', Object.keys(data[0]));
      } else {
        console.log('📋 Table exists but is empty');
        
        // Try to insert a minimal record to see what columns are required
        console.log('\n🧪 Testing minimal insert...');
        const { data: insertData, error: insertError } = await supabase
          .from('user_clients')
          .insert({
            user_id: '354d56b0-440b-403e-b207-7038fb8b00d7',
            client_id: 'b962c2f4-b7e4-429d-bfe6-11f35a252223'
          })
          .select();

        if (insertError) {
          console.log('❌ Minimal insert failed:', insertError);
          
          // Try with role
          console.log('\n🧪 Testing with role...');
          const { data: insertData2, error: insertError2 } = await supabase
            .from('user_clients')
            .insert({
              user_id: '354d56b0-440b-403e-b207-7038fb8b00d7',
              client_id: 'b962c2f4-b7e4-429d-bfe6-11f35a252223',
              role: 'admin'
            })
            .select();

          if (insertError2) {
            console.log('❌ Insert with role failed:', insertError2);
          } else {
            console.log('✅ Insert successful:', insertData2);
          }
        } else {
          console.log('✅ Minimal insert successful:', insertData);
        }
      }
    }

    // Also check clients table structure
    console.log('\n🔍 Checking clients table...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (clientsError) {
      console.log('❌ Error fetching clients:', clientsError);
    } else {
      if (clientsData && clientsData.length > 0) {
        console.log('✅ clients table sample:', clientsData[0]);
      } else {
        console.log('📋 clients table exists but is empty');
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkSchema();