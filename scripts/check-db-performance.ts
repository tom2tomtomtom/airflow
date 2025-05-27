#!/usr/bin/env tsx

/**
 * Database performance checker
 * Analyzes query performance and suggests optimizations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface QueryStats {
  query: string;
  calls: number;
  total_time: number;
  mean_time: number;
  max_time: number;
}

async function checkSlowQueries() {
  console.log('\n🔍 Checking for slow queries...');
  
  // This would typically query pg_stat_statements
  // For Supabase, we'd need to check their dashboard or logs
  console.log('Check Supabase dashboard for slow query logs');
}

async function checkTableSizes() {
  console.log('\n📊 Checking table sizes...');
  
  const tables = [
    'assets',
    'executions',
    'matrices',
    'approval_workflows',
    'briefs',
    'campaign_analytics',
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`${table}: ${count?.toLocaleString()} rows`);
    }
  }
}

async function checkIndexUsage() {
  console.log('\n🔧 Checking index usage...');
  
  // Sample queries to test
  const testQueries = [
    {
      name: 'Assets by client',
      table: 'assets',
      filter: { client_id: 'test-client-id' },
    },
    {
      name: 'Pending executions',
      table: 'executions',
      filter: { status: 'pending' },
    },
    {
      name: 'Recent analytics',
      table: 'campaign_analytics',
      order: { column: 'date', ascending: false },
    },
  ];
  
  for (const query of testQueries) {
    console.log(`\nTesting: ${query.name}`);
    const start = Date.now();
    
    let q = supabase.from(query.table).select('id', { count: 'exact' });
    
    if (query.filter) {
      q = q.match(query.filter);
    }
    
    if (query.order) {
      q = q.order(query.order.column, { ascending: query.order.ascending });
    }
    
    const { count, error } = await q;
    const duration = Date.now() - start;
    
    if (!error) {
      console.log(`  Results: ${count}, Time: ${duration}ms`);
      if (duration > 100) {
        console.log('  ⚠️  Consider optimizing this query');
      }
    } else {
      console.log(`  Error: ${error.message}`);
    }
  }
}

async function generateReport() {
  console.log('\n📋 Performance Recommendations:\n');
  
  const recommendations = [
    {
      table: 'assets',
      recommendation: 'Ensure idx_assets_client_created is being used for client asset listings',
    },
    {
      table: 'executions',
      recommendation: 'Use partial indexes for status-based queries (idx_executions_pending)',
    },
    {
      table: 'matrices',
      recommendation: 'Consider partitioning if table grows beyond 10M rows',
    },
    {
      table: 'campaign_analytics',
      recommendation: 'Use materialized views for aggregated dashboard queries',
    },
  ];
  
  recommendations.forEach(rec => {
    console.log(`• ${rec.table}: ${rec.recommendation}`);
  });
}

async function main() {
  console.log('🚀 AIrWAVE Database Performance Check\n');
  
  await checkTableSizes();
  await checkIndexUsage();
  await checkSlowQueries();
  await generateReport();
  
  console.log('\n✓ Performance check complete');
}

main().catch(console.error);
