import { test, expect } from '@playwright/test';

test('Direct dashboard access after auth', async ({ page, context }) => {
  console.log('🔐 Step 1: Login via Supabase API...');
  
  // Go to login page first
  await page.goto('http://localhost:3003/login');
  
  // Fill and submit form
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  await page.click('[data-testid="sign-in-button"]');
  
  // Wait for Supabase auth to complete
  await page.waitForTimeout(2000);
  
  // Get cookies
  const cookies = await context.cookies();
  console.log('🍪 Cookies after login:');
  cookies.forEach(cookie => {
    if (cookie.name.includes('auth') || cookie.name.includes('token') || cookie.name.includes('sb-')) {
      console.log(`  ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    }
  });
  
  // Try direct navigation to dashboard
  console.log('\n📍 Step 2: Direct navigation to dashboard...');
  await page.goto('http://localhost:3003/dashboard', { waitUntil: 'networkidle' });
  
  // Check where we ended up
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  
  if (finalUrl.includes('/dashboard')) {
    console.log('✅ Successfully on dashboard!');
    
    // Take screenshot
    await page.screenshot({ path: 'dashboard-success.png' });
    
    // Check for user info
    const welcomeText = await page.locator('text=Welcome').textContent().catch(() => null);
    if (welcomeText) {
      console.log('Welcome text:', welcomeText);
    }
  } else {
    console.log('❌ Redirected away from dashboard');
    await page.screenshot({ path: 'dashboard-redirect.png' });
  }
  
  // Try accessing other protected routes
  console.log('\n📍 Step 3: Testing other protected routes...');
  
  const routes = ['/clients', '/assets', '/generate-enhanced'];
  for (const route of routes) {
    await page.goto(`http://localhost:3003${route}`, { waitUntil: 'networkidle' });
    const url = page.url();
    if (url.includes(route)) {
      console.log(`✅ ${route} - accessible`);
    } else {
      console.log(`❌ ${route} - redirected to ${url}`);
    }
  }
});