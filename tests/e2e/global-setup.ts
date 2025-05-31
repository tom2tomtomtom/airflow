import { getErrorMessage } from '@/utils/errorUtils';
import { chromium, FullConfig } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🔧 Setting up global test environment...');
  
  const { baseURL } = config.projects[0].use;
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto(baseURL!);
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're in demo mode or need authentication
    const isDemoMode = await page.evaluate(() => {
      const nextData = document.getElementById('__NEXT_DATA__');
      if (nextData) {
        try {
          const data = JSON.parse(nextData.textContent || '{}');
          return data.runtimeConfig?.NEXT_PUBLIC_DEMO_MODE === 'true';
        } catch (e) {
          // Fallback
        }
      }
      return (window as any).__NEXT_PUBLIC_DEMO_MODE === 'true' ||
             document.querySelector('meta[name="demo-mode"]')?.getAttribute('content') === 'true';
    });
    
    console.log(`📱 Application loaded. Demo mode: ${isDemoMode}`);
    
    // If not in demo mode, create test user session
    if (!isDemoMode) {
      const authHelper = new AuthHelper(page);
      await authHelper.setupTestUser();
      console.log('👤 Test user session created');
    }
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;