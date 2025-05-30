import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AIrWAVE Comprehensive Test Suite');
  console.log('📍 Target URL: https://airwave2.netlify.app');
  console.log('⏱️  Test Timeout: 60 seconds per test');
  console.log('🔄 Retries: 1 (or 2 on CI)');
  console.log('');
  
  // Test basic connectivity
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('🌐 Testing connectivity to AIrWAVE platform...');
    const response = await page.goto('https://airwave2.netlify.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (response?.ok()) {
      console.log('✅ AIrWAVE platform is accessible');
      console.log(`📊 Response status: ${response.status()}`);
    } else {
      console.log('❌ AIrWAVE platform is not accessible');
      console.log(`📊 Response status: ${response?.status() || 'No response'}`);
    }
    
    // Test authentication endpoint
    try {
      await page.goto('https://airwave2.netlify.app/login');
      const loginPageLoaded = await page.waitForSelector('h1, h3', { timeout: 10000 });
      if (loginPageLoaded) {
        console.log('✅ Login page is accessible');
      }
    } catch (error) {
      console.log('⚠️  Login page accessibility test failed');
    }
    
    await browser.close();
    console.log('');
    
  } catch (error) {
    console.log('❌ Connectivity test failed:', error.message);
    console.log('');
  }
  
  console.log('📋 Test Plan:');
  console.log('  1. Authentication and Navigation Flow');
  console.log('  2. Asset Library Functionality');
  console.log('  3. Strategic Content Generation');
  console.log('  4. Campaign Matrix Testing');
  console.log('  5. Template Library Integration');
  console.log('  6. Video Generation and Rendering');
  console.log('  7. Error Handling and Edge Cases');
  console.log('  8. Performance and Load Testing');
  console.log('  9. Happy Path End-to-End Workflow');
  console.log('  10. UI/UX Consistency Check');
  console.log('');
  console.log('🧪 Beginning comprehensive tests...');
  console.log('');
}

export default globalSetup;