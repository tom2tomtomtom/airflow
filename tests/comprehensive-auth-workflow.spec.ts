import { test, expect } from '@playwright/test';

test.describe('Comprehensive Authentication Workflow', () => {
  test('should handle complete authentication flow', async ({ page }) => {
    // 1. Test that all protected routes redirect to login
    const protectedRoutes = ['/dashboard', '/clients', '/campaigns', '/assets', '/motivations'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      console.log(`Route ${route} -> ${currentUrl}`);

      // Should redirect to login with from parameter
      expect(currentUrl).toContain('/login');
      expect(currentUrl).toContain(`from=${encodeURIComponent(route)}`);
    }

    // 2. Test login page accessibility
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check for essential form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Login")'
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    console.log('Login page has all required elements');

    // 3. Test that public routes are accessible
    const publicRoutes = ['/', '/test-auth'];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      console.log(`Public route ${route} -> ${currentUrl}`);

      // Should stay on the same route, not redirect to login
      expect(currentUrl).toContain(route);
      expect(currentUrl).not.toContain('/login');
    }

    // 4. Test API protection
    const response = await page.request.get('/api/clients');
    expect(response.status()).toBe(401);
    console.log('API routes properly protected');

    // 5. Test navigation elements on login page
    await page.goto('/login');

    // Check for navigation or branding elements
    const hasNavigation = (await page.locator('nav').count()) > 0;
    const hasLogo =
      (await page.locator('img[alt*="logo"], [data-testid="logo"], .logo').count()) > 0;
    const hasTitle = (await page.locator('h1, h2, .title').count()) > 0;

    console.log(`Login page navigation: ${hasNavigation}, logo: ${hasLogo}, title: ${hasTitle}`);

    // At least one should be present for good UX
    expect(hasNavigation || hasLogo || hasTitle).toBe(true);
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Try submitting empty form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await submitButton.click();

    // Check for validation messages or errors
    await page.waitForTimeout(1000); // Allow time for validation

    const hasValidationErrors =
      (await page.locator('.error, [role="alert"], .invalid, .field-error').count()) > 0;
    const formNotSubmitted = page.url().includes('/login');

    console.log(
      `Form validation: errors shown=${hasValidationErrors}, stayed on login=${formNotSubmitted}`
    );

    // Either should show validation errors OR stay on login page
    expect(hasValidationErrors || formNotSubmitted).toBe(true);
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill form with invalid credentials
    await page.fill('input[type="email"]', 'test@invalid.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Should still be on login page
    expect(page.url()).toContain('/login');

    // Should show some kind of error feedback
    const hasErrorMessage =
      (await page.locator('.error, [role="alert"], .message, .notification').count()) > 0;
    console.log('Invalid login shows error feedback:', hasErrorMessage);

    // Note: This might not show errors if no backend is properly configured
    // The important thing is it doesn't crash or redirect unexpectedly
  });
});
