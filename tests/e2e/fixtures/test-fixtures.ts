import { test as base, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { FileHelper } from '../helpers/file-helper';
import { WebSocketHelper } from '../helpers/websocket-helper';

// Extend the base test with our custom fixtures
export const test = base.extend<{
  authHelper: AuthHelper;
  fileHelper: FileHelper;
  wsHelper: WebSocketHelper;
  authenticatedPage: Page;
}>({
  // Auth helper fixture
  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },

  // File helper fixture
  fileHelper: async ({ page }, use) => {
    const fileHelper = new FileHelper(page);
    await use(fileHelper);
  },

  // WebSocket helper fixture
  wsHelper: async ({ page }, use) => {
    const wsHelper = new WebSocketHelper(page);
    await wsHelper.setupWebSocketListeners();
    await use(wsHelper);
  },

  // Pre-authenticated page fixture
  authenticatedPage: async ({ page, authHelper }, use) => {
    // Check if we need to authenticate
    await page.goto('/');
    const isDemoMode = await authHelper.isInDemoMode();
    
    if (!isDemoMode) {
      // Explicitly login if not in demo mode
      await authHelper.login('test@airwave.com', 'testpass123');
      
      // Wait for dashboard to load
      await page.waitForLoadState('networkidle');
      
      // Verify we're authenticated by checking for user menu
      await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
    } else {
      // In demo mode, just wait for the app to load
      await page.waitForLoadState('networkidle');
    }
    
    await use(page);
  },
});

export { expect } from '@playwright/test';