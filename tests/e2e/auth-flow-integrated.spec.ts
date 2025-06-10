/**
 * Integrated Authentication Flow Tests
 * Combines functional testing with UX validation
 * Tests both "it works" and "it feels good" aspects
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';
import { APIMockHelper } from '../utils/api-mock-helper';

test.describe('Authentication Flow - Integrated Testing', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let apiMockHelper: APIMockHelper;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    apiMockHelper = new APIMockHelper(page);
    
    // Setup default API mocks
    await apiMockHelper.setupDefaultMocks();
  });

  test.describe('Login Experience', () => {
    test('successful login feels smooth and responsive', async ({ page }) => {
      // FUNCTIONAL: Login works correctly
      // UX: Login experience is smooth and provides good feedback
      
      await test.step('Navigate to login page', async () => {
        const startTime = Date.now();
        await authPage.gotoLogin();
        const loadTime = Date.now() - startTime;
        
        // UX: Page loads quickly (under 2 seconds)
        expect(loadTime).toBeLessThan(2000);
        
        // FUNCTIONAL: All elements present
        await authPage.verifyLoginPageElements();
      });

      await test.step('Form interactions feel responsive', async () => {
        // UX: Input focus states work immediately
        await authPage.emailInput.click();
        await expect(authPage.emailInput).toBeFocused();
        
        // UX: Typing feels immediate (no delay)
        const typingStartTime = Date.now();
        await authPage.emailInput.type('user@airwave-test.com');
        const typingTime = Date.now() - typingStartTime;
        expect(typingTime).toBeLessThan(500); // Should type quickly
        
        await authPage.passwordInput.type('TestPass123!');
      });

      await test.step('Loading states provide clear feedback', async () => {
        // UX: Button shows loading state immediately when clicked
        const clickTime = Date.now();
        await authPage.loginButton.click();
        
        // UX: Loading indicator appears quickly
        await expect(authPage.submitButtonLoading).toBeVisible({ timeout: 200 });
        
        // UX: Form is disabled during loading
        await expect(authPage.emailInput).toBeDisabled();
        await expect(authPage.passwordInput).toBeDisabled();
        
        // FUNCTIONAL: Login succeeds and redirects
        await page.waitForURL('/dashboard', { timeout: 15000 });
        const totalLoginTime = Date.now() - clickTime;
        
        // UX: Login completes in reasonable time
        expect(totalLoginTime).toBeLessThan(5000);
      });

      await test.step('Post-login experience is immediate', async () => {
        // UX: Dashboard loads quickly after login
        await dashboardPage.waitForLoad();
        
        // FUNCTIONAL: User is properly authenticated
        await dashboardPage.verifyUserIsLoggedIn();
        
        // UX: Welcome message is personal and clear
        await expect(dashboardPage.welcomeMessage).toBeVisible();
        const welcomeText = await dashboardPage.welcomeMessage.textContent();
        expect(welcomeText).toMatch(/welcome|hello|dashboard/i);
      });
    });

    test('login errors are helpful and clear', async ({ page }) => {
      // FUNCTIONAL: Error handling works
      // UX: Error messages are helpful and don't frustrate users
      
      await authPage.gotoLogin();

      await test.step('Invalid credentials show helpful error', async () => {
        await authPage.loginAndExpectError('wrong@email.com', 'wrongpassword');
        
        // UX: Error message is clear and actionable
        const errorText = await authPage.getErrorMessage();
        expect(errorText).toMatch(/invalid|incorrect|credential/i);
        
        // UX: Error appears quickly (not hanging)
        await expect(authPage.errorMessage).toBeVisible({ timeout: 3000 });
      });

      await test.step('Error messages clear when user starts fixing', async () => {
        // UX: Errors clear when user makes changes
        await authPage.emailInput.fill('better@email.com');
        
        // UX: Error should disappear when user starts typing
        await expect(authPage.errorMessage).not.toBeVisible({ timeout: 1000 });
      });

      await test.step('Form validation is immediate and helpful', async () => {
        // Clear form first
        await authPage.emailInput.clear();
        await authPage.passwordInput.clear();
        
        // UX: Invalid email format shows immediate feedback
        await authPage.emailInput.fill('invalid-email');
        await authPage.passwordInput.click(); // Trigger validation
        
        // UX: Validation appears quickly
        await expect(authPage.validationErrors).toBeVisible({ timeout: 1000 });
      });
    });

    test('keyboard navigation works seamlessly', async ({ page }) => {
      // FUNCTIONAL: Keyboard navigation works
      // UX: Keyboard users have smooth experience
      
      await authPage.gotoLogin();

      await test.step('Tab navigation flows logically', async () => {
        // UX: Tab order makes sense
        await page.keyboard.press('Tab');
        await expect(authPage.emailInput).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(authPage.passwordInput).toBeFocused();
        
        await page.keyboard.press('Tab');
        // Skip remember me if present, focus should go to login button
        if (await authPage.rememberMeCheckbox.isVisible()) {
          await expect(authPage.rememberMeCheckbox).toBeFocused();
          await page.keyboard.press('Tab');
        }
        
        await expect(authPage.loginButton).toBeFocused();
      });

      await test.step('Enter key submission works from password field', async () => {
        await authPage.emailInput.fill('user@airwave-test.com');
        await authPage.passwordInput.fill('TestPass123!');
        
        // UX: Enter key submits form
        await page.keyboard.press('Enter');
        
        // FUNCTIONAL: Login attempt is made
        await page.waitForURL('/dashboard', { timeout: 15000 });
      });
    });

    test('mobile login experience is optimized', async ({ page }) => {
      // FUNCTIONAL: Login works on mobile
      // UX: Mobile experience is touch-friendly and fast
      
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      
      await test.step('Mobile layout is touch-friendly', async () => {
        await authPage.gotoLogin();
        
        // UX: Form elements are appropriately sized for touch
        const emailBounds = await authPage.emailInput.boundingBox();
        expect(emailBounds?.height).toBeGreaterThan(44); // Minimum touch target
        
        const passwordBounds = await authPage.passwordInput.boundingBox();
        expect(passwordBounds?.height).toBeGreaterThan(44);
        
        const buttonBounds = await authPage.loginButton.boundingBox();
        expect(buttonBounds?.height).toBeGreaterThan(44);
      });

      await test.step('Mobile input experience is smooth', async () => {
        // UX: Email input has proper keyboard type
        await authPage.emailInput.click();
        const emailType = await authPage.emailInput.getAttribute('type');
        expect(emailType).toBe('email'); // Triggers email keyboard on mobile
        
        // UX: Password input has proper type
        await authPage.passwordInput.click();
        const passwordType = await authPage.passwordInput.getAttribute('type');
        expect(passwordType).toBe('password'); // Hides text appropriately
      });

      await test.step('Mobile login completes successfully', async () => {
        await authPage.emailInput.fill('user@airwave-test.com');
        await authPage.passwordInput.fill('TestPass123!');
        await authPage.loginButton.click();
        
        // FUNCTIONAL: Mobile login works
        await page.waitForURL('/dashboard');
        
        // UX: Mobile dashboard is usable
        await dashboardPage.testMobileLayout();
      });
    });
  });

  test.describe('Signup Experience', () => {
    test('signup flow is intuitive and encouraging', async ({ page }) => {
      // FUNCTIONAL: Signup works correctly
      // UX: Signup flow encourages completion and feels trustworthy
      
      await test.step('Signup form is welcoming and clear', async () => {
        await authPage.gotoSignup();
        
        // UX: All elements are clearly labeled
        await authPage.verifySignupPageElements();
        
        // UX: Page loads quickly
        const pageTitle = await page.title();
        expect(pageTitle).toMatch(/sign.*up|register|join/i);
      });

      await test.step('Form provides helpful guidance', async () => {
        // UX: Password requirements are clear
        await authPage.passwordInput.click();
        
        // Check if password requirements are shown
        const passwordHelp = page.locator('[data-testid="password-requirements"]');
        if (await passwordHelp.isVisible()) {
          const helpText = await passwordHelp.textContent();
          expect(helpText).toMatch(/8.*character|uppercase|lowercase|number/i);
        }
      });

      await test.step('Signup completion feels successful', async () => {
        await authPage.signupAndExpectSuccess(
          'Test User',
          'newuser@airwave-test.com',
          'SecurePass123!'
        );
        
        // UX: Success is clearly communicated
        const isOnDashboard = page.url().includes('/dashboard');
        const hasSuccessMessage = await authPage.successMessage.isVisible();
        
        expect(isOnDashboard || hasSuccessMessage).toBeTruthy();
        
        if (isOnDashboard) {
          // UX: New user sees welcoming dashboard
          await dashboardPage.verifyUserIsLoggedIn();
        }
      });
    });

    test('password confirmation provides immediate feedback', async ({ page }) => {
      // FUNCTIONAL: Password confirmation works
      // UX: Users get immediate feedback on password matching
      
      await authPage.gotoSignup();

      await test.step('Password mismatch is caught immediately', async () => {
        await authPage.nameInput.fill('Test User');
        await authPage.emailInput.fill('test@example.com');
        await authPage.passwordInput.fill('Password123!');
        await authPage.confirmPasswordInput.fill('DifferentPassword123!');
        
        // UX: Mismatch should be shown when confirm field loses focus
        await authPage.signupButton.click();
        
        // UX: Clear error message about password mismatch
        await expect(authPage.validationErrors).toBeVisible();
        const errorText = await authPage.validationErrors.textContent();
        expect(errorText).toMatch(/password.*match|confirm.*password/i);
      });

      await test.step('Password match provides positive feedback', async () => {
        await authPage.confirmPasswordInput.clear();
        await authPage.confirmPasswordInput.fill('Password123!');
        
        // UX: Positive feedback when passwords match
        await authPage.nameInput.click(); // Trigger validation
        
        // Error should be gone
        await expect(authPage.validationErrors).not.toBeVisible();
      });
    });
  });

  test.describe('Session Management Experience', () => {
    test('session persistence works transparently', async ({ page }) => {
      // FUNCTIONAL: Sessions persist correctly
      // UX: Users don't lose their work unexpectedly
      
      await test.step('Login with remember me persists across browser restart', async () => {
        await authHelper.login('user@airwave-test.com', 'TestPass123!');
        await dashboardPage.verifyUserIsLoggedIn();
        
        // Simulate browser restart by clearing session but keeping local storage
        await page.evaluate(() => {
          sessionStorage.clear();
        });
        
        await page.reload();
        
        // UX: User remains logged in
        await dashboardPage.verifyUserIsLoggedIn();
      });

      await test.step('Session expiry is handled gracefully', async () => {
        // Simulate session expiry
        await page.evaluate(() => {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        });
        
        // Try to access protected page
        await page.goto('/dashboard');
        
        // UX: Graceful redirect to login
        await page.waitForURL('/login');
        
        // UX: Helpful message about session expiry
        const currentUrl = page.url();
        expect(currentUrl).toContain('/login');
      });
    });

    test('concurrent session limit is handled user-friendly', async ({ page, browser }) => {
      // FUNCTIONAL: Session limits are enforced
      // UX: Users understand why they're being logged out
      
      await test.step('Multiple sessions are handled gracefully', async () => {
        // Login in first session
        await authHelper.login('user@airwave-test.com', 'TestPass123!');
        await dashboardPage.verifyUserIsLoggedIn();
        
        // Create second browser context (simulating different device/browser)
        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        
        const authHelper2 = new AuthHelper(page2);
        
        try {
          // Login in second session (might trigger session limit)
          await authHelper2.login('user@airwave-test.com', 'TestPass123!');
          
          // If session limit is enforced, first session should get notification
          // UX: User is informed about session displacement
          const notificationMessage = page.locator('[data-testid="session-displacement-notification"]');
          if (await notificationMessage.isVisible({ timeout: 2000 })) {
            const message = await notificationMessage.textContent();
            expect(message).toMatch(/session.*another.*device|logged.*out/i);
          }
        } finally {
          await context2.close();
        }
      });
    });
  });

  test.describe('Error Recovery Experience', () => {
    test('network errors are handled gracefully', async ({ page }) => {
      // FUNCTIONAL: Network errors don't break the app
      // UX: Users understand what happened and how to recover
      
      await test.step('Login during network failure shows helpful message', async () => {
        // Simulate network failure
        await page.route('**/api/auth/login', route => route.abort());
        
        await authPage.gotoLogin();
        await authPage.emailInput.fill('user@airwave-test.com');
        await authPage.passwordInput.fill('TestPass123!');
        await authPage.loginButton.click();
        
        // UX: Network error is explained clearly
        await expect(authPage.errorMessage).toBeVisible({ timeout: 10000 });
        const errorText = await authPage.getErrorMessage();
        expect(errorText).toMatch(/network|connection|try.*again/i);
        
        // UX: Form is re-enabled for retry
        await expect(authPage.loginButton).toBeEnabled();
      });

      await test.step('Retry after network recovery works', async () => {
        // Restore network
        await page.unroute('**/api/auth/login');
        
        // UX: Retry button or auto-retry works
        await authPage.loginButton.click();
        
        // FUNCTIONAL: Login succeeds after network recovery
        await page.waitForURL('/dashboard', { timeout: 15000 });
      });
    });

    test('server errors provide actionable guidance', async ({ page }) => {
      // FUNCTIONAL: Server errors are handled
      // UX: Users know what to do when things go wrong
      
      await test.step('Server error shows helpful message', async () => {
        // Mock server error
        await apiMockHelper.mockAPI(/.*\/api\/auth\/login.*/, {
          status: 500,
          body: { error: 'Internal server error' }
        });
        
        await authPage.gotoLogin();
        await authPage.loginAndExpectError('user@airwave-test.com', 'TestPass123!');
        
        // UX: Error message is helpful, not technical
        const errorText = await authPage.getErrorMessage();
        expect(errorText).toMatch(/try.*again|server.*problem|contact.*support/i);
        expect(errorText).not.toMatch(/500|internal.*error|stack.*trace/i);
      });
    });
  });

  test.describe('Accessibility and Inclusive Design', () => {
    test('screen reader users can login successfully', async ({ page }) => {
      // FUNCTIONAL: Screen readers can access all functionality
      // UX: Experience is inclusive and doesn't exclude users
      
      await authPage.gotoLogin();

      await test.step('Form elements have proper labels', async () => {
        // UX: All inputs are properly labeled for screen readers
        const emailLabel = await authPage.emailInput.getAttribute('aria-label') || 
                           await authPage.emailInput.getAttribute('placeholder');
        expect(emailLabel).toMatch(/email/i);
        
        const passwordLabel = await authPage.passwordInput.getAttribute('aria-label') || 
                             await authPage.passwordInput.getAttribute('placeholder');
        expect(passwordLabel).toMatch(/password/i);
      });

      await test.step('Error messages are announced to screen readers', async () => {
        await authPage.loginAndExpectError('wrong@email.com', 'wrongpassword');
        
        // UX: Error has proper ARIA attributes
        const errorRole = await authPage.errorMessage.getAttribute('role');
        const errorAria = await authPage.errorMessage.getAttribute('aria-live');
        
        expect(errorRole || errorAria).toBeTruthy(); // Should have role="alert" or aria-live
      });

      await test.step('Loading states are announced', async () => {
        await authPage.emailInput.fill('user@airwave-test.com');
        await authPage.passwordInput.fill('TestPass123!');
        await authPage.loginButton.click();
        
        // UX: Loading state has screen reader text
        const buttonText = await authPage.loginButton.textContent();
        expect(buttonText).toMatch(/loading|signing.*in|please.*wait/i);
      });
    });
  });

  test.describe('Performance Under Load', () => {
    test('login performance remains good under realistic conditions', async ({ page }) => {
      // FUNCTIONAL: System handles normal load
      // UX: Performance doesn't degrade user experience
      
      await test.step('Login completes quickly even with slow network', async () => {
        // Simulate slower network
        await page.route('**/api/auth/login', async route => {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          await route.continue();
        });
        
        const startTime = Date.now();
        await authHelper.login('user@airwave-test.com', 'TestPass123!');
        const totalTime = Date.now() - startTime;
        
        // UX: Even with slow network, total time is reasonable
        expect(totalTime).toBeLessThan(8000); // Should complete within 8 seconds
        
        // FUNCTIONAL: Login still succeeds
        await dashboardPage.verifyUserIsLoggedIn();
      });
    });
  });
});

// Setup and teardown
test.afterEach(async ({ page }) => {
  // Clean up any test state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});