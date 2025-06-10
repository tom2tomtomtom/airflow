/**
 * Authentication Page Object Model
 * Handles login, signup, and authentication flows
 */

import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  
  // Login page elements
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;
  readonly rememberMeCheckbox: Locator;
  
  // Signup page elements
  readonly signupForm: Locator;
  readonly nameInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signupButton: Locator;
  readonly loginLinkFromSignup: Locator;
  readonly termsCheckbox: Locator;
  
  // Error and success messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly validationErrors: Locator;
  
  // Loading states
  readonly loadingSpinner: Locator;
  readonly submitButtonLoading: Locator;
  
  // MFA elements
  readonly mfaForm: Locator;
  readonly mfaCodeInput: Locator;
  readonly mfaVerifyButton: Locator;
  readonly mfaResendButton: Locator;
  
  // Password reset elements
  readonly resetForm: Locator;
  readonly resetEmailInput: Locator;
  readonly resetSubmitButton: Locator;
  readonly resetSuccessMessage: Locator;
  
  // Social login (if implemented)
  readonly googleLoginButton: Locator;
  readonly microsoftLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Login elements
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.signupLink = page.locator('[data-testid="signup-link"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me-checkbox"]');
    
    // Signup elements
    this.signupForm = page.locator('[data-testid="signup-form"]');
    this.nameInput = page.locator('[data-testid="name-input"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');
    this.signupButton = page.locator('[data-testid="signup-button"]');
    this.loginLinkFromSignup = page.locator('[data-testid="login-link"]');
    this.termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
    
    // Messages
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.validationErrors = page.locator('[data-testid="validation-error"]');
    
    // Loading states
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.submitButtonLoading = page.locator('[data-testid="button-loading"]');
    
    // MFA elements
    this.mfaForm = page.locator('[data-testid="mfa-form"]');
    this.mfaCodeInput = page.locator('[data-testid="mfa-code-input"]');
    this.mfaVerifyButton = page.locator('[data-testid="mfa-verify-button"]');
    this.mfaResendButton = page.locator('[data-testid="mfa-resend-button"]');
    
    // Password reset
    this.resetForm = page.locator('[data-testid="reset-form"]');
    this.resetEmailInput = page.locator('[data-testid="reset-email-input"]');
    this.resetSubmitButton = page.locator('[data-testid="reset-submit-button"]');
    this.resetSuccessMessage = page.locator('[data-testid="reset-success-message"]');
    
    // Social login
    this.googleLoginButton = page.locator('[data-testid="google-login-button"]');
    this.microsoftLoginButton = page.locator('[data-testid="microsoft-login-button"]');
  }

  // Navigation
  async gotoLogin(): Promise<void> {
    await this.page.goto('/login');
    await this.loginForm.waitFor({ state: 'visible' });
  }

  async gotoSignup(): Promise<void> {
    await this.page.goto('/signup');
    await this.signupForm.waitFor({ state: 'visible' });
  }

  async gotoForgotPassword(): Promise<void> {
    await this.page.goto('/forgot-password');
    await this.resetForm.waitFor({ state: 'visible' });
  }

  // Login functionality
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.gotoLogin();
    
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.loginButton.click();
    
    // Wait for navigation or error
    await Promise.race([
      this.page.waitForURL('/dashboard', { timeout: 15000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 15000 })
    ]);
  }

  async loginAndExpectSuccess(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL('/dashboard');
    
    // Verify we're actually logged in
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async loginAndExpectError(email: string, password: string, expectedError?: string): Promise<void> {
    await this.login(email, password);
    
    await expect(this.errorMessage).toBeVisible();
    
    if (expectedError) {
      await expect(this.errorMessage).toContainText(expectedError);
    }
  }

  async loginWithMFA(email: string, password: string, mfaCode: string): Promise<void> {
    await this.login(email, password);
    
    // Should show MFA form
    await this.mfaForm.waitFor({ state: 'visible' });
    await this.mfaCodeInput.fill(mfaCode);
    await this.mfaVerifyButton.click();
    
    await this.page.waitForURL('/dashboard');
  }

  // Signup functionality
  async signup(name: string, email: string, password: string, confirmPassword?: string): Promise<void> {
    await this.gotoSignup();
    
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (confirmPassword) {
      await this.confirmPasswordInput.fill(confirmPassword);
    } else {
      await this.confirmPasswordInput.fill(password);
    }
    
    // Accept terms if checkbox exists
    if (await this.termsCheckbox.isVisible()) {
      await this.termsCheckbox.check();
    }
    
    await this.signupButton.click();
    
    // Wait for success or error
    await Promise.race([
      this.successMessage.waitFor({ state: 'visible', timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }),
      this.page.waitForURL('/dashboard', { timeout: 15000 })
    ]);
  }

  async signupAndExpectSuccess(name: string, email: string, password: string): Promise<void> {
    await this.signup(name, email, password);
    
    // Either redirect to dashboard or show success message
    const isOnDashboard = this.page.url().includes('/dashboard');
    const hasSuccessMessage = await this.successMessage.isVisible();
    
    expect(isOnDashboard || hasSuccessMessage).toBeTruthy();
  }

  async signupAndExpectError(name: string, email: string, password: string, expectedError?: string): Promise<void> {
    await this.signup(name, email, password);
    
    await expect(this.errorMessage).toBeVisible();
    
    if (expectedError) {
      await expect(this.errorMessage).toContainText(expectedError);
    }
  }

  // Password reset functionality
  async requestPasswordReset(email: string): Promise<void> {
    await this.gotoForgotPassword();
    
    await this.resetEmailInput.fill(email);
    await this.resetSubmitButton.click();
    
    // Wait for success message
    await this.resetSuccessMessage.waitFor({ state: 'visible' });
  }

  // Form validation testing
  async testEmailValidation(): Promise<void> {
    await this.gotoLogin();
    
    // Test invalid email formats
    const invalidEmails = ['invalid', 'test@', '@domain.com', 'test..test@domain.com'];
    
    for (const email of invalidEmails) {
      await this.emailInput.fill(email);
      await this.passwordInput.fill('password123');
      await this.loginButton.click();
      
      // Should show validation error
      await expect(this.validationErrors).toBeVisible();
      
      // Clear the form
      await this.emailInput.clear();
      await this.passwordInput.clear();
    }
  }

  async testPasswordValidation(): Promise<void> {
    await this.gotoSignup();
    
    // Test weak passwords
    const weakPasswords = ['123', 'password', 'abc123'];
    
    for (const password of weakPasswords) {
      await this.nameInput.fill('Test User');
      await this.emailInput.fill('test@example.com');
      await this.passwordInput.fill(password);
      await this.confirmPasswordInput.fill(password);
      
      if (await this.termsCheckbox.isVisible()) {
        await this.termsCheckbox.check();
      }
      
      await this.signupButton.click();
      
      // Should show validation error
      await expect(this.validationErrors).toBeVisible();
      
      // Clear the form
      await this.nameInput.clear();
      await this.emailInput.clear();
      await this.passwordInput.clear();
      await this.confirmPasswordInput.clear();
    }
  }

  async testPasswordConfirmation(): Promise<void> {
    await this.gotoSignup();
    
    await this.nameInput.fill('Test User');
    await this.emailInput.fill('test@example.com');
    await this.passwordInput.fill('ValidPassword123!');
    await this.confirmPasswordInput.fill('DifferentPassword123!');
    
    if (await this.termsCheckbox.isVisible()) {
      await this.termsCheckbox.check();
    }
    
    await this.signupButton.click();
    
    // Should show password mismatch error
    await expect(this.validationErrors).toBeVisible();
    await expect(this.validationErrors).toContainText(/password/i);
  }

  // Social login testing
  async loginWithGoogle(): Promise<void> {
    await this.gotoLogin();
    
    if (await this.googleLoginButton.isVisible()) {
      await this.googleLoginButton.click();
      // Handle OAuth flow in test environment
      // This would typically require special OAuth testing setup
    }
  }

  async loginWithMicrosoft(): Promise<void> {
    await this.gotoLogin();
    
    if (await this.microsoftLoginButton.isVisible()) {
      await this.microsoftLoginButton.click();
      // Handle OAuth flow in test environment
    }
  }

  // Security testing
  async testRateLimiting(): Promise<void> {
    await this.gotoLogin();
    
    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await this.emailInput.fill('test@example.com');
      await this.passwordInput.fill('wrongpassword');
      await this.loginButton.click();
      
      await this.errorMessage.waitFor({ state: 'visible' });
      
      // Clear form for next attempt
      await this.emailInput.clear();
      await this.passwordInput.clear();
    }
    
    // Should show rate limiting message
    await expect(this.errorMessage).toContainText(/rate limit|too many attempts/i);
  }

  async testCSRFProtection(): Promise<void> {
    // This would test CSRF token validation
    await this.gotoLogin();
    
    // Manipulate form without proper CSRF token
    await this.page.evaluate(() => {
      const form = document.querySelector('[data-testid="login-form"]') as HTMLFormElement;
      if (form) {
        // Remove CSRF token if present
        const csrfToken = form.querySelector('input[name="_token"]') as HTMLInputElement;
        if (csrfToken) {
          csrfToken.remove();
        }
      }
    });
    
    await this.emailInput.fill('test@example.com');
    await this.passwordInput.fill('password123');
    await this.loginButton.click();
    
    // Should show security error
    await expect(this.errorMessage).toBeVisible();
  }

  // UX and accessibility testing
  async testKeyboardNavigation(): Promise<void> {
    await this.gotoLogin();
    
    // Test tab navigation
    await this.page.keyboard.press('Tab'); // Focus email
    await expect(this.emailInput).toBeFocused();
    
    await this.page.keyboard.press('Tab'); // Focus password
    await expect(this.passwordInput).toBeFocused();
    
    await this.page.keyboard.press('Tab'); // Focus remember me
    if (await this.rememberMeCheckbox.isVisible()) {
      await expect(this.rememberMeCheckbox).toBeFocused();
      await this.page.keyboard.press('Tab');
    }
    
    await expect(this.loginButton).toBeFocused(); // Focus login button
    
    // Test enter key submission
    await this.emailInput.fill('test@example.com');
    await this.passwordInput.fill('password123');
    await this.page.keyboard.press('Enter');
    
    // Should attempt login
    await this.errorMessage.waitFor({ state: 'visible' });
  }

  async testLoadingStates(): Promise<void> {
    await this.gotoLogin();
    
    await this.emailInput.fill('test@example.com');
    await this.passwordInput.fill('password123');
    
    // Click login and immediately check for loading state
    await this.loginButton.click();
    
    // Button should show loading state
    await expect(this.submitButtonLoading).toBeVisible();
    
    // Form should be disabled during submission
    await expect(this.emailInput).toBeDisabled();
    await expect(this.passwordInput).toBeDisabled();
    await expect(this.loginButton).toBeDisabled();
  }

  async testErrorMessagesClearing(): Promise<void> {
    await this.gotoLogin();
    
    // Show an error first
    await this.loginAndExpectError('test@example.com', 'wrongpassword');
    
    // Start typing in email field
    await this.emailInput.fill('newemail@example.com');
    
    // Error message should clear
    await expect(this.errorMessage).not.toBeVisible();
  }

  // Session management
  async testSessionPersistence(): Promise<void> {
    // Login with remember me
    await this.loginAndExpectSuccess('test@example.com', 'password123');
    
    // Refresh page
    await this.page.reload();
    
    // Should still be logged in
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async testSessionExpiration(): Promise<void> {
    await this.loginAndExpectSuccess('test@example.com', 'password123');
    
    // Simulate session expiration by manipulating local storage
    await this.page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    });
    
    // Try to navigate to protected page
    await this.page.goto('/dashboard');
    
    // Should redirect to login
    await this.page.waitForURL('/login');
  }

  // Mobile responsiveness
  async testMobileLayout(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.gotoLogin();
    
    // Form should be responsive
    await expect(this.loginForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    
    // Elements should not overflow
    const formBounds = await this.loginForm.boundingBox();
    expect(formBounds?.width).toBeLessThanOrEqual(375);
  }

  // Helper methods
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async getSuccessMessage(): Promise<string> {
    return await this.successMessage.textContent() || '';
  }

  async isFormLoading(): Promise<boolean> {
    return await this.submitButtonLoading.isVisible();
  }

  async waitForFormReady(): Promise<void> {
    await expect(this.submitButtonLoading).not.toBeVisible();
    await expect(this.emailInput).toBeEnabled();
    await expect(this.passwordInput).toBeEnabled();
    await expect(this.loginButton).toBeEnabled();
  }

  // Verification methods
  async verifyLoginPageElements(): Promise<void> {
    await expect(this.loginForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.signupLink).toBeVisible();
  }

  async verifySignupPageElements(): Promise<void> {
    await expect(this.signupForm).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.signupButton).toBeVisible();
    await expect(this.loginLinkFromSignup).toBeVisible();
  }

  async verifyUserIsLoggedOut(): Promise<void> {
    // Should be on login page or able to navigate to it
    if (!this.page.url().includes('/login')) {
      await this.page.goto('/login');
    }
    
    await expect(this.loginForm).toBeVisible();
  }
}