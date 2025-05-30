# Test info

- Name: AIrWAVE Deployment Tests >> Homepage loads successfully
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/deployment.spec.ts:6:7

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('nav')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('nav')

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/deployment.spec.ts:13:39
```

# Page snapshot

```yaml
- heading "AIrWAVE" [level=2]
- paragraph: AI-Powered Content Management Platform
- paragraph: Create, manage, and optimize your digital content with the power of AI.
- button "Login"
- button "Get Started"
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const BASE_URL = 'https://airwave2.netlify.app';
   4 |
   5 | test.describe('AIrWAVE Deployment Tests', () => {
   6 |   test('Homepage loads successfully', async ({ page }) => {
   7 |     await page.goto(BASE_URL);
   8 |     
   9 |     // Check if the page loads without errors
   10 |     await expect(page).toHaveTitle(/AIrWAVE/);
   11 |     
   12 |     // Check for main navigation elements
>  13 |     await expect(page.locator('nav')).toBeVisible();
      |                                       ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
   14 |     
   15 |     // Check for login/signup buttons or dashboard link
   16 |     const hasAuthButtons = await page.locator('[href="/login"], [href="/signup"], [href="/dashboard"]').count() > 0;
   17 |     expect(hasAuthButtons).toBeTruthy();
   18 |   });
   19 |
   20 |   test('Login page is accessible', async ({ page }) => {
   21 |     await page.goto(`${BASE_URL}/login`);
   22 |     
   23 |     // Check page loads
   24 |     await expect(page).toHaveTitle(/Login|AIrWAVE/);
   25 |     
   26 |     // Check for login form elements
   27 |     await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
   28 |     await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
   29 |     await expect(page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')).toBeVisible();
   30 |   });
   31 |
   32 |   test('API health endpoint is working', async ({ request }) => {
   33 |     const response = await request.get(`${BASE_URL}/api/health`);
   34 |     expect(response.status()).toBe(200);
   35 |     
   36 |     const data = await response.json();
   37 |     expect(data).toHaveProperty('status', 'ok');
   38 |   });
   39 |
   40 |   test('API system status is accessible', async ({ request }) => {
   41 |     const response = await request.get(`${BASE_URL}/api/system/status`);
   42 |     expect(response.status()).toBe(200);
   43 |     
   44 |     const data = await response.json();
   45 |     expect(data).toHaveProperty('status');
   46 |     expect(data).toHaveProperty('timestamp');
   47 |   });
   48 |
   49 |   test('Navigation menu works correctly', async ({ page }) => {
   50 |     await page.goto(BASE_URL);
   51 |     
   52 |     // Try to access different sections
   53 |     const navigationTests = [
   54 |       { path: '/dashboard', expectedTitle: /Dashboard|AIrWAVE/ },
   55 |       { path: '/campaigns', expectedTitle: /Campaigns|AIrWAVE/ },
   56 |       { path: '/analytics', expectedTitle: /Analytics|AIrWAVE/ },
   57 |       { path: '/templates', expectedTitle: /Templates|AIrWAVE/ },
   58 |     ];
   59 |
   60 |     for (const navTest of navigationTests) {
   61 |       await page.goto(`${BASE_URL}${navTest.path}`);
   62 |       
   63 |       // The page might redirect to login if not authenticated, that's expected
   64 |       const currentUrl = page.url();
   65 |       const isOnLoginPage = currentUrl.includes('/login');
   66 |       const isOnTargetPage = currentUrl.includes(navTest.path);
   67 |       
   68 |       // Either we're on the target page or redirected to login (both are valid)
   69 |       expect(isOnTargetPage || isOnLoginPage).toBeTruthy();
   70 |       
   71 |       // If we're on the target page, check the title
   72 |       if (isOnTargetPage) {
   73 |         await expect(page).toHaveTitle(navTest.expectedTitle);
   74 |       }
   75 |     }
   76 |   });
   77 |
   78 |   test('Static assets load correctly', async ({ page }) => {
   79 |     await page.goto(BASE_URL);
   80 |     
   81 |     // Check that CSS is loaded (no broken styles)
   82 |     const bodyBackground = await page.locator('body').evaluate(el => 
   83 |       window.getComputedStyle(el).backgroundColor
   84 |     );
   85 |     
   86 |     // Should not be the default browser white (indicates CSS loaded)
   87 |     expect(bodyBackground).not.toBe('rgba(0, 0, 0, 0)');
   88 |     
   89 |     // Check for any 404 errors in network
   90 |     const failedRequests: string[] = [];
   91 |     page.on('requestfailed', (request) => {
   92 |       failedRequests.push(request.url());
   93 |     });
   94 |     
   95 |     // Wait for page to fully load
   96 |     await page.waitForLoadState('networkidle');
   97 |     
   98 |     // Should have minimal failed requests (some external resources might fail, that's ok)
   99 |     expect(failedRequests.length).toBeLessThan(5);
  100 |   });
  101 |
  102 |   test('Responsive design works on mobile', async ({ page }) => {
  103 |     // Set mobile viewport
  104 |     await page.setViewportSize({ width: 375, height: 667 });
  105 |     await page.goto(BASE_URL);
  106 |     
  107 |     // Check that the page is responsive
  108 |     const bodyWidth = await page.locator('body').evaluate(el => el.clientWidth);
  109 |     expect(bodyWidth).toBeLessThanOrEqual(375);
  110 |     
  111 |     // Check that navigation adapts to mobile (hamburger menu, etc.)
  112 |     const hasResponsiveNav = await page.locator(
  113 |       '[aria-label*="menu"], .hamburger, .mobile-menu, button:has-text("Menu")'
```