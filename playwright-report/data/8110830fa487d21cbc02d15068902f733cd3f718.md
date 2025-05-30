# Test info

- Name: Authentication & Client Context >> Demo Mode >> should load homepage without authentication in demo mode
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth.test.ts:5:9

# Error details

```
Error: expect(locator).toBeVisible()

Locator: locator('[data-testid="login-button"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-testid="login-button"]')

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth.test.ts:22:68
```

# Page snapshot

```yaml
- heading "AIrWAVE" [level=2]
- paragraph: AI-Powered Content Management Platform
- paragraph: Create, manage, and optimize your digital content with the power of AI.
- button "Login"
- button "Get Started"
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from './fixtures/test-fixtures';
   2 |
   3 | test.describe('Authentication & Client Context', () => {
   4 |   test.describe('Demo Mode', () => {
   5 |     test('should load homepage without authentication in demo mode', async ({ page, authHelper }) => {
   6 |       await page.goto('/');
   7 |       
   8 |       const isDemoMode = await authHelper.isInDemoMode();
   9 |       
   10 |       if (isDemoMode) {
   11 |         // In demo mode, should show landing page or dashboard
   12 |         await expect(page).toHaveTitle(/AIrWAVE/);
   13 |         
   14 |         // Should not show login form
   15 |         await expect(page.locator('[data-testid="login-form"]')).not.toBeVisible();
   16 |         
   17 |         // Take screenshot for verification
   18 |         await page.screenshot({ path: 'test-results/demo-homepage.png' });
   19 |       } else {
   20 |         // Not in demo mode, should show landing page with login buttons
   21 |         await expect(page).toHaveTitle(/AIrWAVE/);
>  22 |         await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible()
   23 |         await expect(page.locator('[data-testid="get-started-button"]')).toBeVisible();
   24 |       }
   25 |     });
   26 |
   27 |     test('should navigate through app without authentication in demo mode', async ({ page, authHelper }) => {
   28 |       const isDemoMode = await authHelper.isInDemoMode();
   29 |       
   30 |       if (isDemoMode) {
   31 |         await page.goto('/');
   32 |         
   33 |         // Try to navigate to protected routes
   34 |         const protectedRoutes = ['/dashboard', '/assets', '/campaigns'];
   35 |         
   36 |         for (const route of protectedRoutes) {
   37 |           await page.goto(route);
   38 |           
   39 |           // Should not redirect to login
   40 |           expect(page.url()).not.toContain('/login');
   41 |           
   42 |           // Page should load (not show error)
   43 |           await expect(page.locator('body')).toBeVisible();
   44 |           
   45 |           await page.screenshot({ path: `test-results/demo-${route.replace('/', '')}.png` });
   46 |         }
   47 |       } else {
   48 |         test.skip('Skipping demo mode test - not in demo mode');
   49 |       }
   50 |     });
   51 |   });
   52 |
   53 |   test.describe('Authentication Flow', () => {
   54 |     test('should show login page for unauthenticated users', async ({ page, authHelper }) => {
   55 |       const isDemoMode = await authHelper.isInDemoMode();
   56 |       
   57 |       if (!isDemoMode) {
   58 |         await page.goto('/dashboard');
   59 |         
   60 |         // Should redirect to login
   61 |         await expect(page).toHaveURL(/.*\/login/);
   62 |         
   63 |         // Should show login form
   64 |         await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
   65 |         await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
   66 |         await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
   67 |         await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
   68 |         
   69 |         await page.screenshot({ path: 'test-results/login-page.png' });
   70 |       } else {
   71 |         test.skip('Skipping auth test - in demo mode');
   72 |       }
   73 |     });
   74 |
   75 |     test('should handle login with valid credentials', async ({ page, authHelper }) => {
   76 |       const isDemoMode = await authHelper.isInDemoMode();
   77 |       
   78 |       if (!isDemoMode) {
   79 |         await authHelper.login('test@airwave.com', 'testpass123');
   80 |         
   81 |         // Should be redirected to dashboard
   82 |         await expect(page).toHaveURL(/.*\/dashboard/);
   83 |         
   84 |         // Should show user menu
   85 |         await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
   86 |         
   87 |         // Should show client selector
   88 |         await expect(page.locator('[data-testid="client-selector"]')).toBeVisible();
   89 |         
   90 |         await page.screenshot({ path: 'test-results/successful-login.png' });
   91 |       } else {
   92 |         test.skip('Skipping auth test - in demo mode');
   93 |       }
   94 |     });
   95 |
   96 |     test('should handle login with invalid credentials', async ({ page, authHelper }) => {
   97 |       const isDemoMode = await authHelper.isInDemoMode();
   98 |       
   99 |       if (!isDemoMode) {
  100 |         await page.goto('/login');
  101 |         
  102 |         // Fill in invalid credentials
  103 |         await page.fill('[data-testid="email-input"] input', 'invalid@email.com');
  104 |         await page.fill('[data-testid="password-input"] input', 'wrongpassword');
  105 |         
  106 |         // Submit form
  107 |         await page.click('[data-testid="sign-in-button"]');
  108 |         
  109 |         // Should show error message
  110 |         await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  111 |         
  112 |         // Should stay on login page
  113 |         await expect(page).toHaveURL(/.*\/login/);
  114 |         
  115 |         await page.screenshot({ path: 'test-results/failed-login.png' });
  116 |       } else {
  117 |         test.skip('Skipping auth test - in demo mode');
  118 |       }
  119 |     });
  120 |
  121 |     test('should handle logout', async ({ page, authHelper }) => {
  122 |       const isDemoMode = await authHelper.isInDemoMode();
```