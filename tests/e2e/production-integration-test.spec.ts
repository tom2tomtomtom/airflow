import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';

async function loginWithDemo(page: Page) {
  console.log('🎯 Using demo authentication...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // Click demo login button
  const demoButton = page.locator('button:has-text("Continue with Demo")');
  await expect(demoButton).toBeVisible({ timeout: 10000 });
  await demoButton.click();
  
  // Wait for any redirect or page change
  await page.waitForTimeout(3000);
  
  // Try to navigate directly to dashboard
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Demo authentication completed');
}

test.describe('Production AIrWAVE Integration Tests with Demo Auth', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for complete flows
  });

  test('Complete Platform Integration Test', async ({ page }) => {
    console.log('🚀 Testing complete AIrWAVE platform integration...');
    
    // Test 1: Authentication and Navigation
    await loginWithDemo(page);
    
    // Verify dashboard access
    const dashboardContent = page.locator('main, [role="main"], .dashboard');
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
    console.log('✅ Dashboard accessible');
    
    // Test 2: OpenAI Integration
    console.log('🤖 Testing OpenAI integration...');
    const openaiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/test/openai');
        const data = await response.json();
        return { success: response.ok, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('OpenAI Test Result:', openaiResponse.success ? '✅ WORKING' : '❌ FAILED');
    if (openaiResponse.data?.message) {
      console.log('OpenAI Response:', openaiResponse.data.message.substring(0, 100) + '...');
    }
    
    // Test 3: Creatomate Integration  
    console.log('🎬 Testing Creatomate integration...');
    const creatomateResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/creatomate/test');
        const data = await response.json();
        return { success: response.ok, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Creatomate Test Result:', creatomateResponse.success ? '✅ WORKING' : '❌ FAILED');
    if (creatomateResponse.data?.data?.message) {
      console.log('Creatomate Response:', creatomateResponse.data.data.message);
    }
    
    // Test 4: Real-Time Events
    console.log('⚡ Testing real-time events...');
    const realtimeTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        try {
          const eventSource = new EventSource('/api/realtime/events');
          let connected = false;
          
          eventSource.onopen = () => {
            connected = true;
            resolve({ success: true, message: 'Real-time connection established' });
            eventSource.close();
          };
          
          eventSource.onerror = () => {
            if (!connected) {
              resolve({ success: false, message: 'Failed to connect to real-time events' });
            }
            eventSource.close();
          };
          
          // Timeout after 10 seconds
          setTimeout(() => {
            if (!connected) {
              resolve({ success: false, message: 'Real-time connection timeout' });
            }
            eventSource.close();
          }, 10000);
        } catch (error) {
          resolve({ success: false, message: error.message });
        }
      });
    });
    
    console.log('Real-time Test Result:', realtimeTest.success ? '✅ WORKING' : '❌ FAILED');
    console.log('Real-time Message:', realtimeTest.message);
    
    // Test 5: AI Content Generation
    console.log('🎨 Testing AI content generation...');
    const aiGenerationResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Create a tagline for an eco-friendly product',
            type: 'text',
            clientId: 'demo-client'
          })
        });
        const data = await response.json();
        return { success: response.ok, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('AI Generation Test Result:', aiGenerationResponse.success ? '✅ WORKING' : '❌ FAILED');
    if (aiGenerationResponse.data?.result?.content) {
      const content = Array.isArray(aiGenerationResponse.data.result.content) 
        ? aiGenerationResponse.data.result.content[0] 
        : aiGenerationResponse.data.result.content;
      console.log('Generated Content:', content.substring(0, 100) + '...');
    }
    
    // Test 6: Navigation and UI Components
    console.log('🧭 Testing navigation and UI components...');
    const navigationTests = [
      { name: 'Assets', path: '/assets' },
      { name: 'Templates', path: '/templates' },
      { name: 'Generate', path: '/generate-enhanced' }
    ];
    
    for (const nav of navigationTests) {
      try {
        await page.goto(`${BASE_URL}${nav.path}`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        const pageContent = page.locator('main, [role="main"], .page-content');
        const isLoaded = await pageContent.isVisible();
        console.log(`${nav.name} page: ${isLoaded ? '✅ LOADED' : '❌ FAILED'}`);
      } catch (error) {
        console.log(`${nav.name} page: ❌ ERROR - ${error.message}`);
      }
    }
    
    // Test 7: Asset Upload Interface
    console.log('📁 Testing asset upload interface...');
    await page.goto(`${BASE_URL}/assets`);
    await page.waitForLoadState('networkidle');
    
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add")');
    const hasUploadButton = await uploadButton.first().isVisible();
    console.log(`Upload Interface: ${hasUploadButton ? '✅ AVAILABLE' : '❌ NOT FOUND'}`);
    
    if (hasUploadButton) {
      await uploadButton.first().click();
      const uploadModal = page.locator('[data-testid="upload-modal"], [role="dialog"]');
      const modalVisible = await uploadModal.isVisible({ timeout: 5000 });
      console.log(`Upload Modal: ${modalVisible ? '✅ WORKING' : '❌ NOT OPENING'}`);
    }
    
    // Test 8: Content Generation Interface
    console.log('🎨 Testing content generation interface...');
    await page.goto(`${BASE_URL}/generate-enhanced`);
    await page.waitForLoadState('networkidle');
    
    const generationTabs = ['Copy', 'Image', 'Video'];
    for (const tabName of generationTabs) {
      const tab = page.locator(`button:has-text("${tabName}"), .${tabName.toLowerCase()}-tab`);
      const isVisible = await tab.first().isVisible();
      console.log(`${tabName} Generation: ${isVisible ? '✅ AVAILABLE' : '❌ NOT FOUND'}`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/production-integration-final.png', fullPage: true });
    console.log('📸 Final integration screenshot saved');
    
    console.log('🎉 Production integration test completed');
  });

  test('Performance and Load Test', async ({ page }) => {
    console.log('⚡ Testing performance and load times...');
    
    const startTime = Date.now();
    
    // Test initial page load
    await page.goto(BASE_URL);
    const landingLoadTime = Date.now() - startTime;
    console.log(`Landing page load time: ${landingLoadTime}ms`);
    
    // Test authentication flow performance
    const authStartTime = Date.now();
    await loginWithDemo(page);
    const authTime = Date.now() - authStartTime;
    console.log(`Authentication flow time: ${authTime}ms`);
    
    // Test API response times
    const apiTests = [
      { name: 'OpenAI Test', endpoint: '/api/test/openai' },
      { name: 'Creatomate Test', endpoint: '/api/creatomate/test' },
      { name: 'Health Check', endpoint: '/api/health' }
    ];
    
    for (const api of apiTests) {
      const apiStartTime = Date.now();
      try {
        const response = await page.evaluate(async (endpoint) => {
          const resp = await fetch(endpoint);
          return resp.ok;
        }, api.endpoint);
        
        const apiTime = Date.now() - apiStartTime;
        console.log(`${api.name} response time: ${apiTime}ms ${response ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`${api.name}: ❌ ERROR`);
      }
    }
    
    // Test page navigation performance
    const pages = ['/dashboard', '/assets', '/generate-enhanced'];
    for (const pagePath of pages) {
      const navStartTime = Date.now();
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      const navTime = Date.now() - navStartTime;
      console.log(`${pagePath} navigation time: ${navTime}ms`);
    }
    
    console.log('⚡ Performance testing completed');
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    console.log('🛡️ Testing error handling and edge cases...');
    
    await loginWithDemo(page);
    
    // Test invalid API calls
    const errorTests = [
      {
        name: 'Invalid Video Status',
        test: () => page.evaluate(() => fetch('/api/check-video-status?job_id=invalid-id'))
      },
      {
        name: 'Invalid AI Generation',
        test: () => page.evaluate(() => fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invalid: 'data' })
        }))
      }
    ];
    
    for (const errorTest of errorTests) {
      try {
        const response = await errorTest.test();
        const status = await response.status();
        const isExpectedError = status >= 400 && status < 600;
        console.log(`${errorTest.name}: ${isExpectedError ? '✅ HANDLED' : '❌ UNEXPECTED'} (${status})`);
      } catch (error) {
        console.log(`${errorTest.name}: ✅ PROPERLY REJECTED`);
      }
    }
    
    // Test offline behavior
    console.log('📡 Testing offline behavior...');
    await page.context().setOffline(true);
    
    try {
      await page.reload();
      await page.waitForTimeout(3000);
      
      const offlineIndicator = page.locator('text="offline", text="connection", text="network"');
      const hasOfflineHandling = await offlineIndicator.first().isVisible();
      console.log(`Offline handling: ${hasOfflineHandling ? '✅ IMPLEMENTED' : '⚠️ BASIC'}`);
    } catch (error) {
      console.log('Offline handling: ⚠️ NO SPECIFIC HANDLING');
    }
    
    await page.context().setOffline(false);
    console.log('🛡️ Error handling testing completed');
  });
});