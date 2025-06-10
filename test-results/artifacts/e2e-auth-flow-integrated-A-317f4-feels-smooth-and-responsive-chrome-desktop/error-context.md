# Test info

- Name: Authentication Flow - Integrated Testing >> Login Experience >> successful login feels smooth and responsive
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:30:9

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="login-button"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-testid="login-button"]')

    at AuthPage.verifyLoginPageElements (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/pages/auth-page.ts:486:36)
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:43:9
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:34:7
```

# Page snapshot

```yaml
- heading "AIrFLOW" [level=1]
- heading "AI-Powered Digital Asset Production" [level=6]
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Toggle password visibility"
- checkbox "Remember me"
- text: Remember me
- button "Sign In"
- paragraph:
  - link "Forgot your password?":
    - /url: /forgot-password
- paragraph:
  - text: Don't have an account?
  - link "Sign up":
    - /url: /signup
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
  386 |   async testLoadingStates(): Promise<void> {
  387 |     await this.gotoLogin();
  388 |     
  389 |     await this.emailInput.fill('test@example.com');
  390 |     await this.passwordInput.fill('password123');
  391 |     
  392 |     // Click login and immediately check for loading state
  393 |     await this.loginButton.click();
  394 |     
  395 |     // Button should show loading state
  396 |     await expect(this.submitButtonLoading).toBeVisible();
  397 |     
  398 |     // Form should be disabled during submission
  399 |     await expect(this.emailInput).toBeDisabled();
  400 |     await expect(this.passwordInput).toBeDisabled();
  401 |     await expect(this.loginButton).toBeDisabled();
  402 |   }
  403 |
  404 |   async testErrorMessagesClearing(): Promise<void> {
  405 |     await this.gotoLogin();
  406 |     
  407 |     // Show an error first
  408 |     await this.loginAndExpectError('test@example.com', 'wrongpassword');
  409 |     
  410 |     // Start typing in email field
  411 |     await this.emailInput.fill('newemail@example.com');
  412 |     
  413 |     // Error message should clear
  414 |     await expect(this.errorMessage).not.toBeVisible();
  415 |   }
  416 |
  417 |   // Session management
  418 |   async testSessionPersistence(): Promise<void> {
  419 |     // Login with remember me
  420 |     await this.loginAndExpectSuccess('test@example.com', 'password123');
  421 |     
  422 |     // Refresh page
  423 |     await this.page.reload();
  424 |     
  425 |     // Should still be logged in
  426 |     await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  427 |   }
  428 |
  429 |   async testSessionExpiration(): Promise<void> {
  430 |     await this.loginAndExpectSuccess('test@example.com', 'password123');
  431 |     
  432 |     // Simulate session expiration by manipulating local storage
  433 |     await this.page.evaluate(() => {
  434 |       localStorage.removeItem('supabase.auth.token');
  435 |       sessionStorage.clear();
  436 |     });
  437 |     
  438 |     // Try to navigate to protected page
  439 |     await this.page.goto('/dashboard');
  440 |     
  441 |     // Should redirect to login
  442 |     await this.page.waitForURL('/login');
  443 |   }
  444 |
  445 |   // Mobile responsiveness
  446 |   async testMobileLayout(): Promise<void> {
  447 |     await this.page.setViewportSize({ width: 375, height: 667 });
  448 |     await this.gotoLogin();
  449 |     
  450 |     // Form should be responsive
  451 |     await expect(this.loginForm).toBeVisible();
  452 |     await expect(this.emailInput).toBeVisible();
  453 |     await expect(this.passwordInput).toBeVisible();
  454 |     await expect(this.loginButton).toBeVisible();
  455 |     
  456 |     // Elements should not overflow
  457 |     const formBounds = await this.loginForm.boundingBox();
  458 |     expect(formBounds?.width).toBeLessThanOrEqual(375);
  459 |   }
  460 |
  461 |   // Helper methods
  462 |   async getErrorMessage(): Promise<string> {
  463 |     return await this.errorMessage.textContent() || '';
  464 |   }
  465 |
  466 |   async getSuccessMessage(): Promise<string> {
  467 |     return await this.successMessage.textContent() || '';
  468 |   }
  469 |
  470 |   async isFormLoading(): Promise<boolean> {
  471 |     return await this.submitButtonLoading.isVisible();
  472 |   }
  473 |
  474 |   async waitForFormReady(): Promise<void> {
  475 |     await expect(this.submitButtonLoading).not.toBeVisible();
  476 |     await expect(this.emailInput).toBeEnabled();
  477 |     await expect(this.passwordInput).toBeEnabled();
  478 |     await expect(this.loginButton).toBeEnabled();
  479 |   }
  480 |
  481 |   // Verification methods
  482 |   async verifyLoginPageElements(): Promise<void> {
  483 |     await expect(this.loginForm).toBeVisible();
  484 |     await expect(this.emailInput).toBeVisible();
  485 |     await expect(this.passwordInput).toBeVisible();
> 486 |     await expect(this.loginButton).toBeVisible();
      |                                    ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  487 |     await expect(this.signupLink).toBeVisible();
  488 |   }
  489 |
  490 |   async verifySignupPageElements(): Promise<void> {
  491 |     await expect(this.signupForm).toBeVisible();
  492 |     await expect(this.nameInput).toBeVisible();
  493 |     await expect(this.emailInput).toBeVisible();
  494 |     await expect(this.passwordInput).toBeVisible();
  495 |     await expect(this.confirmPasswordInput).toBeVisible();
  496 |     await expect(this.signupButton).toBeVisible();
  497 |     await expect(this.loginLinkFromSignup).toBeVisible();
  498 |   }
  499 |
  500 |   async verifyUserIsLoggedOut(): Promise<void> {
  501 |     // Should be on login page or able to navigate to it
  502 |     if (!this.page.url().includes('/login')) {
  503 |       await this.page.goto('/login');
  504 |     }
  505 |     
  506 |     await expect(this.loginForm).toBeVisible();
  507 |   }
  508 | }
```