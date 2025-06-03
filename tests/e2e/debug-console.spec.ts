import { test } from '@playwright/test';

test('Debug console messages during login', async ({ page }) => {
  // Capture all console messages
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  // Navigate to login
  await page.goto('http://localhost:3003/login');
  await page.waitForLoadState('networkidle');
  
  // Add custom logging to the page
  await page.evaluate(() => {
    // Override router.push and router.replace to log calls
    const router = (window as any).next?.router;
    if (router) {
      const originalPush = router.push;
      const originalReplace = router.replace;
      
      router.push = (...args: any[]) => {
        console.log('Router.push called with:', args);
        return originalPush.apply(router, args);
      };
      
      router.replace = (...args: any[]) => {
        console.log('Router.replace called with:', args);
        return originalReplace.apply(router, args);
      };
    }
    
    console.log('Debug logging setup complete');
  });
  
  // Fill and submit form
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  
  console.log('\n🔐 Clicking sign in...\n');
  await page.click('[data-testid="sign-in-button"]');
  
  // Wait for any activity
  await page.waitForTimeout(5000);
  
  console.log('\n📋 Console Summary:');
  consoleLogs.forEach(log => {
    if (log.includes('error') || log.includes('Error')) {
      console.log('❌', log);
    } else if (log.includes('Router')) {
      console.log('🧭', log);
    } else if (log.includes('Auth')) {
      console.log('🔐', log);
    }
  });
  
  console.log('\n📍 Final URL:', page.url());
});