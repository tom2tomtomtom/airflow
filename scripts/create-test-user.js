#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  const email = 'tomh@rebaez.com';
  const password = 'Wijlre2010';
  const name = 'Tom H';

  console.log('🔍 Checking if user exists...');
  
  try {
    // Check if user already exists
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (getUserError && getUserError.message !== 'User not found') {
      console.error('❌ Error checking user:', getUserError.message);
      return;
    }
    
    if (existingUser?.user) {
      console.log('✅ User already exists:', email);
      console.log('   ID:', existingUser.user.id);
      console.log('   Created:', new Date(existingUser.user.created_at).toLocaleString());
      
      // Update password
      console.log('🔄 Updating password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        { password }
      );
      
      if (updateError) {
        console.error('❌ Failed to update password:', updateError.message);
      } else {
        console.log('✅ Password updated successfully');
      }
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUser.user.id)
        .single();
        
      if (profileError && profileError.code === 'PGRST116') {
        console.log('📝 Creating user profile...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.user.id,
            email: email,
            full_name: name,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (createProfileError) {
          console.error('❌ Failed to create profile:', createProfileError.message);
        } else {
          console.log('✅ Profile created successfully');
        }
      } else if (profile) {
        console.log('✅ Profile already exists');
      }
      
      return;
    }

    console.log('📝 Creating new user...');
    
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin',
      },
    });

    if (createError) {
      console.error('❌ Failed to create user:', createError.message);
      return;
    }

    console.log('✅ User created successfully:', email);
    console.log('   ID:', newUser.user?.id);

    // Create profile
    if (newUser.user) {
      console.log('📝 Creating user profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: email,
          full_name: name,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError.message);
      } else {
        console.log('✅ Profile created successfully');
      }
    }

    console.log('\n📋 Test credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n✅ You can now log in with these credentials');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
createTestUser().catch(console.error);