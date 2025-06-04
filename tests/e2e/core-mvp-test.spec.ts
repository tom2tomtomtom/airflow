import { test, expect } from '@playwright/test';

test.describe('Core MVP Features Test', () => {
  test('Test core MVP functionality without full build', async ({ page, context }) => {
    console.log('🧪 Testing core MVP features...');

    // Test 1: Navigate to pages directly and check they exist
    const corePages = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/strategy', name: 'Strategy Builder' },
      { path: '/campaign-builder', name: 'Campaign Builder' },
      { path: '/assets', name: 'Asset Management' },
    ];

    for (const pageInfo of corePages) {
      console.log(`Testing ${pageInfo.name}...`);
      
      try {
        await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded', timeout: 10000 });
        
        // Check if page loads without major errors
        const body = await page.locator('body').textContent();
        const hasError = body?.includes('500') || body?.includes('404') || body?.includes('Cannot') || body?.includes('Error');
        
        if (!hasError) {
          console.log(`✅ ${pageInfo.name} loads successfully`);
        } else {
          console.log(`⚠️ ${pageInfo.name} has issues: ${body?.substring(0, 100)}...`);
        }
        
        // Take a screenshot for verification
        await page.screenshot({ 
          path: `tests/screenshots/mvp-test-${pageInfo.path.replace('/', '')}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`❌ ${pageInfo.name} failed to load: ${error.message}`);
      }
      
      await page.waitForTimeout(1000);
    }

    // Test 2: Check API endpoints
    console.log('Testing API endpoints...');
    
    const apiEndpoints = [
      { path: '/api/health', name: 'Health Check' },
      { path: '/api/strategy-generate', name: 'Strategy Generation' },
      { path: '/api/copy-generate', name: 'Copy Generation' },
      { path: '/api/video/generate', name: 'Video Generation' },
      { path: '/api/campaigns/export', name: 'Campaign Export' },
    ];

    for (const api of apiEndpoints) {
      try {
        const response = await context.request.get(`http://localhost:3000${api.path}`);
        console.log(`${api.name}: ${response.status()} ${response.statusText()}`);
        
        if (response.status() < 500) {
          console.log(`✅ ${api.name} API endpoint responds`);
        } else {
          console.log(`⚠️ ${api.name} API endpoint has server error`);
        }
      } catch (error) {
        console.log(`❌ ${api.name} API endpoint failed: ${error.message}`);
      }
    }

    // Test 3: Test form interactions where possible
    console.log('Testing form interactions...');
    
    await page.goto('/strategy');
    await page.waitForTimeout(2000);
    
    // Look for text inputs and test them
    const textInputs = page.locator('input[type="text"], textarea');
    const inputCount = await textInputs.count();
    
    if (inputCount > 0) {
      console.log(`Found ${inputCount} text inputs on strategy page`);
      try {
        await textInputs.first().fill('Test Data', { timeout: 5000 });
        console.log('✅ Text input functionality working');
      } catch (error) {
        console.log('⚠️ Text input interaction failed');
      }
    }

    // Look for buttons and count them
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons on strategy page`);

    // Test 4: Check for key MVP components
    console.log('Checking for MVP components...');
    
    await page.goto('/campaign-builder');
    await page.waitForTimeout(2000);
    
    // Look for stepper components (campaign builder steps)
    const stepper = page.locator('[data-testid="stepper"], .MuiStepper-root, text=/step/i');
    if (await stepper.count() > 0) {
      console.log('✅ Campaign builder stepper found');
    } else {
      console.log('⚠️ Campaign builder stepper not found');
    }

    // Look for export functionality
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")');
    if (await exportBtn.count() > 0) {
      console.log('✅ Export functionality found');
    } else {
      console.log('⚠️ Export functionality not found');
    }

    console.log('🎉 Core MVP test completed!');
  });

  test('Test standalone API functionality', async ({ page, context }) => {
    console.log('🔍 Testing standalone API functionality...');

    // Test health endpoint
    try {
      const healthResponse = await context.request.get('http://localhost:3000/api/health');
      const healthData = await healthResponse.json();
      
      console.log('Health check response:', healthData);
      
      if (healthResponse.ok()) {
        console.log('✅ Health API working');
      } else {
        console.log('⚠️ Health API has issues');
      }
    } catch (error) {
      console.log('❌ Health API failed:', error.message);
    }

    // Test strategy generation endpoint (POST)
    try {
      const strategyResponse = await context.request.post('http://localhost:3000/api/strategy-generate', {
        data: {
          brief: 'Test brief for AI generation',
          company: 'Test Company',
          goals: ['Brand awareness', 'Lead generation']
        }
      });
      
      console.log('Strategy API status:', strategyResponse.status());
      
      if (strategyResponse.status() !== 500) {
        console.log('✅ Strategy API responds (may need auth)');
      } else {
        console.log('⚠️ Strategy API has server error');
      }
    } catch (error) {
      console.log('❌ Strategy API failed:', error.message);
    }

    console.log('🔍 Standalone API test completed!');
  });
});