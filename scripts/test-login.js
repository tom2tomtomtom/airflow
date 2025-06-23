#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'test-password-123';

  console.log('🔐 Testing login with:');
  console.log('   Email:', email);
  console.log('   Password:', '********');
  console.log('   Supabase URL:', supabaseUrl);
  
  try {
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('\n❌ Login failed:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n📝 This user may not exist. Let\'s try to create it...');
        
        // Try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: 'Tom H',
              role: 'admin',
            },
          },
        });
        
        if (signUpError) {
          console.error('❌ Sign up failed:', signUpError.message);
        } else if (signUpData.user) {
          console.log('✅ User created successfully!');
          console.log('   ID:', signUpData.user.id);
          console.log('   Email:', signUpData.user.email);
          console.log('\n⚠️  Note: You may need to verify your email before logging in.');
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: email,
              full_name: 'Tom H',
              role: 'admin',
            });
            
          if (profileError) {
            console.error('⚠️  Profile creation failed:', profileError.message);
          } else {
            console.log('✅ Profile created successfully');
          }
        }
      }
      
      return;
    }

    if (data.user && data.session) {
      console.log('\n✅ Login successful!');
      console.log('   User ID:', data.user.id);
      console.log('   Email:', data.user.email);
      console.log('   Role:', data.user.user_metadata?.role || 'user');
      console.log('   Session expires:', new Date(data.session.expires_at * 1000).toLocaleString());
      
      // Try to fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profile) {
        console.log('\n📋 Profile data:');
        console.log('   Name:', profile.full_name || profile.name || 'Not set');
        console.log('   Role:', profile.role);
      } else if (profileError) {
        console.log('\n⚠️  No profile found:', profileError.message);
      }
      
      // Sign out
      await supabase.auth.signOut();
      console.log('\n✅ Signed out successfully');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testLogin().catch(console.error);