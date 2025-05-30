# Test info

- Name: Asset Upload Flow >> should upload image assets successfully
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/asset-upload.test.ts:5:7

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="user-menu"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-testid="user-menu"]')

    at AuthHelper.ensureLoggedIn (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/helpers/auth-helper.ts:71:66)
    at Object.authenticatedPage (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/fixtures/test-fixtures.ts:42:24)
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
   1 | import { Page, expect } from '@playwright/test';
   2 |
   3 | export class AuthHelper {
   4 |   constructor(private page: Page) {}
   5 |
   6 |   async setupTestUser() {
   7 |     // This would setup a test user in the system
   8 |     // For now, we'll work with demo mode
   9 |     console.log('Setting up test user session...');
   10 |   }
   11 |
   12 |   async login(email: string = 'test@airwave.com', password: string = 'testpass123') {
   13 |     await this.page.goto('/login');
   14 |     
   15 |     // Wait for login form to load
   16 |     await this.page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
   17 |     
   18 |     // Fill in credentials (target the actual input elements within MUI TextFields)
   19 |     await this.page.fill('[data-testid="email-input"] input', email);
   20 |     await this.page.fill('[data-testid="password-input"] input', password);
   21 |     
   22 |     // Submit form
   23 |     await this.page.click('[data-testid="sign-in-button"]');
   24 |     
   25 |     // Wait for successful login (redirect to dashboard)
   26 |     await this.page.waitForURL('**/dashboard', { timeout: 15000 });
   27 |     
   28 |     // Verify we're logged in
   29 |     await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
   30 |   }
   31 |
   32 |   async loginWithDemo() {
   33 |     await this.page.goto('/login');
   34 |     
   35 |     // Wait for demo login button to load
   36 |     await this.page.waitForSelector('[data-testid="demo-login-button"]', { timeout: 10000 });
   37 |     
   38 |     // Click demo login
   39 |     await this.page.click('[data-testid="demo-login-button"]');
   40 |     
   41 |     // Wait for redirect to home page
   42 |     await this.page.waitForURL('**/', { timeout: 15000 });
   43 |     
   44 |     // Should redirect to dashboard if logged in
   45 |     await this.page.waitForURL('**/dashboard', { timeout: 15000 });
   46 |   }
   47 |
   48 |   async logout() {
   49 |     // Open user menu (force click to bypass any overlays)
   50 |     await this.page.click('[data-testid="user-menu"]', { force: true });
   51 |     
   52 |     // Wait for menu to be fully visible
   53 |     await this.page.waitForSelector('[data-testid="logout-button"]', { state: 'visible' });
   54 |     
   55 |     // Use force click to bypass any interceptors
   56 |     await this.page.click('[data-testid="logout-button"]', { force: true });
   57 |     
   58 |     // Wait for redirect to login page with longer timeout
   59 |     await this.page.waitForURL('**/login', { timeout: 20000 });
   60 |   }
   61 |
   62 |   async ensureLoggedIn(email?: string, password?: string) {
   63 |     // Check if already logged in
   64 |     const currentUrl = this.page.url();
   65 |     
   66 |     if (currentUrl.includes('/login') || currentUrl === '/') {
   67 |       await this.login(email, password);
   68 |     }
   69 |     
   70 |     // Verify we're on a protected page
>  71 |     await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
      |                                                                  ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
   72 |   }
   73 |
   74 |   async selectClient(clientName: string = 'Demo Agency') {
   75 |     // Wait for client selector to be available
   76 |     await this.page.waitForSelector('[data-testid="client-selector"]', { timeout: 10000 });
   77 |     
   78 |     // Click client selector
   79 |     await this.page.click('[data-testid="client-selector"]');
   80 |     
   81 |     // Wait for dropdown to open
   82 |     await this.page.waitForSelector('[data-testid="client-option"]', { timeout: 5000 });
   83 |     
   84 |     // Select the specified client
   85 |     await this.page.click(`[data-testid="client-option"]:has-text("${clientName}")`);
   86 |     
   87 |     // Wait for client to be selected
   88 |     await expect(this.page.locator('[data-testid="selected-client"]')).toContainText(clientName);
   89 |   }
   90 |
   91 |   async isInDemoMode(): Promise<boolean> {
   92 |     // Check the Next.js __NEXT_DATA__ script tag for runtime config
   93 |     return await this.page.evaluate(() => {
   94 |       const nextData = document.getElementById('__NEXT_DATA__');
   95 |       if (nextData) {
   96 |         try {
   97 |           const data = JSON.parse(nextData.textContent || '{}');
   98 |           return data.runtimeConfig?.NEXT_PUBLIC_DEMO_MODE === 'true';
   99 |         } catch (e) {
  100 |           // Fallback to checking window object
  101 |         }
  102 |       }
  103 |       
  104 |       // Alternative: check if demo mode is enabled via window object or meta tag
  105 |       return (window as any).__NEXT_PUBLIC_DEMO_MODE === 'true' ||
  106 |              document.querySelector('meta[name="demo-mode"]')?.getAttribute('content') === 'true';
  107 |     });
  108 |   }
  109 | }
```