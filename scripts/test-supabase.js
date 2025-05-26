import { supabase, getServiceSupabase } from '../src/lib/supabase';
import { env, isDemo } from '../src/lib/env';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Check environment
  console.log('📋 Environment Configuration:');
  console.log(`   Demo Mode: ${isDemo}`);
  console.log(`   Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Anon Key: ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Service Role Key: ${env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set'}\n`);
  
  if (isDemo) {
    console.log('⚠️  Running in demo mode. Set NEXT_PUBLIC_DEMO_MODE=false to test real Supabase connection.\n');
    return;
  }
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Basic connection
  console.log('🔌 Test 1: Basic Connection');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('   ✅ Successfully connected to Supabase\n');
    testsPassed++;
  } catch (error) {
    console.log('   ❌ Failed to connect:', error.message, '\n');
    testsFailed++;
  }
  
  // Test 2: Database query (clients table)
  console.log('💾 Test 2: Database Query (clients table)');
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .limit(1);
    
    if (error) throw error;
    console.log('   ✅ Successfully queried clients table');
    console.log(`   Found ${data?.length || 0} client(s)\n`);
    testsPassed++;
  } catch (error) {
    console.log('   ❌ Failed to query clients:', error.message);
    console.log('   Make sure you have run the database migrations.\n');
    testsFailed++;
  }
  
  // Test 3: Storage bucket check
  console.log('📦 Test 3: Storage Bucket (assets)');
  try {
    const { data, error } = await supabase.storage.getBucket('assets');
    
    if (error) {
      if (error.message.includes('not found')) {
        console.log('   ⚠️  Assets bucket not found. Please create it in Supabase Dashboard.\n');
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ Assets bucket exists');
      console.log(`   Public: ${data.public ? 'Yes' : 'No'}\n`);
      testsPassed++;
    }
  } catch (error) {
    console.log('   ❌ Failed to check storage:', error.message, '\n');
    testsFailed++;
  }
  
  // Test 4: Service role client (if configured)
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('🔐 Test 4: Service Role Client');
    try {
      const serviceSupabase = getServiceSupabase();
      const { count, error } = await serviceSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log('   ✅ Service role client working');
      console.log(`   Total profiles: ${count || 0}\n`);
      testsPassed++;
    } catch (error) {
      console.log('   ❌ Service role client failed:', error.message, '\n');
      testsFailed++;
    }
  }
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log(`   Total: ${testsPassed + testsFailed}\n`);
  
  if (testsFailed > 0) {
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure your Supabase credentials are correct');
    console.log('   2. Run the database migrations in order');
    console.log('   3. Create the assets storage bucket');
    console.log('   4. Check your Supabase project is active\n');
  } else {
    console.log('🎉 All tests passed! Your Supabase connection is ready.\n');
  }
}

// Run the test
testSupabaseConnection().catch(console.error);
