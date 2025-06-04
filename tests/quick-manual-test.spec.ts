import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test('Quick manual testing workflow', async ({ page }) => {
  console.log('🚀 Starting quick manual testing...');
  
  // 1. Test login
  console.log('📝 Testing login...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Login successful');
  
  // 2. Test clients page
  console.log('👥 Testing clients page...');
  await page.goto('http://localhost:3000/clients');
  await page.waitForTimeout(3000);
  
  const url = page.url();
  console.log('📍 Current URL:', url);
  
  if (!url.includes('/login')) {
    console.log('✅ Clients page accessible');
    
    // 3. Test API call via browser console
    console.log('🔌 Testing API call...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/clients', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const text = await response.text();
        let body;
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
        
        return {
          status: response.status,
          statusText: response.statusText,
          body: body
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    console.log('📡 API Response Status:', apiResponse.status);
    console.log('📡 API Response Body:', JSON.stringify(apiResponse.body, null, 2));
    
    // 4. Test create client navigation
    console.log('➕ Testing create client navigation...');
    try {
      await page.goto('http://localhost:3000/create-client');
      await page.waitForTimeout(2000);
      
      const createUrl = page.url();
      console.log('📍 Create client URL:', createUrl);
      
      if (createUrl.includes('/create-client')) {
        console.log('✅ Create client page accessible');
        
        // Check form elements
        const formStatus = await page.evaluate(() => ({
          hasForm: !!document.querySelector('form'),
          hasSteps: document.querySelectorAll('.MuiStep-root, [data-testid*="step"]').length,
          hasInputs: document.querySelectorAll('input, textarea, select').length,
          title: document.title
        }));
        
        console.log('📝 Create client form status:', formStatus);
      } else {
        console.log('❌ Could not access create client page');
      }
    } catch (error) {
      console.log('❌ Error accessing create client:', error.message);
    }
    
  } else {
    console.log('❌ Clients page redirected to login');
  }
  
  console.log('🎯 Manual testing complete');
});