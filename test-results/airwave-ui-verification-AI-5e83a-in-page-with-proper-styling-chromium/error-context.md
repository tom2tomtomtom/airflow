# Test info

- Name: AIrWAVE UI Verification Suite >> Login Page Tests >> should navigate to login page with proper styling
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/airwave-ui-verification.test.ts:137:9

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "rgb(255, 255, 255)"
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/airwave-ui-verification.test.ts:192:51
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
    - /url: "#"
- strong: "Demo Note:"
- text: Click "Continue with Demo" to explore the application with sample data.
- alert
```

# Test source

```ts
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
  132 |       expect(criticalErrors.length).toBeLessThan(3); // Allow for minor non-critical errors
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
> 192 |           expect(inputStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
      |                                                   ^ Error: expect(received).not.toBe(expected) // Object.is equality
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
  233 |       await waitForPageLoad(page);
  234 |       
  235 |       // Look for demo mode or try direct dashboard access
  236 |       const demoButton = page.locator('text=Demo').first();
  237 |       if (await demoButton.count() > 0) {
  238 |         await demoButton.click();
  239 |         await waitForPageLoad(page);
  240 |       } else {
  241 |         // Try direct dashboard access
  242 |         await page.goto(BASE_URL + '/dashboard');
  243 |         await waitForPageLoad(page);
  244 |       }
  245 |       
  246 |       // Take screenshot of dashboard
  247 |       await page.screenshot({ 
  248 |         path: 'test-results/dashboard-full.png', 
  249 |         fullPage: true 
  250 |       });
  251 |       
  252 |       // Verify Carbon Black theme in dashboard
  253 |       await verifyCarbonBlackTheme(page);
  254 |       
  255 |       // Check for navigation sidebar
  256 |       const navigation = [
  257 |         page.locator('nav'),
  258 |         page.locator('.sidebar'),
  259 |         page.locator('[role="navigation"]'),
  260 |         page.locator('.nav')
  261 |       ];
  262 |       
  263 |       let navFound = false;
  264 |       for (const nav of navigation) {
  265 |         if (await nav.count() > 0) {
  266 |           navFound = true;
  267 |           
  268 |           // Verify navigation icons are properly sized
  269 |           const navIcons = nav.locator('svg, img, .icon');
  270 |           const iconCount = await navIcons.count();
  271 |           
  272 |           if (iconCount > 0) {
  273 |             await verifyIconSizes(page);
  274 |           }
  275 |           break;
  276 |         }
  277 |       }
  278 |       
  279 |       // Check for Material-UI components
  280 |       const muiComponents = [
  281 |         page.locator('.MuiCard-root'),
  282 |         page.locator('.MuiButton-root'),
  283 |         page.locator('.MuiPaper-root'),
  284 |         page.locator('[class*="Mui"]')
  285 |       ];
  286 |       
  287 |       for (const component of muiComponents) {
  288 |         if (await component.count() > 0) {
  289 |           const styles = await component.first().evaluate(el => {
  290 |             const computed = window.getComputedStyle(el);
  291 |             return {
  292 |               backgroundColor: computed.backgroundColor,
```