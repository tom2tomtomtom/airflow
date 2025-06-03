import { test, expect } from '@playwright/test';

test('Authentication Persistence Test', async ({ page }) => {
  console.log('🔐 Testing Authentication Persistence\n');
  
  // Step 1: Login
  console.log('📝 Step 1: Login');
  await page.goto('http://localhost:3003/login');
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  await page.click('[data-testid="sign-in-button"]');
  
  // Wait for redirect
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Logged in and redirected to dashboard\n');
  
  // Step 2: Navigate to different pages
  console.log('📝 Step 2: Testing navigation to protected pages');
  
  const protectedPages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clients', path: '/clients' },
    { name: 'Assets', path: '/assets' },
    { name: 'Generate Enhanced', path: '/generate-enhanced' },
    { name: 'Campaigns', path: '/campaigns' },
    { name: 'Templates', path: '/templates' },
    { name: 'Matrix', path: '/matrix' }
  ];
  
  for (const page_info of protectedPages) {
    console.log(`\n🔍 Testing ${page_info.name}...`);
    
    const response = await page.goto(`http://localhost:3003${page_info.path}`, {
      waitUntil: 'domcontentloaded'
    });
    
    const currentUrl = page.url();
    const statusCode = response?.status() || 0;
    
    console.log(`  URL: ${currentUrl}`);
    console.log(`  Status: ${statusCode}`);
    
    if (currentUrl.includes('/login')) {
      console.log(`  ❌ Redirected to login - auth not persisted`);
    } else if (currentUrl.includes(page_info.path)) {
      console.log(`  ✅ Successfully loaded ${page_info.name}`);
      
      // Take a screenshot of the page
      await page.screenshot({ 
        path: `auth-test-${page_info.name.toLowerCase().replace(' ', '-')}.png` 
      });
    } else {
      console.log(`  ⚠️  Unexpected redirect to: ${currentUrl}`);
    }
    
    // Small delay between navigations
    await page.waitForTimeout(500);
  }
  
  // Step 3: Check cookies
  console.log('\n📝 Step 3: Checking authentication cookies');
  const cookies = await page.context().cookies();
  const authCookies = cookies.filter(c => 
    c.name.includes('auth') || 
    c.name.includes('session') || 
    c.name.includes('supabase')
  );
  
  console.log(`Found ${authCookies.length} auth-related cookies:`);
  authCookies.forEach(cookie => {
    console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
  });
  
  // Step 4: Direct API test
  console.log('\n📝 Step 4: Testing API authentication');
  const apiResponse = await page.request.get('http://localhost:3003/api/auth/me');
  console.log(`API /auth/me status: ${apiResponse.status()}`);
  
  if (apiResponse.ok()) {
    const userData = await apiResponse.json();
    console.log(`✅ API authentication working - User: ${userData.user?.email}`);
  } else {
    console.log('❌ API authentication failed');
  }
  
  console.log('\n📊 Summary:');
  console.log('Check the screenshots and logs above to see which pages are accessible');
});