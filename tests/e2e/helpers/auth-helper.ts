import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async setupTestUser() {
    // This would setup a test user in the system
    // For now, we'll work with demo mode
    console.log('Setting up test user session...');
  }

  async login(email: string = 'test@airwave.com', password: string = 'testpass123') {
    await this.page.goto('/login');
    
    // Wait for login form to load
    await this.page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
    
    // Fill in credentials (target the actual input elements within MUI TextFields)
    await this.page.fill('[data-testid="email-input"] input', email);
    await this.page.fill('[data-testid="password-input"] input', password);
    
    // Submit form
    await this.page.click('[data-testid="sign-in-button"]');
    
    // Wait for successful login (redirect to dashboard)
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // Verify we're logged in
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async loginWithDemo() {
    await this.page.goto('/login');
    
    // Wait for demo login button to load
    await this.page.waitForSelector('[data-testid="demo-login-button"]', { timeout: 10000 });
    
    // Click demo login
    await this.page.click('[data-testid="demo-login-button"]');
    
    // Wait for redirect to home page
    await this.page.waitForURL('**/', { timeout: 15000 });
    
    // Should redirect to dashboard if logged in
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  async logout() {
    // Use dispatchEvent to bypass nextjs portal interception
    await this.page.evaluate(() => {
      const userMenuButton = document.querySelector('[data-testid="user-menu"]');
      if (userMenuButton) {
        userMenuButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    
    // Wait for menu to be fully visible
    await this.page.waitForSelector('[data-testid="logout-button"]', { state: 'visible' });
    
    // Use dispatchEvent for logout button as well
    await this.page.evaluate(() => {
      const logoutButton = document.querySelector('[data-testid="logout-button"]');
      if (logoutButton) {
        logoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    
    // Wait for redirect to login page with longer timeout
    await this.page.waitForURL('**/login', { timeout: 20000 });
  }

  async ensureLoggedIn(email?: string, password?: string) {
    // Check if already logged in
    const currentUrl = this.page.url();
    
    if (currentUrl.includes('/login') || currentUrl === '/') {
      await this.login(email, password);
    }
    
    // Verify we're on a protected page
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async selectClient(clientName: string = 'Demo Agency') {
    // Wait for client selector to be available
    await this.page.waitForSelector('[data-testid="client-selector"]', { timeout: 10000 });
    
    // Use dispatchEvent to bypass nextjs portal interception
    await this.page.evaluate(() => {
      const clientSelector = document.querySelector('[data-testid="client-selector"]');
      if (clientSelector) {
        clientSelector.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    
    // Wait for dropdown to open
    await this.page.waitForSelector('[data-testid="client-option"]', { timeout: 5000 });
    
    // Select the specified client using dispatchEvent
    await this.page.evaluate((name) => {
      const options = document.querySelectorAll('[data-testid="client-option"]');
      for (const option of options) {
        const primaryText = option.querySelector('.MuiListItemText-primary');
        if (primaryText?.textContent?.includes(name)) {
          option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          break;
        }
      }
    }, clientName);
    
    // Wait for client to be selected
    await expect(this.page.locator('[data-testid="selected-client"]')).toContainText(clientName);
  }

  async isInDemoMode(): Promise<boolean> {
    // Check the Next.js __NEXT_DATA__ script tag for runtime config
    return await this.page.evaluate(() => {
      const nextData = document.getElementById('__NEXT_DATA__');
      if (nextData) {
        try {
          const data = JSON.parse(nextData.textContent || '{}');
          return data.runtimeConfig?.NEXT_PUBLIC_DEMO_MODE === 'true';
        } catch (e) {
          // Fallback to checking window object
        }
      }
      
      // Alternative: check if demo mode is enabled via window object or meta tag
      return (window as any).__NEXT_PUBLIC_DEMO_MODE === 'true' ||
             document.querySelector('meta[name="demo-mode"]')?.getAttribute('content') === 'true';
    });
  }
}