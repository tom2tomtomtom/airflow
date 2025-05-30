# Test info

- Name: Authentication & Client Context >> Client Context Management >> should display client selector after authentication
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth.test.ts:145:9

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="selected-client"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-testid="selected-client"]')

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth.test.ts:150:82
```

# Page snapshot

```yaml
- banner:
  - text: AIrWAVE Dashboard
  - button "Select Client"
  - button "T"
- navigation "navigation menu":
  - text: AIrWAVE
  - separator
  - list:
    - listitem:
      - button "Dashboard"
    - listitem:
      - button "Clients"
    - listitem:
      - button "Campaigns"
    - separator
    - listitem:
      - button "Assets"
    - listitem:
      - button "Matrix"
    - listitem:
      - button "Templates"
    - listitem:
      - button "Strategic Content"
    - separator
    - listitem:
      - button "Generate"
    - listitem:
      - button "Execute"
    - listitem:
      - button "Preview"
    - listitem:
      - button "Sign Off"
- main:
  - heading "Welcome back, Test User!" [level=4]
  - paragraph: Select a client to get started
  - paragraph: Total Assets
  - text: "127"
  - paragraph: +12%
  - paragraph: AI Generated
  - text: "48"
  - paragraph: +25%
  - paragraph: Active Campaigns
  - text: "5"
  - paragraph: 0%
  - paragraph: Templates Used
  - text: "23"
  - paragraph: +8%
  - heading "Quick Actions" [level=5]
  - heading "Generate AI Image" [level=6]
  - paragraph: Create images with DALL-E 3
  - button
  - heading "Browse Templates" [level=6]
  - paragraph: Start from pre-built templates
  - button
  - heading "Content Matrix" [level=6]
  - paragraph: Plan your content strategy
  - button
  - heading "Asset Library" [level=6]
  - paragraph: Manage your digital assets
  - button
  - heading "Recent Activity" [level=6]
  - paragraph: Select a client to view activity
  - heading "Getting Started" [level=6]
  - paragraph: "New to AIrWAVE? Here are some things you can do:"
  - list:
    - listitem:
      - paragraph: Generate AI images with DALL-E 3
    - listitem:
      - paragraph: Create content matrices for campaigns
    - listitem:
      - paragraph: Use templates for quick content creation
    - listitem:
      - paragraph: Manage and organize your digital assets
    - listitem:
      - paragraph: Track campaign performance with analytics
    - listitem:
      - paragraph: Collaborate with real-time activity updates
  - heading "Quick Tips" [level=6]
  - text: Press Ctrl+K for quick search Use templates to speed up creation Check analytics daily for insights
  - button "Start Creating"
- button "Open Tanstack query devtools":
  - img
- alert: Dashboard | AIrWAVE
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 15.3.2 (stale) Webpack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 15.3.2 (stale) Webpack
- img
- dialog "Runtime Error":
  - text: Runtime Error
  - button "Copy Stack Trace":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"
