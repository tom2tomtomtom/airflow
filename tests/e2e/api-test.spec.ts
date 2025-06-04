import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('API Testing', () => {
  test('should test API endpoints after login', async ({ page }) => {
    console.log('🧪 Testing API endpoints...');

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await page.waitForTimeout(3000);
    console.log('✅ Login successful');

    // Test /api/clients endpoint
    const clientsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/clients', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const text = await response.text();
        return {
          status: response.status,
          statusText: response.statusText,
          body: text,
          ok: response.ok
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🌐 /api/clients response:', clientsResponse);

    if (clientsResponse.status === 200) {
      console.log('✅ API authentication working!');
      
      // Parse the response
      try {
        const data = JSON.parse(clientsResponse.body);
        console.log('📊 Clients data:', {
          success: data.success,
          clientCount: data.clients?.length || 0
        });
      } catch (e) {
        console.log('❌ Failed to parse response JSON');
      }
    } else {
      console.log('❌ API call failed:', clientsResponse);
    }

    // Test other key endpoints
    const endpoints = ['/api/health', '/api/auth/me'];
    
    for (const endpoint of endpoints) {
      const response = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url, { credentials: 'include' });
          return {
            url,
            status: res.status,
            ok: res.ok
          };
        } catch (error) {
          return { url, error: error.message };
        }
      }, endpoint);
      
      console.log(`🔗 ${endpoint}:`, response);
    }
  });
});