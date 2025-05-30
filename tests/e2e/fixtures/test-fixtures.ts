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
    // Navigate to the app
    await page.goto('/');
    
    // Check if we need to authenticate
    const isDemoMode = await authHelper.isInDemoMode();
    
    if (!isDemoMode) {
      // Login if not in demo mode
      await authHelper.ensureLoggedIn();
      
      // Select default test client
      await authHelper.selectClient('Demo Agency');
    } else {
      // In demo mode, just wait for the app to load
      await page.waitForLoadState('networkidle');
    }
    
    await use(page);
  },
});

export { expect } from '@playwright/test';