```

# Test source

```ts
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
  123 |       
  124 |       if (!isDemoMode) {
  125 |         // First login
  126 |         await authHelper.login();
  127 |         
  128 |         // Then logout
  129 |         await authHelper.logout();
  130 |         
  131 |         // Should be redirected to login page
  132 |         await expect(page).toHaveURL(/.*\/login/);
  133 |         
  134 |         // Should not show user menu
  135 |         await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  136 |         
  137 |         await page.screenshot({ path: 'test-results/after-logout.png' });
  138 |       } else {
  139 |         test.skip('Skipping auth test - in demo mode');
  140 |       }
  141 |     });
  142 |   });
  143 |
  144 |   test.describe('Client Context Management', () => {
  145 |     test('should display client selector after authentication', async ({ authenticatedPage }) => {
  146 |       // Should show client selector
  147 |       await expect(authenticatedPage.locator('[data-testid="client-selector"]')).toBeVisible();
  148 |       
  149 |       // Should show selected client name
> 150 |       await expect(authenticatedPage.locator('[data-testid="selected-client"]')).toBeVisible();
      |                                                                                  ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  151 |       
  152 |       await authenticatedPage.screenshot({ path: 'test-results/client-selector.png' });
  153 |     });
  154 |
  155 |     test('should allow client switching', async ({ authenticatedPage, authHelper }) => {
  156 |       // Open client selector dropdown
  157 |       await authenticatedPage.click('[data-testid="client-selector"]');
  158 |       
  159 |       // Should show client options
  160 |       await expect(authenticatedPage.locator('[data-testid="client-option"]')).toHaveCount.greaterThan(0);
  161 |       
  162 |       // Select a different client (if available)
  163 |       const clientOptions = await authenticatedPage.locator('[data-testid="client-option"]').all();
  164 |       
  165 |       if (clientOptions.length > 1) {
  166 |         const secondClient = clientOptions[1];
  167 |         const clientName = await secondClient.textContent();
  168 |         
  169 |         await secondClient.click();
  170 |         
  171 |         // Verify client was selected
  172 |         await expect(authenticatedPage.locator('[data-testid="selected-client"]')).toContainText(clientName || '');
  173 |         
  174 |         // Page should reload/update with new client context
  175 |         await authenticatedPage.waitForLoadState('networkidle');
  176 |         
  177 |         await authenticatedPage.screenshot({ path: 'test-results/client-switched.png' });
  178 |       }
  179 |     });
  180 |
  181 |     test('should persist client selection across page navigation', async ({ authenticatedPage, authHelper }) => {
  182 |       // Select a specific client
  183 |       await authHelper.selectClient('Demo Agency');
  184 |       
  185 |       // Get current selected client
  186 |       const selectedClient = await authenticatedPage.locator('[data-testid="selected-client"]').textContent();
  187 |       
  188 |       // Navigate to different pages
  189 |       const pages = ['/assets', '/campaigns', '/dashboard'];
  190 |       
  191 |       for (const pagePath of pages) {
  192 |         await authenticatedPage.goto(pagePath);
  193 |         await authenticatedPage.waitForLoadState('networkidle');
  194 |         
  195 |         // Verify client selection persists
  196 |         await expect(authenticatedPage.locator('[data-testid="selected-client"]')).toContainText(selectedClient || '');
  197 |       }
  198 |       
  199 |       await authenticatedPage.screenshot({ path: 'test-results/client-persistence.png' });
  200 |     });
  201 |
  202 |     test('should show client-specific data isolation', async ({ authenticatedPage, authHelper }) => {
  203 |       // This test would verify that switching clients shows different data
  204 |       // For now, we'll just verify the UI responds to client changes
  205 |       
  206 |       await authHelper.selectClient('Demo Agency');
  207 |       
  208 |       // Navigate to assets page
  209 |       await authenticatedPage.goto('/assets');
  210 |       await authenticatedPage.waitForLoadState('networkidle');
  211 |       
  212 |       // Take screenshot of assets for first client
  213 |       await authenticatedPage.screenshot({ path: 'test-results/client1-assets.png' });
  214 |       
  215 |       // If there are multiple clients, switch and verify data changes
  216 |       await authenticatedPage.click('[data-testid="client-selector"]');
  217 |       const clientOptions = await authenticatedPage.locator('[data-testid="client-option"]').all();
  218 |       
  219 |       if (clientOptions.length > 1) {
  220 |         // Find a different client
  221 |         for (const option of clientOptions) {
  222 |           const text = await option.textContent();
  223 |           if (text && !text.includes('Demo Agency')) {
  224 |             await option.click();
  225 |             break;
  226 |           }
  227 |         }
  228 |         
  229 |         // Wait for data to reload
  230 |         await authenticatedPage.waitForLoadState('networkidle');
  231 |         
  232 |         // Take screenshot of assets for second client
  233 |         await authenticatedPage.screenshot({ path: 'test-results/client2-assets.png' });
  234 |       }
  235 |     });
  236 |   });
  237 |
  238 |   test.describe('Session Management', () => {
  239 |     test('should handle session expiry gracefully', async ({ page, authHelper }) => {
  240 |       const isDemoMode = await authHelper.isInDemoMode();
  241 |       
  242 |       if (!isDemoMode) {
  243 |         // Login first
  244 |         await authHelper.login();
  245 |         
  246 |         // Simulate session expiry by clearing storage
  247 |         await page.evaluate(() => {
  248 |           localStorage.clear();
  249 |           sessionStorage.clear();
  250 |         });
```