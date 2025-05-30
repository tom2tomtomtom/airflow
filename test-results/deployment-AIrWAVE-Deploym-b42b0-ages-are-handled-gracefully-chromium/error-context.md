# Test info

- Name: AIrWAVE Deployment Tests >> Error pages are handled gracefully
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/deployment.spec.ts:121:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/deployment.spec.ts:129:43
```

# Page snapshot

```yaml
- heading "AIrWAVE" [level=1]
- heading "AI-Powered Digital Asset Production" [level=6]
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button
- button "Sign In"
- separator:
  - paragraph: OR
- button "Continue with Demo"
- paragraph:
  - text: Don't have an account?
  - link "Sign up":
    - /url: /signup
- strong: "Demo Note:"
- text: Click "Continue with Demo" to explore the application with sample data.
- alert
```

# Test source

```ts
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
  114 |     ).count() > 0;
  115 |     
  116 |     // Either has responsive nav or nav is hidden/simplified
  117 |     const navIsVisible = await page.locator('nav').isVisible();
  118 |     expect(hasResponsiveNav || !navIsVisible).toBeTruthy();
  119 |   });
  120 |
  121 |   test('Error pages are handled gracefully', async ({ page }) => {
  122 |     // Test 404 page
  123 |     await page.goto(`${BASE_URL}/non-existent-page-12345`);
  124 |     
  125 |     // Should either show a 404 page or redirect gracefully
  126 |     const has404Content = await page.locator(':has-text("404"), :has-text("Not Found"), :has-text("Page not found")').count() > 0;
  127 |     const isRedirected = !page.url().includes('non-existent-page-12345');
  128 |     
> 129 |     expect(has404Content || isRedirected).toBeTruthy();
      |                                           ^ Error: expect(received).toBeTruthy()
  130 |   });
  131 |
  132 |   test('New API endpoints are accessible', async ({ request }) => {
  133 |     // Test the new execution monitoring API
  134 |     const executionsResponse = await request.get(`${BASE_URL}/api/executions`);
  135 |     // Should be 401 (unauthorized) or 200 (if somehow authenticated)
  136 |     expect([200, 401, 403]).toContain(executionsResponse.status());
  137 |
  138 |     // Test the new approvals API
  139 |     const approvalsResponse = await request.get(`${BASE_URL}/api/approvals`);
  140 |     expect([200, 401, 403]).toContain(approvalsResponse.status());
  141 |
  142 |     // Test copy assets API
  143 |     const copyAssetsResponse = await request.get(`${BASE_URL}/api/copy-assets`);
  144 |     expect([200, 401, 403]).toContain(copyAssetsResponse.status());
  145 |
  146 |     // Test campaigns API
  147 |     const campaignsResponse = await request.get(`${BASE_URL}/api/campaigns`);
  148 |     expect([200, 401, 403]).toContain(campaignsResponse.status());
  149 |   });
  150 |
  151 |   test('Core pages load without JavaScript errors', async ({ page }) => {
  152 |     const consoleErrors: string[] = [];
  153 |     
  154 |     page.on('console', (msg) => {
  155 |       if (msg.type() === 'error') {
  156 |         consoleErrors.push(msg.text());
  157 |       }
  158 |     });
  159 |
  160 |     const pagesToTest = [
  161 |       '/',
  162 |       '/login',
  163 |       '/signup', 
  164 |       '/dashboard',
  165 |       '/campaigns',
  166 |       '/templates',
  167 |       '/analytics'
  168 |     ];
  169 |
  170 |     for (const pagePath of pagesToTest) {
  171 |       await page.goto(`${BASE_URL}${pagePath}`);
  172 |       await page.waitForLoadState('domcontentloaded');
  173 |       
  174 |       // Wait a bit for any async errors
  175 |       await page.waitForTimeout(1000);
  176 |     }
  177 |
  178 |     // Filter out common non-critical errors
  179 |     const criticalErrors = consoleErrors.filter(error => 
  180 |       !error.includes('favicon') &&
  181 |       !error.includes('google') &&
  182 |       !error.includes('gtag') &&
  183 |       !error.includes('analytics') &&
  184 |       !error.includes('external')
  185 |     );
  186 |
  187 |     // Should have minimal critical console errors
  188 |     expect(criticalErrors.length).toBeLessThan(3);
  189 |   });
  190 |
  191 |   test('Performance is acceptable', async ({ page }) => {
  192 |     await page.goto(BASE_URL);
  193 |     
  194 |     // Measure load time
  195 |     const startTime = Date.now();
  196 |     await page.waitForLoadState('networkidle');
  197 |     const loadTime = Date.now() - startTime;
  198 |     
  199 |     // Should load within reasonable time (10 seconds for cold start)
  200 |     expect(loadTime).toBeLessThan(10000);
  201 |     
  202 |     // Check Core Web Vitals if available
  203 |     const performanceMetrics = await page.evaluate(() => {
  204 |       return new Promise((resolve) => {
  205 |         new PerformanceObserver((list) => {
  206 |           const entries = list.getEntries();
  207 |           const metrics = {};
  208 |           entries.forEach((entry) => {
  209 |             if (entry.name === 'first-contentful-paint') {
  210 |               metrics.fcp = entry.startTime;
  211 |             }
  212 |             if (entry.name === 'largest-contentful-paint') {
  213 |               metrics.lcp = entry.startTime;
  214 |             }
  215 |           });
  216 |           resolve(metrics);
  217 |         }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  218 |         
  219 |         // Resolve after timeout if no metrics available
  220 |         setTimeout(() => resolve({}), 2000);
  221 |       });
  222 |     });
  223 |
  224 |     console.log('Performance metrics:', performanceMetrics);
  225 |   });
  226 | });
```