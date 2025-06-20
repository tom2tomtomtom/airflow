#!/usr/bin/env tsx

import { getErrorMessage } from '@/utils/errorUtils';
// Script to get existing test users from Supabase

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

// Load environment variables from .env file
config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create service role client for admin operations
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getTestUsers(): Promise<void> {
  console.log('🔍 Looking for existing test users...\n');

  const testEmails = ['test@airwave.app', 'playwright@airwave.app'];
  const foundUsers = [];

  for (const email of testEmails) {
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error(`❌ Error fetching users:`, userError);
        continue;
      }

      const user = userData?.users?.find((u: any) => u.email === email);
      
      if (user) {
        console.log(`✅ Found user: ${email}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          console.log(`   Profile: ${profile.first_name} ${profile.last_name} (${profile.role})`);
        } else {
          console.log(`   Profile: Not found (${profileError?.message})`);
        }

        // Get client associations
        const { data: userClients, error: clientError } = await supabase
          .from('user_clients')
          .select(`
            client_id,
            role,
            clients (
              id,
              name,
              industry
            )
          `)
          .eq('user_id', user.id);

        if (userClients && userClients.length > 0) {
          console.log(`   Clients: ${userClients.length} associated`);
          userClients.forEach((uc: any) => {
            console.log(`     - ${uc.clients?.name} (${uc.clients?.id}) as ${uc.role}`);
          });
        } else {
          console.log(`   Clients: None associated`);
        }

        foundUsers.push({
          email,
          password: email === 'test@airwave.app' ? 'TestUser123!' : 'PlaywrightTest123!',
          userId: user.id,
          profile,
          clients: userClients
        });

        console.log('');
      } else {
        console.log(`❌ User not found: ${email}\n`);
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.error(`❌ Error checking user ${email}:`, error);
    }
  }

  if (foundUsers.length > 0) {
    console.log('\n🎉 Test Credentials Available:');
    console.log('=' .repeat(50));
    
    foundUsers.forEach(user => {
      console.log(`\n👤 Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   User ID: ${user.userId}`);
      console.log(`   Ready for Playwright testing: ✅`);
    });

    console.log('\n🧪 You can now use these credentials for testing!');
    console.log('\nRecommended for Playwright:');
    console.log(`Email: ${foundUsers[0].email}`);
    console.log(`Password: ${foundUsers[0].password}`);
  } else {
    console.log('\n❌ No test users found. Run create-test-user.ts first.');
  }
}

async function main(): Promise<void> {
  await getTestUsers();
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});