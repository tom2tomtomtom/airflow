#!/usr/bin/env node

/**
 * Environment variable verification script
 */

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY'
];

const missing = requiredVars.filter(v => !process.env[v]);
const empty = requiredVars.filter(v => process.env[v] === '');

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nCheck your .env file. See docs/ENVIRONMENT_SETUP.md');
  process.exit(1);
}

if (empty.length > 0) {
  console.error('❌ Empty environment variables detected:');
  empty.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

console.log('✓ All required environment variables are set');
requiredVars.forEach(v => {
  const val = process.env[v];
  const masked = v.includes('SECRET') || v.includes('KEY') ? val.substring(0, 4) + '...' : val;
  console.log(`   - ${v}: ${masked}`);
});
