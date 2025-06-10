# Test info

- Name: Authentication Flow - Integrated Testing >> Error Recovery Experience >> network errors are handled gracefully
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:370:9

# Error details

```
Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
Call log:
  - waiting for locator('[data-testid="email-input"]')
    - locator resolved to <div data-testid="email-input" class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root mui-style-dzmwfx-MuiFormControl-root-MuiTextField-root">…</div>
    - fill("user@airwave-test.com")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:379:35
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:374:7
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
  279 |         await expect(authPage.validationErrors).toBeVisible();
  280 |         const errorText = await authPage.validationErrors.textContent();
  281 |         expect(errorText).toMatch(/password.*match|confirm.*password/i);
  282 |       });
  283 |
  284 |       await test.step('Password match provides positive feedback', async () => {
  285 |         await authPage.confirmPasswordInput.clear();
  286 |         await authPage.confirmPasswordInput.fill('Password123!');
  287 |         
  288 |         // UX: Positive feedback when passwords match
  289 |         await authPage.nameInput.click(); // Trigger validation
  290 |         
  291 |         // Error should be gone
  292 |         await expect(authPage.validationErrors).not.toBeVisible();
  293 |       });
  294 |     });
  295 |   });
  296 |
  297 |   test.describe('Session Management Experience', () => {
  298 |     test('session persistence works transparently', async ({ page }) => {
  299 |       // FUNCTIONAL: Sessions persist correctly
  300 |       // UX: Users don't lose their work unexpectedly
  301 |       
  302 |       await test.step('Login with remember me persists across browser restart', async () => {
  303 |         await authHelper.login('user@airwave-test.com', 'TestPass123!');
  304 |         await dashboardPage.verifyUserIsLoggedIn();
  305 |         
  306 |         // Simulate browser restart by clearing session but keeping local storage
  307 |         await page.evaluate(() => {
  308 |           sessionStorage.clear();
  309 |         });
  310 |         
  311 |         await page.reload();
  312 |         
  313 |         // UX: User remains logged in
  314 |         await dashboardPage.verifyUserIsLoggedIn();
  315 |       });
  316 |
  317 |       await test.step('Session expiry is handled gracefully', async () => {
  318 |         // Simulate session expiry
  319 |         await page.evaluate(() => {
  320 |           localStorage.removeItem('supabase.auth.token');
  321 |           sessionStorage.clear();
  322 |         });
  323 |         
  324 |         // Try to access protected page
  325 |         await page.goto('/dashboard');
  326 |         
  327 |         // UX: Graceful redirect to login
  328 |         await page.waitForURL('/login');
  329 |         
  330 |         // UX: Helpful message about session expiry
  331 |         const currentUrl = page.url();
  332 |         expect(currentUrl).toContain('/login');
  333 |       });
  334 |     });
  335 |
  336 |     test('concurrent session limit is handled user-friendly', async ({ page, browser }) => {
  337 |       // FUNCTIONAL: Session limits are enforced
  338 |       // UX: Users understand why they're being logged out
  339 |       
  340 |       await test.step('Multiple sessions are handled gracefully', async () => {
  341 |         // Login in first session
  342 |         await authHelper.login('user@airwave-test.com', 'TestPass123!');
  343 |         await dashboardPage.verifyUserIsLoggedIn();
  344 |         
  345 |         // Create second browser context (simulating different device/browser)
  346 |         const context2 = await browser.newContext();
  347 |         const page2 = await context2.newPage();
  348 |         
  349 |         const authHelper2 = new AuthHelper(page2);
  350 |         
  351 |         try {
  352 |           // Login in second session (might trigger session limit)
  353 |           await authHelper2.login('user@airwave-test.com', 'TestPass123!');
  354 |           
  355 |           // If session limit is enforced, first session should get notification
  356 |           // UX: User is informed about session displacement
  357 |           const notificationMessage = page.locator('[data-testid="session-displacement-notification"]');
  358 |           if (await notificationMessage.isVisible({ timeout: 2000 })) {
  359 |             const message = await notificationMessage.textContent();
  360 |             expect(message).toMatch(/session.*another.*device|logged.*out/i);
  361 |           }
  362 |         } finally {
  363 |           await context2.close();
  364 |         }
  365 |       });
  366 |     });
  367 |   });
  368 |
  369 |   test.describe('Error Recovery Experience', () => {
  370 |     test('network errors are handled gracefully', async ({ page }) => {
  371 |       // FUNCTIONAL: Network errors don't break the app
  372 |       // UX: Users understand what happened and how to recover
  373 |       
  374 |       await test.step('Login during network failure shows helpful message', async () => {
  375 |         // Simulate network failure
  376 |         await page.route('**/api/auth/login', route => route.abort());
  377 |         
  378 |         await authPage.gotoLogin();
> 379 |         await authPage.emailInput.fill('user@airwave-test.com');
      |                                   ^ Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
  380 |         await authPage.passwordInput.fill('TestPass123!');
  381 |         await authPage.loginButton.click();
  382 |         
  383 |         // UX: Network error is explained clearly
  384 |         await expect(authPage.errorMessage).toBeVisible({ timeout: 10000 });
  385 |         const errorText = await authPage.getErrorMessage();
  386 |         expect(errorText).toMatch(/network|connection|try.*again/i);
  387 |         
  388 |         // UX: Form is re-enabled for retry
  389 |         await expect(authPage.loginButton).toBeEnabled();
  390 |       });
  391 |
  392 |       await test.step('Retry after network recovery works', async () => {
  393 |         // Restore network
  394 |         await page.unroute('**/api/auth/login');
  395 |         
  396 |         // UX: Retry button or auto-retry works
  397 |         await authPage.loginButton.click();
  398 |         
  399 |         // FUNCTIONAL: Login succeeds after network recovery
  400 |         await page.waitForURL('/dashboard', { timeout: 15000 });
  401 |       });
  402 |     });
  403 |
  404 |     test('server errors provide actionable guidance', async ({ page }) => {
  405 |       // FUNCTIONAL: Server errors are handled
  406 |       // UX: Users know what to do when things go wrong
  407 |       
  408 |       await test.step('Server error shows helpful message', async () => {
  409 |         // Mock server error
  410 |         await apiMockHelper.mockAPI(/.*\/api\/auth\/login.*/, {
  411 |           status: 500,
  412 |           body: { error: 'Internal server error' }
  413 |         });
  414 |         
  415 |         await authPage.gotoLogin();
  416 |         await authPage.loginAndExpectError('user@airwave-test.com', 'TestPass123!');
  417 |         
  418 |         // UX: Error message is helpful, not technical
  419 |         const errorText = await authPage.getErrorMessage();
  420 |         expect(errorText).toMatch(/try.*again|server.*problem|contact.*support/i);
  421 |         expect(errorText).not.toMatch(/500|internal.*error|stack.*trace/i);
  422 |       });
  423 |     });
  424 |   });
  425 |
  426 |   test.describe('Accessibility and Inclusive Design', () => {
  427 |     test('screen reader users can login successfully', async ({ page }) => {
  428 |       // FUNCTIONAL: Screen readers can access all functionality
  429 |       // UX: Experience is inclusive and doesn't exclude users
  430 |       
  431 |       await authPage.gotoLogin();
  432 |
  433 |       await test.step('Form elements have proper labels', async () => {
  434 |         // UX: All inputs are properly labeled for screen readers
  435 |         const emailLabel = await authPage.emailInput.getAttribute('aria-label') || 
  436 |                            await authPage.emailInput.getAttribute('placeholder');
  437 |         expect(emailLabel).toMatch(/email/i);
  438 |         
  439 |         const passwordLabel = await authPage.passwordInput.getAttribute('aria-label') || 
  440 |                              await authPage.passwordInput.getAttribute('placeholder');
  441 |         expect(passwordLabel).toMatch(/password/i);
  442 |       });
  443 |
  444 |       await test.step('Error messages are announced to screen readers', async () => {
  445 |         await authPage.loginAndExpectError('wrong@email.com', 'wrongpassword');
  446 |         
  447 |         // UX: Error has proper ARIA attributes
  448 |         const errorRole = await authPage.errorMessage.getAttribute('role');
  449 |         const errorAria = await authPage.errorMessage.getAttribute('aria-live');
  450 |         
  451 |         expect(errorRole || errorAria).toBeTruthy(); // Should have role="alert" or aria-live
  452 |       });
  453 |
  454 |       await test.step('Loading states are announced', async () => {
  455 |         await authPage.emailInput.fill('user@airwave-test.com');
  456 |         await authPage.passwordInput.fill('TestPass123!');
  457 |         await authPage.loginButton.click();
  458 |         
  459 |         // UX: Loading state has screen reader text
  460 |         const buttonText = await authPage.loginButton.textContent();
  461 |         expect(buttonText).toMatch(/loading|signing.*in|please.*wait/i);
  462 |       });
  463 |     });
  464 |   });
  465 |
  466 |   test.describe('Performance Under Load', () => {
  467 |     test('login performance remains good under realistic conditions', async ({ page }) => {
  468 |       // FUNCTIONAL: System handles normal load
  469 |       // UX: Performance doesn't degrade user experience
  470 |       
  471 |       await test.step('Login completes quickly even with slow network', async () => {
  472 |         // Simulate slower network
  473 |         await page.route('**/api/auth/login', async route => {
  474 |           await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  475 |           await route.continue();
  476 |         });
  477 |         
  478 |         const startTime = Date.now();
  479 |         await authHelper.login('user@airwave-test.com', 'TestPass123!');
```