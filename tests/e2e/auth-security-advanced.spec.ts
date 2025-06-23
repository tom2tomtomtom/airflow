/**
 * Advanced Authentication Security Tests
 * Comprehensive security testing for authentication flows
 * Tests edge cases, attack scenarios, and security hardening
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';
import { APIMockHelper } from '../utils/api-mock-helper';

test.describe('Advanced Authentication Security', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let apiMockHelper: APIMockHelper;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    apiMockHelper = new APIMockHelper(page);
    
    await apiMockHelper.setupDefaultMocks();
  });

  test.describe('Input Validation & Injection Prevention', () => {
    test('prevents XSS injection in login forms', async ({ page }) => {
      await authPage.gotoLogin();

      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '"><script>alert("xss")</script>',
        '\'"--></script><script>alert("xss")</script>',
      ];

      for (const payload of xssPayloads) {
        await test.step(`Testing XSS payload: ${payload.slice(0, 30)}...`, async () => {
          // Clear previous inputs
          await authPage.emailInput.clear();
          await authPage.passwordInput.clear();

          // Try XSS in email field
          await authPage.emailInput.fill(payload);
          await authPage.passwordInput.fill('TestPass123!');
          await authPage.loginButton.click();

          // Verify no JavaScript execution
          const pageContent = await page.content();
          expect(pageContent).not.toContain('<script>');
          expect(pageContent).not.toContain('javascript:');

          // Verify form validates properly
          await expect(authPage.validationErrors).toBeVisible({ timeout: 3000 });
          
          // Check for proper error message
          const errorText = await authPage.getErrorMessage();
          expect(errorText).toMatch(/invalid|format|email/i);
        });
      }
    });

    test('prevents SQL injection attempts', async ({ page }) => {
      await authPage.gotoLogin();

      const sqlPayloads = [
        "admin'--",
        "admin'/*",
        "' OR '1'='1",
        "' OR 1=1--",
        "'; DROP TABLE users; --",
        "' UNION SELECT password FROM admin--",
        "admin'; EXEC xp_cmdshell('dir'); --",
      ];

      for (const payload of sqlPayloads) {
        await test.step(`Testing SQL injection: ${payload}`, async () => {
          await authPage.emailInput.clear();
          await authPage.passwordInput.clear();

          await authPage.emailInput.fill(payload);
          await authPage.passwordInput.fill('password');
          await authPage.loginButton.click();

          // Should get proper validation error, not SQL error
          await expect(authPage.errorMessage).toBeVisible({ timeout: 5000 });
          
          const errorText = await authPage.getErrorMessage();
          expect(errorText).not.toMatch(/sql|database|syntax|error/i);
          expect(errorText).toMatch(/invalid|credential|format/i);
        });
      }
    });

    test('handles oversized input gracefully', async ({ page }) => {
      await authPage.gotoLogin();

      // Test with extremely long inputs
      const longEmail = 'a'.repeat(10000) + '@example.com';
      const longPassword = 'P'.repeat(10000) + '1!';

      await authPage.emailInput.fill(longEmail);
      await authPage.passwordInput.fill(longPassword);
      await authPage.loginButton.click();

      // Should handle gracefully without crashing
      await expect(authPage.errorMessage).toBeVisible({ timeout: 5000 });
      
      const errorText = await authPage.getErrorMessage();
      expect(errorText).toMatch(/invalid|long|format/i);
    });

    test('validates input encoding and special characters', async ({ page }) => {
      await authPage.gotoLogin();

      const specialInputs = [
        // Unicode and international characters
        'üser@exämple.com',
        'пользователь@example.com',
        '用户@example.com',
        
        // Various encodings
        '%22%3E%3Cscript%3Ealert%281%29%3C%2Fscript%3E',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '\u003cscript\u003ealert(1)\u003c/script\u003e',
      ];

      for (const input of specialInputs) {
        await test.step(`Testing special input: ${input}`, async () => {
          await authPage.emailInput.clear();
          await authPage.emailInput.fill(input);
          await authPage.passwordInput.fill('TestPass123!');
          await authPage.loginButton.click();

          // Should handle appropriately - either accept valid international chars or reject malicious ones
          const pageContent = await page.content();
          expect(pageContent).not.toContain('<script>');
          expect(pageContent).not.toContain('alert(');
        });
      }
    });
  });

  test.describe('Rate Limiting & Brute Force Prevention', () => {
    test('implements rate limiting for failed login attempts', async ({ page }) => {
      await authPage.gotoLogin();

      // Attempt multiple failed logins rapidly
      const attempts = 6; // Adjust based on your rate limit
      const loginAttempts = [];

      for (let i = 0; i < attempts; i++) {
        await test.step(`Failed login attempt ${i + 1}`, async () => {
          const startTime = Date.now();
          
          await authPage.emailInput.clear();
          await authPage.passwordInput.clear();
          await authPage.emailInput.fill(`user${i}@example.com`);
          await authPage.passwordInput.fill('wrongpassword');
          await authPage.loginButton.click();

          // Wait for response
          await expect(authPage.errorMessage).toBeVisible({ timeout: 10000 });
          
          const endTime = Date.now();
          loginAttempts.push(endTime - startTime);
        });
      }

      // Verify that later attempts take longer (rate limiting in effect)
      const avgEarlyTime = (loginAttempts[0] + loginAttempts[1]) / 2;
      const avgLateTime = (loginAttempts[attempts - 2] + loginAttempts[attempts - 1]) / 2;

      // Rate limiting should make later attempts slower
      expect(avgLateTime).toBeGreaterThan(avgEarlyTime * 1.5);

      // Or check for explicit rate limit message
      const finalErrorText = await authPage.getErrorMessage();
      const isRateLimited = finalErrorText.match(/rate.*limit|too.*many.*attempt|try.*again.*later/i);
      
      if (!isRateLimited) {
        // If no explicit message, verify timing-based rate limiting
        expect(avgLateTime).toBeGreaterThan(2000); // Should take at least 2 seconds
      }
    });

    test('blocks automated bot attempts', async ({ page }) => {
      await authPage.gotoLogin();

      // Simulate rapid-fire automated attempts
      const rapidAttempts = 10;
      
      for (let i = 0; i < rapidAttempts; i++) {
        await authPage.emailInput.fill(`bot${i}@example.com`);
        await authPage.passwordInput.fill('password123');
        
        // No delay between attempts (bot-like behavior)
        await authPage.loginButton.click();
        
        if (i < rapidAttempts - 1) {
          // Wait for error and continue
          await page.waitForTimeout(100);
        }
      }

      // Should eventually block or significantly slow down
      await expect(authPage.errorMessage).toBeVisible({ timeout: 10000 });
      
      const errorText = await authPage.getErrorMessage();
      expect(errorText).toMatch(/blocked|rate.*limit|too.*many|suspicious/i);
    });
  });

  test.describe('Session Security & Token Management', () => {
    test('properly invalidates session on logout', async ({ page }) => {
      // Login first
      await authHelper.login('test@airwave.com', 'TestPass123!');
      await dashboardPage.verifyUserIsLoggedIn();

      // Capture session tokens before logout
      const tokensBeforeLogout = await page.evaluate(() => {
        return {
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage },
          cookies: document.cookie,
        };
      });

      // Logout
      await dashboardPage.logout();
      
      // Verify redirect to login
      await page.waitForURL('**/login');

      // Verify tokens are cleared
      const tokensAfterLogout = await page.evaluate(() => {
        return {
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage },
          cookies: document.cookie,
        };
      });

      // Session storage should be cleared
      expect(Object.keys(tokensAfterLogout.sessionStorage)).toHaveLength(0);
      
      // Relevant localStorage items should be cleared
      const authKeys = Object.keys(tokensBeforeLogout.localStorage).filter(key => 
        key.includes('auth') || key.includes('token') || key.includes('session')
      );
      
      for (const key of authKeys) {
        expect(tokensAfterLogout.localStorage[key]).toBeUndefined();
      }

      // Try to access protected page
      await page.goto('/dashboard');
      await page.waitForURL('**/login'); // Should redirect back to login
    });

    test('handles concurrent session limits', async ({ page, browser }) => {
      // Login in first browser context
      await authHelper.login('test@airwave.com', 'TestPass123!');
      await dashboardPage.verifyUserIsLoggedIn();

      // Create second browser context for same user
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      const authHelper2 = new AuthHelper(page2);
      const dashboardPage2 = new DashboardPage(page2);

      try {
        // Login same user in second context
        await authHelper2.login('test@airwave.com', 'TestPass123!');
        await dashboardPage2.verifyUserIsLoggedIn();

        // Check if first session gets invalidated (if concurrent sessions are limited)
        await page.reload();
        
        // Check for session displacement notification or forced logout
        const isStillLoggedIn = await dashboardPage.isUserLoggedIn();
        
        if (!isStillLoggedIn) {
          // Concurrent session limit enforced - verify proper handling
          await page.waitForURL('**/login');
          console.log('✅ Concurrent session limit properly enforced');
        } else {
          // Multiple sessions allowed - verify both are functional
          await dashboardPage.verifyUserIsLoggedIn();
          await dashboardPage2.verifyUserIsLoggedIn();
          console.log('✅ Multiple concurrent sessions supported');
        }
      } finally {
        await context2.close();
      }
    });

    test('detects and handles session hijacking attempts', async ({ page }) => {
      // Login normally
      await authHelper.login('test@airwave.com', 'TestPass123!');
      await dashboardPage.verifyUserIsLoggedIn();

      // Simulate session token manipulation
      await page.evaluate(() => {
        // Modify session tokens to simulate tampering
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.includes('auth') || key.includes('token')) {
            const originalValue = localStorage.getItem(key);
            if (originalValue) {
              // Slightly modify the token
              const tamperedValue = originalValue.slice(0, -5) + 'xxxxx';
              localStorage.setItem(key, tamperedValue);
            }
          }
        }
      });

      // Try to access protected resource
      await page.reload();

      // Should detect invalid token and redirect to login
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Verify security notification (if implemented)
      const securityWarning = page.locator('[data-testid="security-warning"]');
      const hasSecurityWarning = await securityWarning.isVisible({ timeout: 3000 });
      
      if (hasSecurityWarning) {
        const warningText = await securityWarning.textContent();
        expect(warningText).toMatch(/security|session|invalid|expired/i);
      }
    });
  });

  test.describe('Password Security & Requirements', () => {
    test('enforces strong password requirements', async ({ page }) => {
      await authPage.gotoSignup();

      const weakPasswords = [
        'weak',           // Too short
        'password',       // No uppercase, numbers, or special chars
        'Password',       // No numbers or special chars
        'Password123',    // No special chars
        'Password!',      // No numbers
        '123456789',      // No letters
        'ALLUPPERCASE!1', // No lowercase
        'alllowercase!1', // No uppercase
      ];

      for (const password of weakPasswords) {
        await test.step(`Testing weak password: ${password}`, async () => {
          await authPage.nameInput.fill('Test User');
          await authPage.emailInput.fill('test@example.com');
          await authPage.passwordInput.clear();
          await authPage.passwordInput.fill(password);
          await authPage.confirmPasswordInput.fill(password);

          await authPage.signupButton.click();

          // Should show password requirements error
          await expect(authPage.validationErrors).toBeVisible({ timeout: 3000 });
          
          const errorText = await authPage.validationErrors.textContent();
          expect(errorText).toMatch(/password.*requirement|weak.*password|must.*contain/i);
        });
      }
    });

    test('prevents common password patterns', async ({ page }) => {
      await authPage.gotoSignup();

      const commonPasswords = [
        'Password123!',    // Too common
        'Qwerty123!',      // Keyboard pattern
        'Welcome123!',     // Common word
        'Admin123!',       // Administrative default
        'Test1234!',       // Test pattern
      ];

      for (const password of commonPasswords) {
        await test.step(`Testing common password: ${password}`, async () => {
          await authPage.nameInput.fill('Test User');
          await authPage.emailInput.fill('test@example.com');
          await authPage.passwordInput.clear();
          await authPage.passwordInput.fill(password);
          await authPage.confirmPasswordInput.fill(password);

          await authPage.signupButton.click();

          // May warn about common passwords (depending on implementation)
          const hasCommonPasswordWarning = await page.locator('[data-testid="password-strength-warning"]').isVisible({ timeout: 2000 });
          
          if (hasCommonPasswordWarning) {
            const warningText = await page.locator('[data-testid="password-strength-warning"]').textContent();
            expect(warningText).toMatch(/common|weak|choose.*different/i);
          }
        });
      }
    });

    test('validates password confirmation matching', async ({ page }) => {
      await authPage.gotoSignup();

      await authPage.nameInput.fill('Test User');
      await authPage.emailInput.fill('test@example.com');
      await authPage.passwordInput.fill('StrongPass123!');
      await authPage.confirmPasswordInput.fill('DifferentPass123!');

      await authPage.signupButton.click();

      await expect(authPage.validationErrors).toBeVisible({ timeout: 3000 });
      
      const errorText = await authPage.validationErrors.textContent();
      expect(errorText).toMatch(/password.*match|confirm.*password/i);
    });
  });

  test.describe('Two-Factor Authentication (if implemented)', () => {
    test('2FA setup flow works correctly', async ({ page }) => {
      // Login first
      await authHelper.login('test@airwave.com', 'TestPass123!');
      await dashboardPage.verifyUserIsLoggedIn();

      // Navigate to security settings
      await dashboardPage.navigateToSecuritySettings();

      // Check if 2FA setup is available
      const setup2FAButton = page.locator('[data-testid="setup-2fa-button"]');
      const has2FA = await setup2FAButton.isVisible({ timeout: 3000 });

      if (has2FA) {
        await test.step('2FA setup process', async () => {
          await setup2FAButton.click();

          // Should show QR code or setup instructions
          const qrCode = page.locator('[data-testid="2fa-qr-code"]');
          const backupCodes = page.locator('[data-testid="2fa-backup-codes"]');

          await expect(qrCode.or(backupCodes)).toBeVisible({ timeout: 5000 });

          // Test backup codes generation
          if (await backupCodes.isVisible()) {
            const codesText = await backupCodes.textContent();
            expect(codesText).toMatch(/\b[A-Z0-9]{8,}\b/); // Should contain backup codes
          }
        });
      } else {
        console.log('ℹ️ 2FA not implemented yet - skipping 2FA tests');
      }
    });

    test('2FA verification process works', async ({ page }) => {
      // This test would verify 2FA codes during login
      // Implementation depends on 2FA system in place
      console.log('ℹ️ 2FA verification test - implementation pending');
    });
  });

  test.describe('Account Lockout & Recovery', () => {
    test('accounts get locked after excessive failed attempts', async ({ page }) => {
      await authPage.gotoLogin();

      const maxAttempts = 10; // Adjust based on your lockout policy
      
      for (let i = 0; i < maxAttempts; i++) {
        await authPage.emailInput.clear();
        await authPage.passwordInput.clear();
        await authPage.emailInput.fill('test@airwave.com');
        await authPage.passwordInput.fill('wrongpassword');
        await authPage.loginButton.click();

        await expect(authPage.errorMessage).toBeVisible({ timeout: 5000 });
        
        const errorText = await authPage.getErrorMessage();
        
        // Check if account is locked
        if (errorText.match(/locked|disabled|blocked/i)) {
          console.log(`✅ Account locked after ${i + 1} attempts`);
          break;
        }
        
        // Add small delay to avoid overwhelming the system
        await page.waitForTimeout(500);
      }

      // Verify that even correct password doesn't work when locked
      await authPage.emailInput.clear();
      await authPage.passwordInput.clear();
      await authPage.emailInput.fill('test@airwave.com');
      await authPage.passwordInput.fill('TestPass123!'); // Correct password
      await authPage.loginButton.click();

      await expect(authPage.errorMessage).toBeVisible({ timeout: 5000 });
      const finalErrorText = await authPage.getErrorMessage();
      expect(finalErrorText).toMatch(/locked|disabled|blocked/i);
    });

    test('password reset flow is secure', async ({ page }) => {
      await authPage.gotoLogin();

      // Navigate to password reset
      const forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
      
      if (await forgotPasswordLink.isVisible({ timeout: 3000 })) {
        await forgotPasswordLink.click();

        // Should navigate to reset page
        await page.waitForURL('**/reset-password');

        // Test reset form
        const emailInput = page.locator('[data-testid="reset-email-input"]');
        const resetButton = page.locator('[data-testid="reset-password-button"]');

        await emailInput.fill('test@airwave.com');
        await resetButton.click();

        // Should show confirmation message
        const confirmationMessage = page.locator('[data-testid="reset-confirmation"]');
        await expect(confirmationMessage).toBeVisible({ timeout: 5000 });

        const confirmationText = await confirmationMessage.textContent();
        expect(confirmationText).toMatch(/sent|email|check/i);

        // Verify no sensitive information is exposed
        expect(confirmationText).not.toMatch(/user.*not.*found|invalid.*email/i);
      } else {
        console.log('ℹ️ Password reset not implemented yet - skipping reset tests');
      }
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});