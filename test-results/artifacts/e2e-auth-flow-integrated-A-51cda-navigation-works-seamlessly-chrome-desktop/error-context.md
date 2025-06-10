# Test info

- Name: Authentication Flow - Integrated Testing >> Login Experience >> keyboard navigation works seamlessly
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:133:9

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeFocused()

Locator: locator('[data-testid="email-input"]')
Expected: focused
Received: inactive
Call log:
  - expect.toBeFocused with timeout 10000ms
  - waiting for locator('[data-testid="email-input"]')
    14 × locator resolved to <div data-testid="email-input" class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root mui-style-dzmwfx-MuiFormControl-root-MuiTextField-root">…</div>
       - unexpected value "inactive"

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:142:43
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:139:7
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
   42 |         // FUNCTIONAL: All elements present
   43 |         await authPage.verifyLoginPageElements();
   44 |       });
   45 |
   46 |       await test.step('Form interactions feel responsive', async () => {
   47 |         // UX: Input focus states work immediately
   48 |         await authPage.emailInput.click();
   49 |         await expect(authPage.emailInput).toBeFocused();
   50 |         
   51 |         // UX: Typing feels immediate (no delay)
   52 |         const typingStartTime = Date.now();
   53 |         await authPage.emailInput.type('user@airwave-test.com');
   54 |         const typingTime = Date.now() - typingStartTime;
   55 |         expect(typingTime).toBeLessThan(500); // Should type quickly
   56 |         
   57 |         await authPage.passwordInput.type('TestPass123!');
   58 |       });
   59 |
   60 |       await test.step('Loading states provide clear feedback', async () => {
   61 |         // UX: Button shows loading state immediately when clicked
   62 |         const clickTime = Date.now();
   63 |         await authPage.loginButton.click();
   64 |         
   65 |         // UX: Loading indicator appears quickly
   66 |         await expect(authPage.submitButtonLoading).toBeVisible({ timeout: 200 });
   67 |         
   68 |         // UX: Form is disabled during loading
   69 |         await expect(authPage.emailInput).toBeDisabled();
   70 |         await expect(authPage.passwordInput).toBeDisabled();
   71 |         
   72 |         // FUNCTIONAL: Login succeeds and redirects
   73 |         await page.waitForURL('/dashboard', { timeout: 15000 });
   74 |         const totalLoginTime = Date.now() - clickTime;
   75 |         
   76 |         // UX: Login completes in reasonable time
   77 |         expect(totalLoginTime).toBeLessThan(5000);
   78 |       });
   79 |
   80 |       await test.step('Post-login experience is immediate', async () => {
   81 |         // UX: Dashboard loads quickly after login
   82 |         await dashboardPage.waitForLoad();
   83 |         
   84 |         // FUNCTIONAL: User is properly authenticated
   85 |         await dashboardPage.verifyUserIsLoggedIn();
   86 |         
   87 |         // UX: Welcome message is personal and clear
   88 |         await expect(dashboardPage.welcomeMessage).toBeVisible();
   89 |         const welcomeText = await dashboardPage.welcomeMessage.textContent();
   90 |         expect(welcomeText).toMatch(/welcome|hello|dashboard/i);
   91 |       });
   92 |     });
   93 |
   94 |     test('login errors are helpful and clear', async ({ page }) => {
   95 |       // FUNCTIONAL: Error handling works
   96 |       // UX: Error messages are helpful and don't frustrate users
   97 |       
   98 |       await authPage.gotoLogin();
   99 |
  100 |       await test.step('Invalid credentials show helpful error', async () => {
  101 |         await authPage.loginAndExpectError('wrong@email.com', 'wrongpassword');
  102 |         
  103 |         // UX: Error message is clear and actionable
  104 |         const errorText = await authPage.getErrorMessage();
  105 |         expect(errorText).toMatch(/invalid|incorrect|credential/i);
  106 |         
  107 |         // UX: Error appears quickly (not hanging)
  108 |         await expect(authPage.errorMessage).toBeVisible({ timeout: 3000 });
  109 |       });
  110 |
  111 |       await test.step('Error messages clear when user starts fixing', async () => {
  112 |         // UX: Errors clear when user makes changes
  113 |         await authPage.emailInput.fill('better@email.com');
  114 |         
  115 |         // UX: Error should disappear when user starts typing
  116 |         await expect(authPage.errorMessage).not.toBeVisible({ timeout: 1000 });
  117 |       });
  118 |
  119 |       await test.step('Form validation is immediate and helpful', async () => {
  120 |         // Clear form first
  121 |         await authPage.emailInput.clear();
  122 |         await authPage.passwordInput.clear();
  123 |         
  124 |         // UX: Invalid email format shows immediate feedback
  125 |         await authPage.emailInput.fill('invalid-email');
  126 |         await authPage.passwordInput.click(); // Trigger validation
  127 |         
  128 |         // UX: Validation appears quickly
  129 |         await expect(authPage.validationErrors).toBeVisible({ timeout: 1000 });
  130 |       });
  131 |     });
  132 |
  133 |     test('keyboard navigation works seamlessly', async ({ page }) => {
  134 |       // FUNCTIONAL: Keyboard navigation works
  135 |       // UX: Keyboard users have smooth experience
  136 |       
  137 |       await authPage.gotoLogin();
  138 |
  139 |       await test.step('Tab navigation flows logically', async () => {
  140 |         // UX: Tab order makes sense
  141 |         await page.keyboard.press('Tab');
> 142 |         await expect(authPage.emailInput).toBeFocused();
      |                                           ^ Error: Timed out 10000ms waiting for expect(locator).toBeFocused()
  143 |         
  144 |         await page.keyboard.press('Tab');
  145 |         await expect(authPage.passwordInput).toBeFocused();
  146 |         
  147 |         await page.keyboard.press('Tab');
  148 |         // Skip remember me if present, focus should go to login button
  149 |         if (await authPage.rememberMeCheckbox.isVisible()) {
  150 |           await expect(authPage.rememberMeCheckbox).toBeFocused();
  151 |           await page.keyboard.press('Tab');
  152 |         }
  153 |         
  154 |         await expect(authPage.loginButton).toBeFocused();
  155 |       });
  156 |
  157 |       await test.step('Enter key submission works from password field', async () => {
  158 |         await authPage.emailInput.fill('user@airwave-test.com');
  159 |         await authPage.passwordInput.fill('TestPass123!');
  160 |         
  161 |         // UX: Enter key submits form
  162 |         await page.keyboard.press('Enter');
  163 |         
  164 |         // FUNCTIONAL: Login attempt is made
  165 |         await page.waitForURL('/dashboard', { timeout: 15000 });
  166 |       });
  167 |     });
  168 |
  169 |     test('mobile login experience is optimized', async ({ page }) => {
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
```