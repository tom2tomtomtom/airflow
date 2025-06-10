# Test info

- Name: Authentication Flow - Integrated Testing >> Signup Experience >> password confirmation provides immediate feedback
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:263:9

# Error details

```
Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
Call log:
  - waiting for locator('[data-testid="name-input"]')
    - locator resolved to <div data-testid="name-input" class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root mui-style-dzmwfx-MuiFormControl-root-MuiTextField-root">…</div>
    - fill("Test User")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:270:34
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:269:18
```

# Page snapshot

```yaml
- heading "AIrFLOW" [level=1]
- heading "Create Your Account" [level=6]
- text: Full Name
- textbox "Full Name"
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Icon button"
- paragraph: Must be at least 8 characters long
- text: Confirm Password
- textbox "Confirm Password"
- button "Icon button"
- button "Create Account"
- paragraph:
  - text: Already have an account?
  - link "Sign in":
    - /url: /login
- strong: "Note:"
- text: By creating an account, you agree to our Terms of Service and Privacy Policy.
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
  170 |       // FUNCTIONAL: Login works on mobile
  171 |       // UX: Mobile experience is touch-friendly and fast
  172 |       
  173 |       await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
  174 |       
  175 |       await test.step('Mobile layout is touch-friendly', async () => {
  176 |         await authPage.gotoLogin();
  177 |         
  178 |         // UX: Form elements are appropriately sized for touch
  179 |         const emailBounds = await authPage.emailInput.boundingBox();
  180 |         expect(emailBounds?.height).toBeGreaterThan(44); // Minimum touch target
  181 |         
  182 |         const passwordBounds = await authPage.passwordInput.boundingBox();
  183 |         expect(passwordBounds?.height).toBeGreaterThan(44);
  184 |         
  185 |         const buttonBounds = await authPage.loginButton.boundingBox();
  186 |         expect(buttonBounds?.height).toBeGreaterThan(44);
  187 |       });
  188 |
  189 |       await test.step('Mobile input experience is smooth', async () => {
  190 |         // UX: Email input has proper keyboard type
  191 |         await authPage.emailInput.click();
  192 |         const emailType = await authPage.emailInput.getAttribute('type');
  193 |         expect(emailType).toBe('email'); // Triggers email keyboard on mobile
  194 |         
  195 |         // UX: Password input has proper type
  196 |         await authPage.passwordInput.click();
  197 |         const passwordType = await authPage.passwordInput.getAttribute('type');
  198 |         expect(passwordType).toBe('password'); // Hides text appropriately
  199 |       });
  200 |
  201 |       await test.step('Mobile login completes successfully', async () => {
  202 |         await authPage.emailInput.fill('user@airwave-test.com');
  203 |         await authPage.passwordInput.fill('TestPass123!');
  204 |         await authPage.loginButton.click();
  205 |         
  206 |         // FUNCTIONAL: Mobile login works
  207 |         await page.waitForURL('/dashboard');
  208 |         
  209 |         // UX: Mobile dashboard is usable
  210 |         await dashboardPage.testMobileLayout();
  211 |       });
  212 |     });
  213 |   });
  214 |
  215 |   test.describe('Signup Experience', () => {
  216 |     test('signup flow is intuitive and encouraging', async ({ page }) => {
  217 |       // FUNCTIONAL: Signup works correctly
  218 |       // UX: Signup flow encourages completion and feels trustworthy
  219 |       
  220 |       await test.step('Signup form is welcoming and clear', async () => {
  221 |         await authPage.gotoSignup();
  222 |         
  223 |         // UX: All elements are clearly labeled
  224 |         await authPage.verifySignupPageElements();
  225 |         
  226 |         // UX: Page loads quickly
  227 |         const pageTitle = await page.title();
  228 |         expect(pageTitle).toMatch(/sign.*up|register|join/i);
  229 |       });
  230 |
  231 |       await test.step('Form provides helpful guidance', async () => {
  232 |         // UX: Password requirements are clear
  233 |         await authPage.passwordInput.click();
  234 |         
  235 |         // Check if password requirements are shown
  236 |         const passwordHelp = page.locator('[data-testid="password-requirements"]');
  237 |         if (await passwordHelp.isVisible()) {
  238 |           const helpText = await passwordHelp.textContent();
  239 |           expect(helpText).toMatch(/8.*character|uppercase|lowercase|number/i);
  240 |         }
  241 |       });
  242 |
  243 |       await test.step('Signup completion feels successful', async () => {
  244 |         await authPage.signupAndExpectSuccess(
  245 |           'Test User',
  246 |           'newuser@airwave-test.com',
  247 |           'SecurePass123!'
  248 |         );
  249 |         
  250 |         // UX: Success is clearly communicated
  251 |         const isOnDashboard = page.url().includes('/dashboard');
  252 |         const hasSuccessMessage = await authPage.successMessage.isVisible();
  253 |         
  254 |         expect(isOnDashboard || hasSuccessMessage).toBeTruthy();
  255 |         
  256 |         if (isOnDashboard) {
  257 |           // UX: New user sees welcoming dashboard
  258 |           await dashboardPage.verifyUserIsLoggedIn();
  259 |         }
  260 |       });
  261 |     });
  262 |
  263 |     test('password confirmation provides immediate feedback', async ({ page }) => {
  264 |       // FUNCTIONAL: Password confirmation works
  265 |       // UX: Users get immediate feedback on password matching
  266 |       
  267 |       await authPage.gotoSignup();
  268 |
  269 |       await test.step('Password mismatch is caught immediately', async () => {
> 270 |         await authPage.nameInput.fill('Test User');
      |                                  ^ Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
  271 |         await authPage.emailInput.fill('test@example.com');
  272 |         await authPage.passwordInput.fill('Password123!');
  273 |         await authPage.confirmPasswordInput.fill('DifferentPassword123!');
  274 |         
  275 |         // UX: Mismatch should be shown when confirm field loses focus
  276 |         await authPage.signupButton.click();
  277 |         
  278 |         // UX: Clear error message about password mismatch
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
```