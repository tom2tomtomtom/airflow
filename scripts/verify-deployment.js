/**
 * AIrWAVE Deployment Verification Script
 * 
 * Run this script to verify your deployment is properly configured
 * Usage: SUPABASE_URL=your-url SUPABASE_SERVICE_KEY=your-key node scripts/verify-deployment.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'CREATOMATE_API_KEY'
];

const optionalEnvVars = [
  'ELEVENLABS_API_KEY',
  'NEXT_PUBLIC_API_URL'
];

async function verifyDeployment() {
  console.log('🔍 AIrWAVE Deployment Verification\n');
  console.log('=' .repeat(50));
  
  let hasErrors = false;
  
  // 1. Check environment variables
  console.log('\n1️⃣  Checking Environment Variables:\n');
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ❌ ${varName}: Missing`);
      hasErrors = true;
    } else {
      const masked = varName.includes('KEY') || varName.includes('SECRET') 
        ? value.substring(0, 8) + '...' 
        : value;
      console.log(`   ✅ ${varName}: ${masked}`);
    }
  });
  
  console.log('\n   Optional Variables:');
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`   ⚠️  ${varName}: Not set (optional)`);
    } else {
      const masked = varName.includes('KEY') ? value.substring(0, 8) + '...' : value;
      console.log(`   ✅ ${varName}: ${masked}`);
    }
  });
  
  if (hasErrors) {
    console.log('\n❌ Missing required environment variables. Cannot continue verification.');
    process.exit(1);
  }
  
  // 2. Test Supabase connection
  console.log('\n2️⃣  Testing Supabase Connection:\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Test auth service
    const { data: authTest, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (authError) throw authError;
    console.log('   ✅ Auth service: Connected');
    
    // Test database
    const tables = [
      'profiles',
      'clients',
      'assets',
      'templates',
      'briefs',
      'motivations',
      'matrices',
      'executions'
    ];
    
    console.log('\n   Checking tables:');
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
          hasErrors = true;
        } else {
          console.log(`   ✅ ${table}: Found (${count || 0} records)`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Error - ${err.message}`);
        hasErrors = true;
      }
    }
    
    // Test storage
    console.log('\n   Checking storage:');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log(`   ❌ Storage: ${storageError.message}`);
      hasErrors = true;
    } else {
      const assetsBucket = buckets.find(b => b.name === 'assets');
      if (assetsBucket) {
        console.log(`   ✅ Assets bucket: Found (Public: ${assetsBucket.public})`);
      } else {
        console.log('   ❌ Assets bucket: Not found');
        hasErrors = true;
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`);
    hasErrors = true;
  }
  
  // 3. Test external APIs
  console.log('\n3️⃣  Testing External APIs:\n');
  
  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      
      if (response.ok) {
        console.log('   ✅ OpenAI API: Connected');
      } else {
        console.log(`   ❌ OpenAI API: ${response.status} ${response.statusText}`);
        hasErrors = true;
      }
    } catch (error) {
      console.log(`   ❌ OpenAI API: ${error.message}`);
      hasErrors = true;
    }
  }
  
  // Test Creatomate
  if (process.env.CREATOMATE_API_KEY) {
    try {
      const response = await fetch('https://api.creatomate.com/v1/templates', {
        headers: {
          'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`
        }
      });
      
      if (response.ok) {
        console.log('   ✅ Creatomate API: Connected');
      } else {
        console.log(`   ❌ Creatomate API: ${response.status} ${response.statusText}`);
        hasErrors = true;
      }
    } catch (error) {
      console.log(`   ❌ Creatomate API: ${error.message}`);
      hasErrors = true;
    }
  }
  
  // 4. Summary
  console.log('\n' + '=' .repeat(50));
  
  if (hasErrors) {
    console.log('\n❌ Deployment verification failed!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Fix the issues listed above');
    console.log('   2. Run the Supabase setup script if tables are missing');
    console.log('   3. Create the assets storage bucket if missing');
    console.log('   4. Verify API keys are correct and have proper permissions');
  } else {
    console.log('\n✅ Deployment verification passed!');
    console.log('\n🚀 Your AIrWAVE deployment is ready for production!');
    console.log('\n📝 Optional next steps:');
    console.log('   1. Create a test user account');
    console.log('   2. Upload some test assets');
    console.log('   3. Create a test campaign');
    console.log('   4. Configure Creatomate webhook for real-time updates');
  }
  
  console.log('\n');
}

// Run verification
verifyDeployment().catch(console.error);
