# Test info

- Name: Authentication & Client Context >> Session Management >> should handle session expiry gracefully
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth.test.ts:239:9

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /.*\/login/
Received string:  "http://localhost:3000/assets"
Call log:
  - expect.toHaveURL with timeout 10000ms
  - waiting for locator(':root')
    14 × locator resolved to <html>…</html>
       - unexpected value "http://localhost:3000/assets"

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth.test.ts:256:28
```

# Page snapshot

```yaml
- banner:
  - text: AIrWAVE Dashboard
  - button "Select Client"
  - button
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
  - heading "Asset Library" [level=4]
  - tablist:
    - tab "All Assets" [selected]
    - tab "Images"
    - tab "Videos"
    - tab "Audio"
  - heading "IMAGE" [level=6]
  - heading "Sample Image 1" [level=6]
  - paragraph: image
  - heading "IMAGE" [level=6]
  - heading "Sample Image 2" [level=6]
  - paragraph: image
  - heading "VIDEO" [level=6]
  - heading "Sample Video 1" [level=6]
  - paragraph: video
  - button "Add asset"
  - menu:
    - menuitem "Upload Files"
    - menuitem "AI Generate"
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
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
  251 |         
  252 |         // Try to access protected route
  253 |         await page.goto('/assets');
  254 |         
  255 |         // Should redirect to login
> 256 |         await expect(page).toHaveURL(/.*\/login/);
      |                            ^ Error: Timed out 10000ms waiting for expect(locator).toHaveURL(expected)
  257 |         
  258 |         // Should show session expired message (if implemented)
  259 |         // await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
  260 |         
  261 |         await page.screenshot({ path: 'test-results/session-expired.png' });
  262 |       } else {
  263 |         test.skip('Skipping session test - in demo mode');
  264 |       }
  265 |     });
  266 |
  267 |     test('should remember login state after page refresh', async ({ page, authHelper }) => {
  268 |       const isDemoMode = await authHelper.isInDemoMode();
  269 |       
  270 |       if (!isDemoMode) {
  271 |         // Login
  272 |         await authHelper.login();
  273 |         
  274 |         // Refresh the page
  275 |         await page.reload();
  276 |         await page.waitForLoadState('networkidle');
  277 |         
  278 |         // Should still be logged in
  279 |         await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  280 |         
  281 |         // Should not redirect to login
  282 |         expect(page.url()).not.toContain('/login');
  283 |         
  284 |         await page.screenshot({ path: 'test-results/after-refresh.png' });
  285 |       } else {
  286 |         test.skip('Skipping session test - in demo mode');
  287 |       }
  288 |     });
  289 |   });
  290 | });
```