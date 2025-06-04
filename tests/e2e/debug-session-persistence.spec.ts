import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Debug Session Persistence', () => {
  test('should debug detailed session management', async ({ page }) => {
    console.log('🔍 Starting detailed session debugging...');

    // Navigate to login
    await page.goto('/login');
    
    // Fill and submit login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');

    // Check all cookies and localStorage immediately after login
    const allCookiesAfterLogin = await page.context().cookies();
    const localStorageAfterLogin = await page.evaluate(() => {
      return Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>);
    });
    
    console.log('🍪 All cookies after login:', allCookiesAfterLogin.map(c => `${c.name}=${c.value?.substring(0, 20)}...`));
    console.log('💾 LocalStorage after login:', Object.keys(localStorageAfterLogin));

    // Wait a bit and check session state
    await page.waitForTimeout(2000);
    
    // Try to navigate to dashboard first (should work)
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    const dashboardUrl = page.url();
    console.log('📍 Dashboard navigation result:', dashboardUrl);

    // Now try clients page
    console.log('🔄 Attempting to navigate to /clients...');
    
    // Listen for network requests
    page.on('response', async (response) => {
      if (response.url().includes('/clients')) {
        console.log(`🌐 /clients response: ${response.status()} ${response.statusText()}`);
        const headers = response.headers();
        if (headers['location']) {
          console.log('↪️ Redirect location:', headers['location']);
        }
      }
    });

    await page.goto('/clients');
    await page.waitForTimeout(2000);
    
    const clientsUrl = page.url();
    console.log('📍 Clients page URL result:', clientsUrl);
    
    // Check cookies and localStorage after clients navigation
    const allCookiesAfterClients = await page.context().cookies();
    const localStorageAfterClients = await page.evaluate(() => {
      return Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>);
    });
    
    console.log('🍪 All cookies after /clients:', allCookiesAfterClients.map(c => `${c.name}=${c.value?.substring(0, 20)}...`));
    console.log('💾 LocalStorage after /clients:', Object.keys(localStorageAfterClients));

    // Take screenshots for debugging
    await page.screenshot({ path: 'test-results/session-debug-final.png' });

    if (clientsUrl.includes('/login')) {
      console.log('❌ Session was lost during /clients navigation');
      
      // Check what happened to the session
      const sessionDiff = {
        cookiesLost: allCookiesAfterLogin.length - allCookiesAfterClients.length,
        localStorageChanged: JSON.stringify(localStorageAfterLogin) !== JSON.stringify(localStorageAfterClients)
      };
      console.log('📊 Session changes:', sessionDiff);
      
    } else {
      console.log('✅ Session persisted successfully');
    }
  });

  test('should test manual login flow with delays', async ({ page }) => {
    console.log('🕐 Testing with longer delays...');

    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.waitForTimeout(500);
    
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.waitForTimeout(500);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // Give more time for session to establish
    
    const afterLoginUrl = page.url();
    console.log('📍 After login URL:', afterLoginUrl);
    
    // Wait for any async operations to complete
    await page.waitForTimeout(5000);
    
    // Check for Supabase auth state change events
    const authState = await page.evaluate(() => {
      return {
        hasSupabaseAuth: !!(window as any).supabase,
        documentCookies: document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(name => name.includes('supabase') || name.includes('auth')),
      };
    });
    console.log('🔍 Auth state check:', authState);
    
    await page.goto('/clients');
    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);
    
    await page.screenshot({ path: 'test-results/manual-flow-result.png' });
  });
});