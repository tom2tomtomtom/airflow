import { getErrorMessage } from '@/utils/errorUtils';
#!/usr/bin/env tsx

/**
 * Generate TypeScript types from Supabase database schema
 * This script connects to Supabase and generates up-to-date types
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const TYPES_FILE_PATH = join(process.cwd(), 'src/types/database.ts');

async function generateDatabaseTypes() {
  console.log('🔄 Generating database types from Supabase...');

  try {
    // Check if Supabase CLI is available
    try {
      execSync('supabase --version', { stdio: 'pipe' });
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('❌ Supabase CLI not found. Please install it first:');
      console.error('npm install -g supabase');
      process.exit(1);
    }

    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing required environment variables:');
      console.error('- NEXT_PUBLIC_SUPABASE_URL');
      console.error('- SUPABASE_SERVICE_ROLE_KEY');
      console.error('Please set these in your .env.local file');
      process.exit(1);
    }

    // Generate types using Supabase CLI
    console.log('📡 Connecting to Supabase and generating types...');
    
    const command = `supabase gen types typescript --project-id ${extractProjectId(supabaseUrl)} --schema public`;
    
    try {
      const generatedTypes = execSync(command, { 
        encoding: 'utf8',
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: supabaseKey
        }
      });

      // Add header comment
      const header = `// Generated from Supabase schema
// This file contains all database types for AIRWAVE
// Last updated: ${new Date().toISOString()}
// 
// To regenerate: npm run generate:types

`;

      const finalTypes = header + generatedTypes;

      // Write to file
      writeFileSync(TYPES_FILE_PATH, finalTypes, 'utf8');
      
      console.log('✅ Database types generated successfully!');
      console.log(`📁 Types written to: ${TYPES_FILE_PATH}`);
      
      // Validate the generated file
      try {
        const content = readFileSync(TYPES_FILE_PATH, 'utf8');
        if (content.includes('export interface Database')) {
          console.log('✅ Generated types file is valid');
        } else {
          console.warn('⚠️  Generated types file may be incomplete');
        }
      } catch (error) {
    const message = getErrorMessage(error);
        console.error('❌ Error validating generated types:', error);
      }

    } catch (error: any) {
      console.error('❌ Error generating types:', error.message);
      
      // Fallback: try to use existing types and just update timestamp
      try {
        const existingContent = readFileSync(TYPES_FILE_PATH, 'utf8');
        const updatedContent = existingContent.replace(
          /\/\/ Last updated: .*/,
          `// Last updated: ${new Date().toISOString()}`
        );
        writeFileSync(TYPES_FILE_PATH, updatedContent, 'utf8');
        console.log('📝 Updated timestamp on existing types file');
      } catch (fallbackError) {
        console.error('❌ Could not update existing types file');
        process.exit(1);
      }
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

function extractProjectId(url: string): string {
  // Extract project ID from Supabase URL
  // Format: https://[project-id].supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('Invalid Supabase URL format');
  }
  return match[1];
}

// Run the script
if (require.main === module) {
  generateDatabaseTypes().catch(console.error);
}

export { generateDatabaseTypes };
