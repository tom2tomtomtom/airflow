import { getErrorMessage } from '@/utils/errorUtils';
/**
 * Global teardown for AIrWAVE comprehensive testing
 * Cleans up test data, connections, and artifacts
 */

import { FullConfig } from '@playwright/test';
import { TestDatabase } from './test-database';
import fs from 'fs';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting AIrWAVE test cleanup...');
  
  try {
    // 1. Cleanup test database (if available)
    if (process.env.TEST_DATABASE_READY === 'true') {
      console.log('📊 Cleaning up test database...');
      const testDb = new TestDatabase();
      await testDb.cleanup();
    } else {
      console.log('⚠️ Skipping database cleanup - not initialized');
    }
    
    // 2. Remove temporary test files
    console.log('🗂️ Cleaning up temporary files...');
    await cleanupTempFiles();
    
    // 3. Generate test summary
    console.log('📋 Generating test summary...');
    await generateTestSummary();
    
    console.log('✅ Global teardown completed successfully!');
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Global teardown failed:', error);
    // Don't throw to avoid masking test failures
  }
}

async function cleanupTempFiles() {
  const tempPaths = [
    'tests/fixtures/temp',
    'test-results/temp',
    '.auth'
  ];
  
  tempPaths.forEach(tempPath => {
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
  });
}

async function generateTestSummary() {
  // Read test results if they exist
  const resultsPath = 'test-results/results.json';
  if (!fs.existsSync(resultsPath)) {
    return;
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      total: results.stats?.total || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0,
      projects: results.suites?.map((suite: any) => ({
        name: suite.title,
        tests: suite.specs?.length || 0,
        passed: suite.specs?.filter((spec: any) => 
          spec.tests.every((test: any) => test.results.every((result: any) => result.status === 'passed'))
        ).length || 0
      })) || []
    };
    
    // Save summary
    fs.writeFileSync(
      'test-results/summary.json',
      JSON.stringify(summary, null, 2)
    );
    
    // Print summary to console
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Skipped: ${summary.skipped}`);
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.warn('⚠️ Could not generate test summary:', error.message);
  }
}

export default globalTeardown;