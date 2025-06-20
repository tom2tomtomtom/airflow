#!/usr/bin/env tsx
// Script to create a test user in Supabase for testing purposes

import { getErrorMessage } from '@/utils/errorUtils';

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

// Load environment variables from .env file
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create service role client for admin operations
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestUser {
  email: string;
  password: string;
  userData: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

const testUsers: TestUser[] = [
  {
    email: 'test@airwave.app',
    password: 'TestUser123!',
    userData: {
      first_name: 'Test',
      last_name: 'User',
      role: 'admin'
    }
  },
  {
    email: 'playwright@airwave.app',
    password: 'PlaywrightTest123!',
    userData: {
      first_name: 'Playwright',
      last_name: 'Tester',
      role: 'user'
    }
  }
];

async function createTestUser(testUser: TestUser): Promise<any> {
  console.log(`\n🔧 Creating test user: ${testUser.email}`);
  
  try {
    // 1. Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: testUser.userData.first_name,
        last_name: testUser.userData.last_name,
      }
    });

    if (authError) {
      console.error(`❌ Error creating auth user:`, authError);
      return null;
    }

    if (!authData.user) {
      console.error(`❌ No user data returned`);
      return null;
    }

    console.log(`✅ Auth user created with ID: ${authData.user.id}`);

    // 2. Create the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: testUser.userData.first_name,
        last_name: testUser.userData.last_name,
        role: testUser.userData.role,
        permissions: {},
        preferences: {
          theme: 'dark',
          notifications: true,
          realtime_updates: true
        },
        metadata: {
          created_by: 'test-script',
          purpose: 'automated-testing'
        }
      })
      .select()
      .single();

    if (profileError) {
      console.error(`❌ Error creating profile:`, profileError);
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return null;
    }

    console.log(`✅ Profile created for user: ${testUser.email}`);

    // 3. Create a test client and associate it with the user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: `Test Client for ${testUser.userData.first_name}`,
        industry: 'Technology',
        contact_email: testUser.email,
        contact_name: `${testUser.userData.first_name} ${testUser.userData.last_name}`,
        brand_guidelines: {
          colors: {
            primary: '#2563eb',
            secondary: '#dc2626',
            accent: '#f59e0b'
          },
          voice_tone: 'Professional yet approachable',
          target_audience: 'Tech professionals and early adopters'
        },
        metadata: {
          created_by: 'test-script',
          purpose: 'automated-testing'
        }
      })
      .select()
      .single();

    if (clientError) {
      console.warn(`⚠️ Could not create test client:`, clientError);
    } else {
      console.log(`✅ Test client created with ID: ${clientData.id}`);

      // 4. Associate user with client
      const { error: userClientError } = await supabase
        .from('user_clients')
        .insert({
          user_id: authData.user.id,
          client_id: clientData.id,
          role: testUser.userData.role,
          permissions: ['read', 'write', 'admin']
        });

      if (userClientError) {
        console.warn(`⚠️ Could not associate user with client:`, userClientError);
      } else {
        console.log(`✅ User associated with client`);
      }
    }

    return {
      userId: authData.user.id,
      email: testUser.email,
      password: testUser.password,
      profile: profileData,
      client: clientData
    };

  } catch (error) {
    const message = getErrorMessage(error);
    console.error(`❌ Unexpected error creating test user:`, error);
    return null;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Creating test users for AIrWAVE platform testing...\n');

  const createdUsers = [];
  
  for (const testUser of testUsers) {
    const result = await createTestUser(testUser);
    if (result) {
      createdUsers.push(result);
    }
  }

  console.log('\n📋 Test User Summary:');
  console.log('=' .repeat(50));
  
  if (createdUsers.length === 0) {
    console.log('❌ No users were created successfully');
    process.exit(1);
  }

  for (const user of createdUsers) {
    console.log(`\n👤 User: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Profile: ${user.profile?.first_name} ${user.profile?.last_name}`);
    console.log(`   Client ID: ${user.client?.id || 'N/A'}`);
  }

  console.log('\n✨ Test users created successfully!');
  console.log('🧪 You can now use these credentials for Playwright testing');
  console.log('\nRecommended test credentials:');
  console.log(`Email: ${createdUsers[0].email}`);
  console.log(`Password: ${createdUsers[0].password}`);
  
  process.exit(0);
}

// Handle script errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});