const { createBrowserClient } = require('@supabase/ssr');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testSupabaseAuth() {
  console.log('Testing Supabase authentication and cookie handling...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    process.exit(1);
  }

  console.log('✓ Supabase URL:', supabaseUrl);
  console.log('✓ Supabase Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

  // Create a mock cookie store
  const cookies = new Map();
  
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        console.log(`[Cookie GET] ${name}`);
        return cookies.get(name);
      },
      set(name, value, options) {
        console.log(`[Cookie SET] ${name} = ${value?.substring(0, 50)}... (options: ${JSON.stringify(options)})`);
        cookies.set(name, value);
      },
      remove(name, options) {
        console.log(`[Cookie REMOVE] ${name} (options: ${JSON.stringify(options)})`);
        cookies.delete(name);
      },
    },
  });

  try {
    // Test authentication
    console.log('\nTesting authentication...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123',
    });

    if (error) {
      console.log('Auth error (expected if test user does not exist):', error.message);
    } else {
      console.log('Auth successful:', data);
    }

    // Check what cookies were set
    console.log('\nCookies after auth attempt:');
    for (const [name, value] of cookies.entries()) {
      console.log(`- ${name}: ${value.substring(0, 50)}...`);
    }

    // Test session retrieval
    console.log('\nTesting session retrieval...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Session error:', sessionError.message);
    } else {
      console.log('Session:', session ? 'Found' : 'Not found');
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

testSupabaseAuth();