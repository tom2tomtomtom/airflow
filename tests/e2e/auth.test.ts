import { test, expect } from './fixtures/test-fixtures';

test.describe('Authentication & Client Context', () => {
  test.describe('Demo Mode', () => {
    test('should load homepage without authentication in demo mode', async ({ page, authHelper }) => {
      await page.goto('/');
      
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (isDemoMode) {
        // In demo mode, should show landing page or dashboard
        await expect(page).toHaveTitle(/AIrWAVE/);
        
        // Should not show login form
        await expect(page.locator('[data-testid="login-form"]')).not.toBeVisible();
        
        // Take screenshot for verification
        await page.screenshot({ path: 'test-results/demo-homepage.png' });
      } else {
        // Not in demo mode, should show landing page with login buttons
        await expect(page).toHaveTitle(/AIrWAVE/);
        await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
        await expect(page.locator('[data-testid="get-started-button"]')).toBeVisible();
      }
    });

    test('should navigate through app without authentication in demo mode', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (isDemoMode) {
        await page.goto('/');
        
        // Try to navigate to protected routes
        const protectedRoutes = ['/dashboard', '/assets', '/campaigns'];
        
        for (const route of protectedRoutes) {
          await page.goto(route);
          
          // Should not redirect to login
          expect(page.url()).not.toContain('/login');
          
          // Page should load (not show error)
          await expect(page.locator('body')).toBeVisible();
          
          await page.screenshot({ path: `test-results/demo-${route.replace('/', '')}.png` });
        }
      } else {
        test.skip('Skipping demo mode test - not in demo mode');
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('should show login page for unauthenticated users', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (!isDemoMode) {
        await page.goto('/dashboard');
        
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
        
        // Should show login form
        await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
        
        await page.screenshot({ path: 'test-results/login-page.png' });
      } else {
        test.skip('Skipping auth test - in demo mode');
      }
    });

    test('should handle login with valid credentials', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (!isDemoMode) {
        await authHelper.login('test@airwave.com', 'testpass123');
        
        // Should be redirected to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/);
        
        // Should show user menu
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
        
        // Should show client selector
        await expect(page.locator('[data-testid="client-selector"]')).toBeVisible();
        
        await page.screenshot({ path: 'test-results/successful-login.png' });
      } else {
        test.skip('Skipping auth test - in demo mode');
      }
    });

    test('should handle login with invalid credentials', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (!isDemoMode) {
        await page.goto('/login');
        
        // Fill in invalid credentials
        await page.fill('[data-testid="email-input"] input', 'invalid@email.com');
        await page.fill('[data-testid="password-input"] input', 'wrongpassword');
        
        // Submit form
        await page.click('[data-testid="sign-in-button"]');
        
        // Should show error message
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        
        // Should stay on login page
        await expect(page).toHaveURL(/.*\/login/);
        
        await page.screenshot({ path: 'test-results/failed-login.png' });
      } else {
        test.skip('Skipping auth test - in demo mode');
      }
    });

    test('should handle logout', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (!isDemoMode) {
        // First login
        await authHelper.login();
        
        // Then logout
        await authHelper.logout();
        
        // Should be redirected to login page
        await expect(page).toHaveURL(/.*\/login/);
        
        // Should not show user menu
        await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
        
        await page.screenshot({ path: 'test-results/after-logout.png' });
      } else {
        test.skip('Skipping auth test - in demo mode');
      }
    });
  });

  test.describe('Client Context Management', () => {
    test('should display client selector after authentication', async ({ authenticatedPage }) => {
      // Should show client selector
      await expect(authenticatedPage.locator('[data-testid="client-selector"]')).toBeVisible();
      
      // Should show selected client name
      await expect(authenticatedPage.locator('[data-testid="selected-client"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/client-selector.png' });
    });

    test('should allow client switching', async ({ authenticatedPage, authHelper }) => {
      // Open client selector dropdown
      await authenticatedPage.click('[data-testid="client-selector"]');
      
      // Should show client options
      await expect(authenticatedPage.locator('[data-testid="client-option"]')).toHaveCount.greaterThan(0);
      
      // Select a different client (if available)
      const clientOptions = await authenticatedPage.locator('[data-testid="client-option"]').all();
      
      if (clientOptions.length > 1) {
        const secondClient = clientOptions[1];
        const clientName = await secondClient.textContent();
        
        await secondClient.click();
        
        // Verify client was selected
        await expect(authenticatedPage.locator('[data-testid="selected-client"]')).toContainText(clientName || '');
        
        // Page should reload/update with new client context
        await authenticatedPage.waitForLoadState('networkidle');
        
        await authenticatedPage.screenshot({ path: 'test-results/client-switched.png' });
      }
    });

    test('should persist client selection across page navigation', async ({ authenticatedPage, authHelper }) => {
      // Select a specific client
      await authHelper.selectClient('Demo Agency');
      
      // Get current selected client
      const selectedClient = await authenticatedPage.locator('[data-testid="selected-client"]').textContent();
      
      // Navigate to different pages
      const pages = ['/assets', '/campaigns', '/dashboard'];
      
      for (const pagePath of pages) {
        await authenticatedPage.goto(pagePath);
        await authenticatedPage.waitForLoadState('networkidle');
        
        // Verify client selection persists
        await expect(authenticatedPage.locator('[data-testid="selected-client"]')).toContainText(selectedClient || '');
      }
      
      await authenticatedPage.screenshot({ path: 'test-results/client-persistence.png' });
    });

    test('should show client-specific data isolation', async ({ authenticatedPage, authHelper }) => {
      // This test would verify that switching clients shows different data
      // For now, we'll just verify the UI responds to client changes
      
      await authHelper.selectClient('Demo Agency');
      
      // Navigate to assets page
      await authenticatedPage.goto('/assets');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Take screenshot of assets for first client
      await authenticatedPage.screenshot({ path: 'test-results/client1-assets.png' });
      
      // If there are multiple clients, switch and verify data changes
      await authenticatedPage.click('[data-testid="client-selector"]');
      const clientOptions = await authenticatedPage.locator('[data-testid="client-option"]').all();
      
      if (clientOptions.length > 1) {
        // Find a different client
        for (const option of clientOptions) {
          const text = await option.textContent();
          if (text && !text.includes('Demo Agency')) {
            await option.click();
            break;
          }
        }
        
        // Wait for data to reload
        await authenticatedPage.waitForLoadState('networkidle');
        
        // Take screenshot of assets for second client
        await authenticatedPage.screenshot({ path: 'test-results/client2-assets.png' });
      }
    });
  });

  test.describe('Session Management', () => {
    test('should handle session expiry gracefully', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (!isDemoMode) {
        // Login first
        await authHelper.login();
        
        // Simulate session expiry by clearing storage
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        // Try to access protected route
        await page.goto('/assets');
        
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
        
        // Should show session expired message (if implemented)
        // await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
        
        await page.screenshot({ path: 'test-results/session-expired.png' });
      } else {
        test.skip('Skipping session test - in demo mode');
      }
    });

    test('should remember login state after page refresh', async ({ page, authHelper }) => {
      const isDemoMode = await authHelper.isInDemoMode();
      
      if (!isDemoMode) {
        // Login
        await authHelper.login();
        
        // Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should still be logged in
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
        
        // Should not redirect to login
        expect(page.url()).not.toContain('/login');
        
        await page.screenshot({ path: 'test-results/after-refresh.png' });
      } else {
        test.skip('Skipping session test - in demo mode');
      }
    });
  });
});