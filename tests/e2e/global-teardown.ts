async function globalTeardown() {
  console.log('🧹 Running global teardown...');
  
  // Clean up any global test data
  // This could include:
  // - Cleaning up test files
  // - Resetting database state
  // - Clearing cache
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;