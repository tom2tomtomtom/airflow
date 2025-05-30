# Test info

- Name: AIrWAVE UI Verification Suite >> Landing Page Tests >> should have no JavaScript console errors
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/airwave-ui-verification.test.ts:107:9

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 3
Received:   9
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/airwave-ui-verification.test.ts:132:37
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
   32 |
   33 | // Helper function to check icon sizes
   34 | async function verifyIconSizes(page: Page) {
   35 |   const icons = await page.locator('svg, img[src*="icon"], .icon').all();
   36 |   
   37 |   for (const icon of icons) {
   38 |     const box = await icon.boundingBox();
   39 |     if (box) {
   40 |       // Icons should not be massive (> 200px typically indicates an issue)
   41 |       expect(box.width).toBeLessThan(200);
   42 |       expect(box.height).toBeLessThan(200);
   43 |       
   44 |       // Icons should have reasonable minimum size (not invisible)
   45 |       expect(box.width).toBeGreaterThan(8);
   46 |       expect(box.height).toBeGreaterThan(8);
   47 |     }
   48 |   }
   49 | }
   50 |
   51 | test.describe('AIrWAVE UI Verification Suite', () => {
   52 |   
   53 |   test.describe('Landing Page Tests', () => {
   54 |     test('should load landing page with Carbon Black theme', async ({ page }) => {
   55 |       await page.goto(BASE_URL);
   56 |       await waitForPageLoad(page);
   57 |       
   58 |       // Take screenshot for visual verification
   59 |       await page.screenshot({ 
   60 |         path: 'test-results/landing-page-full.png', 
   61 |         fullPage: true 
   62 |       });
   63 |       
   64 |       // Verify page loaded successfully
   65 |       expect(page.url()).toBe(BASE_URL + '/');
   66 |       
   67 |       // Check for Carbon Black theme
   68 |       await verifyCarbonBlackTheme(page);
   69 |       
   70 |       // Verify no massive icons
   71 |       await verifyIconSizes(page);
   72 |       
   73 |       // Check for proper typography loading
   74 |       const headings = page.locator('h1, h2, h3');
   75 |       const firstHeading = headings.first();
   76 |       if (await firstHeading.count() > 0) {
   77 |         const fontSize = await firstHeading.evaluate(el => 
   78 |           window.getComputedStyle(el).fontSize
   79 |         );
   80 |         expect(fontSize).not.toBe('16px'); // Should have custom styling
   81 |       }
   82 |     });
   83 |
   84 |     test('should have proper amber accent colors', async ({ page }) => {
   85 |       await page.goto(BASE_URL);
   86 |       await waitForPageLoad(page);
   87 |       
   88 |       // Look for primary buttons or accent elements
   89 |       const buttons = page.locator('button, .btn, [role="button"]');
   90 |       const buttonCount = await buttons.count();
   91 |       
   92 |       if (buttonCount > 0) {
   93 |         const buttonStyles = await buttons.first().evaluate(el => {
   94 |           const styles = window.getComputedStyle(el);
   95 |           return {
   96 |             backgroundColor: styles.backgroundColor,
   97 |             color: styles.color,
   98 |             borderColor: styles.borderColor,
   99 |           };
  100 |         });
  101 |         
  102 |         // Check for amber/orange accent colors in buttons
  103 |         console.log('Button styles:', buttonStyles);
  104 |       }
  105 |     });
  106 |
  107 |     test('should have no JavaScript console errors', async ({ page }) => {
  108 |       const consoleErrors: string[] = [];
  109 |       page.on('console', msg => {
  110 |         if (msg.type() === 'error') {
  111 |           consoleErrors.push(msg.text());
  112 |         }
  113 |       });
  114 |       
  115 |       await page.goto(BASE_URL);
  116 |       await waitForPageLoad(page);
  117 |       
  118 |       // Allow some time for any delayed scripts to run
  119 |       await page.waitForTimeout(3000);
  120 |       
  121 |       // Check for critical errors (filter out minor warnings)
  122 |       const criticalErrors = consoleErrors.filter(error => 
  123 |         !error.includes('favicon') && 
  124 |         !error.includes('manifest') &&
  125 |         !error.toLowerCase().includes('warning')
  126 |       );
  127 |       
  128 |       if (criticalErrors.length > 0) {
  129 |         console.log('Console errors found:', criticalErrors);
  130 |       }
  131 |       
> 132 |       expect(criticalErrors.length).toBeLessThan(3); // Allow for minor non-critical errors
      |                                     ^ Error: expect(received).toBeLessThan(expected)
  133 |     });
  134 |   });
  135 |
  136 |   test.describe('Login Page Tests', () => {
  137 |     test('should navigate to login page with proper styling', async ({ page }) => {
  138 |       await page.goto(BASE_URL);
  139 |       await waitForPageLoad(page);
  140 |       
  141 |       // Try to find and click login link
  142 |       const loginLinks = [
  143 |         page.locator('a[href*="login"]'),
  144 |         page.locator('text=Login'),
  145 |         page.locator('text=Sign In'),
  146 |         page.locator('button:has-text("Login")'),
  147 |         page.locator('[data-testid*="login"]')
  148 |       ];
  149 |       
  150 |       let loginFound = false;
  151 |       for (const link of loginLinks) {
  152 |         if (await link.count() > 0) {
  153 |           await link.first().click();
  154 |           loginFound = true;
  155 |           break;
  156 |         }
  157 |       }
  158 |       
  159 |       if (!loginFound) {
  160 |         // Try direct navigation
  161 |         await page.goto(BASE_URL + '/login');
  162 |       }
  163 |       
  164 |       await waitForPageLoad(page);
  165 |       
  166 |       // Take screenshot of login page
  167 |       await page.screenshot({ 
  168 |         path: 'test-results/login-page.png', 
  169 |         fullPage: true 
  170 |       });
  171 |       
  172 |       // Verify Carbon Black theme on login page
  173 |       await verifyCarbonBlackTheme(page);
  174 |       
  175 |       // Check for form elements with proper styling
  176 |       const forms = page.locator('form');
  177 |       if (await forms.count() > 0) {
  178 |         const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]');
  179 |         const inputCount = await inputs.count();
  180 |         
  181 |         if (inputCount > 0) {
  182 |           const inputStyles = await inputs.first().evaluate(el => {
  183 |             const styles = window.getComputedStyle(el);
  184 |             return {
  185 |               backgroundColor: styles.backgroundColor,
  186 |               borderColor: styles.borderColor,
  187 |               color: styles.color,
  188 |             };
  189 |           });
  190 |           
  191 |           // Input should have dark theme styling
  192 |           expect(inputStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
  193 |         }
  194 |       }
  195 |     });
  196 |
  197 |     test('should test demo mode functionality', async ({ page }) => {
  198 |       await page.goto(BASE_URL + '/login');
  199 |       await waitForPageLoad(page);
  200 |       
  201 |       // Look for demo mode button/link
  202 |       const demoElements = [
  203 |         page.locator('text=Demo'),
  204 |         page.locator('text=Try Demo'),
  205 |         page.locator('button:has-text("Demo")'),
  206 |         page.locator('a:has-text("Demo")'),
  207 |         page.locator('[data-testid*="demo"]')
  208 |       ];
  209 |       
  210 |       for (const element of demoElements) {
  211 |         if (await element.count() > 0) {
  212 |           await element.first().click();
  213 |           await waitForPageLoad(page);
  214 |           
  215 |           // Take screenshot after demo mode activation
  216 |           await page.screenshot({ 
  217 |             path: 'test-results/demo-mode-activated.png' 
  218 |           });
  219 |           
  220 |           // Verify we're in demo mode (check for dashboard or different URL)
  221 |           const currentUrl = page.url();
  222 |           expect(currentUrl).not.toBe(BASE_URL + '/login');
  223 |           break;
  224 |         }
  225 |       }
  226 |     });
  227 |   });
  228 |
  229 |   test.describe('Dashboard Tests', () => {
  230 |     test('should access dashboard and verify navigation', async ({ page }) => {
  231 |       // First try to access demo mode
  232 |       await page.goto(BASE_URL + '/login');
```