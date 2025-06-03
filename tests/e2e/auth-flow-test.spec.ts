import { test, expect } from '@playwright/test';

test.describe('Authentication Flow with Session Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all cookies and storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should login and maintain session across page refreshes', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('[data-testid="email-input"] input', 'test@example.com');
    await page.fill('[data-testid="password-input"] input', 'testpassword123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Check for user info on dashboard
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 5000 });
    
    // Refresh the page
    await page.reload();
    
    // Should still be on dashboard after refresh (session persisted)
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 5000 });
    
    // Navigate to another protected page
    await page.goto('/campaigns');
    expect(page.url()).toContain('/campaigns');
    
    // Should not redirect to login
    expect(page.url()).not.toContain('/login');
  });

  test('should handle token refresh automatically', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"] input', 'test@example.com');
    await page.fill('[data-testid="password-input"] input', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // Get initial session data
    const initialSession = await page.evaluate(() => {
      return localStorage.getItem('airwave-auth');
    });
    
    expect(initialSession).toBeTruthy();
    
    // Wait for some time (simulate token aging)
    await page.waitForTimeout(2000);
    
    // Make an API request that would trigger token validation
    const response = await page.request.get('/api/auth/me');
    expect(response.status()).toBe(200);
    
    // Session should still be valid
    const currentSession = await page.evaluate(() => {
      return localStorage.getItem('airwave-auth');
    });
    
    expect(currentSession).toBeTruthy();
  });

  test('should redirect to login when session expires', async ({ page }) => {
    // Navigate directly to a protected route without logging in
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
    
    // Should preserve the original destination
    const url = new URL(page.url());
    expect(url.searchParams.get('from')).toBe('/dashboard');
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"] input', 'test@example.com');
    await page.fill('[data-testid="password-input"] input', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // Click logout button
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
    
    // Session should be cleared
    const session = await page.evaluate(() => {
      return localStorage.getItem('airwave-auth');
    });
    expect(session).toBeNull();
    
    // Trying to access dashboard should redirect to login
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('should handle concurrent requests without authentication loops', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"] input', 'test@example.com');
    await page.fill('[data-testid="password-input"] input', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // Make multiple concurrent API requests
    const requests = Array(5).fill(null).map(() => 
      page.request.get('/api/auth/me')
    );
    
    const responses = await Promise.all(requests);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Should still be on dashboard
    expect(page.url()).toContain('/dashboard');
  });
});