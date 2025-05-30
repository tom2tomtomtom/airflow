# Test info

- Name: AIrWAVE UI Verification Suite >> CSS and Theme Verification >> should verify CSS custom properties are loaded
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/airwave-ui-verification.test.ts:356:9

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/airwave-ui-verification.test.ts:391:49
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
  291 |             return {
  292 |               backgroundColor: computed.backgroundColor,
  293 |               color: computed.color,
  294 |             };
  295 |           });
  296 |           
  297 |           // Material-UI components should have dark theme
  298 |           expect(styles.backgroundColor).not.toBe('rgb(255, 255, 255)');
  299 |           break;
  300 |         }
  301 |       }
  302 |     });
  303 |
  304 |     test('should verify cards and interactive elements', async ({ page }) => {
  305 |       await page.goto(BASE_URL + '/dashboard');
  306 |       await waitForPageLoad(page);
  307 |       
  308 |       // Look for cards
  309 |       const cards = [
  310 |         page.locator('.card'),
  311 |         page.locator('.MuiCard-root'),
  312 |         page.locator('[role="article"]'),
  313 |         page.locator('.dashboard-card')
  314 |       ];
  315 |       
  316 |       for (const cardSelector of cards) {
  317 |         const cardCount = await cardSelector.count();
  318 |         if (cardCount > 0) {
  319 |           // Take screenshot focusing on cards
  320 |           await page.screenshot({ 
  321 |             path: 'test-results/dashboard-cards.png' 
  322 |           });
  323 |           
  324 |           const cardStyles = await cardSelector.first().evaluate(el => {
  325 |             const styles = window.getComputedStyle(el);
  326 |             return {
  327 |               backgroundColor: styles.backgroundColor,
  328 |               borderRadius: styles.borderRadius,
  329 |               boxShadow: styles.boxShadow,
  330 |             };
  331 |           });
  332 |           
  333 |           // Cards should have dark theme styling
  334 |           expect(cardStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
  335 |           break;
  336 |         }
  337 |       }
  338 |       
  339 |       // Test interactive elements
  340 |       const buttons = page.locator('button, .btn, [role="button"]');
  341 |       const buttonCount = await buttons.count();
  342 |       
  343 |       if (buttonCount > 0) {
  344 |         // Test hover state on first button
  345 |         await buttons.first().hover();
  346 |         await page.waitForTimeout(500);
  347 |         
  348 |         await page.screenshot({ 
  349 |           path: 'test-results/button-hover-state.png' 
  350 |         });
  351 |       }
  352 |     });
  353 |   });
  354 |
  355 |   test.describe('CSS and Theme Verification', () => {
  356 |     test('should verify CSS custom properties are loaded', async ({ page }) => {
  357 |       await page.goto(BASE_URL);
  358 |       await waitForPageLoad(page);
  359 |       
  360 |       const cssProperties = await page.evaluate(() => {
  361 |         const root = document.documentElement;
  362 |         const computedStyle = window.getComputedStyle(root);
  363 |         
  364 |         // Check for common CSS custom properties
  365 |         const properties = [
  366 |           '--primary-color',
  367 |           '--secondary-color',
  368 |           '--background-color',
  369 |           '--text-color',
  370 |           '--accent-color',
  371 |           '--theme-primary',
  372 |           '--theme-secondary',
  373 |           '--carbon-black',
  374 |           '--amber-accent'
  375 |         ];
  376 |         
  377 |         const foundProperties: Record<string, string> = {};
  378 |         properties.forEach(prop => {
  379 |           const value = computedStyle.getPropertyValue(prop);
  380 |           if (value.trim()) {
  381 |             foundProperties[prop] = value.trim();
  382 |           }
  383 |         });
  384 |         
  385 |         return foundProperties;
  386 |       });
  387 |       
  388 |       console.log('Found CSS custom properties:', cssProperties);
  389 |       
  390 |       // Should have at least some custom properties defined
> 391 |       expect(Object.keys(cssProperties).length).toBeGreaterThan(0);
      |                                                 ^ Error: expect(received).toBeGreaterThan(expected)
  392 |     });
  393 |
  394 |     test('should verify no white background with massive icons issue', async ({ page }) => {
  395 |       await page.goto(BASE_URL);
  396 |       await waitForPageLoad(page);
  397 |       
  398 |       // Check body background is not white
  399 |       const bodyBg = await page.evaluate(() => {
  400 |         const body = document.body;
  401 |         return window.getComputedStyle(body).backgroundColor;
  402 |       });
  403 |       
  404 |       expect(bodyBg).not.toBe('rgb(255, 255, 255)');
  405 |       expect(bodyBg).not.toBe('rgba(255, 255, 255, 1)');
  406 |       expect(bodyBg).not.toBe('#ffffff');
  407 |       expect(bodyBg).not.toBe('#fff');
  408 |       
  409 |       // Verify icon sizes are not massive
  410 |       await verifyIconSizes(page);
  411 |       
  412 |       // Take screenshot for visual confirmation
  413 |       await page.screenshot({ 
  414 |         path: 'test-results/no-white-background-verification.png',
  415 |         fullPage: true 
  416 |       });
  417 |     });
  418 |
  419 |     test('should check responsive design', async ({ page }) => {
  420 |       await page.goto(BASE_URL);
  421 |       await waitForPageLoad(page);
  422 |       
  423 |       // Test different viewport sizes
  424 |       const viewports = [
  425 |         { width: 1920, height: 1080, name: 'desktop' },
  426 |         { width: 1024, height: 768, name: 'tablet' },
  427 |         { width: 375, height: 667, name: 'mobile' }
  428 |       ];
  429 |       
  430 |       for (const viewport of viewports) {
  431 |         await page.setViewportSize({ 
  432 |           width: viewport.width, 
  433 |           height: viewport.height 
  434 |         });
  435 |         
  436 |         await page.waitForTimeout(1000); // Allow layout to adjust
  437 |         
  438 |         await page.screenshot({ 
  439 |           path: `test-results/responsive-${viewport.name}.png`,
  440 |           fullPage: true 
  441 |         });
  442 |         
  443 |         // Verify no horizontal scroll on mobile
  444 |         if (viewport.name === 'mobile') {
  445 |           const scrollWidth = await page.evaluate(() => 
  446 |             document.documentElement.scrollWidth
  447 |           );
  448 |           expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small tolerance
  449 |         }
  450 |       }
  451 |     });
  452 |   });
  453 |
  454 |   test.describe('Performance and Accessibility', () => {
  455 |     test('should have reasonable load times', async ({ page }) => {
  456 |       const start = Date.now();
  457 |       await page.goto(BASE_URL);
  458 |       await waitForPageLoad(page);
  459 |       const loadTime = Date.now() - start;
  460 |       
  461 |       console.log(`Page load time: ${loadTime}ms`);
  462 |       
  463 |       // Should load within reasonable time (15 seconds max for slow networks)
  464 |       expect(loadTime).toBeLessThan(15000);
  465 |     });
  466 |
  467 |     test('should verify fonts load properly', async ({ page }) => {
  468 |       await page.goto(BASE_URL);
  469 |       await waitForPageLoad(page);
  470 |       
  471 |       const fontInfo = await page.evaluate(() => {
  472 |         const testElement = document.createElement('div');
  473 |         testElement.style.fontFamily = 'inherit';
  474 |         document.body.appendChild(testElement);
  475 |         
  476 |         const computedStyle = window.getComputedStyle(testElement);
  477 |         const fontFamily = computedStyle.fontFamily;
  478 |         
  479 |         document.body.removeChild(testElement);
  480 |         
  481 |         return {
  482 |           fontFamily,
  483 |           isFallback: fontFamily.includes('serif') || fontFamily.includes('sans-serif')
  484 |         };
  485 |       });
  486 |       
  487 |       console.log('Font info:', fontInfo);
  488 |       
  489 |       // Should not be using only fallback fonts
  490 |       expect(fontInfo.fontFamily).not.toBe('serif');
  491 |       expect(fontInfo.fontFamily).not.toBe('sans-serif');
```