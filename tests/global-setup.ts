import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AIRWAVE E2E Test Suite Global Setup');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✅ Development server is ready');
    
    // Pre-authenticate and store auth state
    console.log('🔐 Setting up authentication state...');
    await page.goto('http://localhost:3000/auth/login');
    
    // Fill login form
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'test-password-123';
    
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    
    // Save authentication state
    await page.context().storageState({ path: 'tests/auth-state.json' });
    console.log('✅ Authentication state saved');
    
    // Verify API endpoints are accessible
    console.log('🔍 Verifying API endpoints...');
    const apiResponse = await page.request.get('/api/health');
    if (apiResponse.ok()) {
      console.log('✅ API endpoints are accessible');
    } else {
      console.warn('⚠️ API endpoints may not be fully ready');
    }
    
    // Setup test data if needed
    console.log('📊 Setting up test data...');
    
    // Create test client for E2E tests
    const testClient = {
      name: 'E2E Test Client',
      industry: 'Technology',
      description: 'Client created for E2E testing purposes',
      email: 'test@e2e.com'
    };
    
    try {
      await page.request.post('/api/clients', {
        data: testClient,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Test client created');
    } catch (error) {
      console.log('ℹ️ Test client may already exist or API not ready');
    }
    
    console.log('🎉 Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
