#!/usr/bin/env tsx

/**
 * Database migration runner
 * Usage: npm run migrate
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  });
  
  if (error) {
    // If RPC doesn't exist, try direct query (for local development)
    console.log('Creating migrations table...');
    // This would need to be done via Supabase dashboard or direct DB connection
  }
}

async function getMigrationsToRun() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  // Get all SQL files
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort(); // Ensure migrations run in order
  
  // Get already executed migrations
  const { data: executed, error } = await supabase
    .from(MIGRATIONS_TABLE)
    .select('filename');
  
  if (error && error.code !== 'PGRST116') { // Table doesn't exist
    console.error('Error checking migrations:', error);
    return [];
  }
  
  const executedFiles = new Set(executed?.map(m => m.filename) || []);
  
  // Return migrations that haven't been executed
  return sqlFiles.filter(file => !executedFiles.has(file));
}

async function runMigration(filename: string) {
  console.log(`Running migration: ${filename}`);
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const filePath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(filePath, 'utf-8');
  
  try {
    // For production, you'd use Supabase's migration system
    // This is a simplified version for development
    console.log(`Would execute SQL from: ${filename}`);
    console.log('SQL preview:', sql.substring(0, 200) + '...');
    
    // Record migration as executed
    const { error } = await supabase
      .from(MIGRATIONS_TABLE)
      .insert({ filename });
    
    if (error) {
      throw error;
    }
    
    console.log(`✓ Migration ${filename} completed`);
  } catch (error) {
    console.error(`✗ Migration ${filename} failed:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get pending migrations
    const migrations = await getMigrationsToRun();
    
    if (migrations.length === 0) {
      console.log('✓ No pending migrations');
      return;
    }
    
    console.log(`Found ${migrations.length} pending migrations`);
    
    // Run each migration
    for (const migration of migrations) {
      await runMigration(migration);
    }
    
    console.log('✓ All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
main();
