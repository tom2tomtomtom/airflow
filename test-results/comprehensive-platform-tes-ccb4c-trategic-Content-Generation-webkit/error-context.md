# Test info

- Name: AIrWAVE Platform Comprehensive Testing >> 3. Strategic Content Generation
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/comprehensive-platform-test.spec.ts:168:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
  navigated to "https://airwave2.netlify.app/"
  navigated to "https://airwave2.netlify.app/"
  navigated to "https://airwave2.netlify.app/"
  navigated to "https://airwave2.netlify.app/login?from=%2Fdashboard"
  navigated to "https://airwave2.netlify.app/login?from=%2Fdashboard"
  navigated to "https://airwave2.netlify.app/login?from=%2Fdashboard"
============================================================
    at loginToApp (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/comprehensive-platform-test.spec.ts:39:16)
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/comprehensive-platform-test.spec.ts:171:5
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
   1 | import { test, expect, Page } from '@playwright/test';
   2 |
   3 | // Test configuration
   4 | const BASE_URL = 'https://airwave2.netlify.app';
   5 | const TEST_TIMEOUT = 30000;
   6 |
   7 | // Test data
   8 | const testUser = {
   9 |   name: 'AIrWAVE Test User',
   10 |   email: 'test@airwave.app',
   11 |   password: 'TestPassword123'
   12 | };
   13 |
   14 | const creatomateConfig = {
   15 |   templateId: '374ee9e3-de75-4feb-bfae-5c5e11d88d80',
   16 |   apiKey: '5ab32660fef044e5b135a646a78cff8ec7e2503b79e201bad7e566f4b24ec111f2fa7e01a824eaa77904c1783e083efa',
   17 |   modifications: {
   18 |     "Music.source": "https://creatomate.com/files/assets/b5dc815e-dcc9-4c62-9405-f94913936bf5",
   19 |     "Background-1.source": "https://creatomate.com/files/assets/4a7903f0-37bc-48df-9d83-5eb52afd5d07",
   20 |     "Text-1.text": "Test Text 1 - AIrWAVE Platform Test",
   21 |     "Background-2.source": "https://creatomate.com/files/assets/4a6f6b28-bb42-4987-8eca-7ee36b347ee7",
   22 |     "Text-2.text": "Test Text 2 - Matrix Functionality",
   23 |     "Background-3.source": "https://creatomate.com/files/assets/4f6963a5-7286-450b-bc64-f87a3a1d8964",
   24 |     "Text-3.text": "Test Text 3 - Asset Library Integration",
   25 |     "Background-4.source": "https://creatomate.com/files/assets/36899eae-a128-43e6-9e97-f2076f54ea18",
   26 |     "Text-4.text": "Test Text 4 - Video Generation Complete"
   27 |   }
   28 | };
   29 |
   30 | // Helper functions
   31 | async function loginToApp(page: Page) {
   32 |   await page.goto(`${BASE_URL}/login`);
   33 |   await expect(page.locator('h1, h3')).toContainText('AIrWAVE');
   34 |   
   35 |   // Try demo login first
   36 |   const demoButton = page.locator('[data-testid="demo-login-button"]');
   37 |   if (await demoButton.isVisible()) {
   38 |     await demoButton.click();
>  39 |     await page.waitForURL('**/dashboard', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
   40 |     return;
   41 |   }
   42 |   
   43 |   // Fallback to regular login
   44 |   await page.fill('[data-testid="email-input"]', testUser.email);
   45 |   await page.fill('[data-testid="password-input"]', testUser.password);
   46 |   await page.click('[data-testid="sign-in-button"]');
   47 |   await page.waitForURL('**/dashboard', { timeout: 10000 });
   48 | }
   49 |
   50 | async function createTestAsset(page: Page, assetType: string) {
   51 |   // Navigate to assets page
   52 |   await page.goto(`${BASE_URL}/assets`);
   53 |   
   54 |   // Look for upload button
   55 |   const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Asset"), [aria-label*="upload"]').first();
   56 |   
   57 |   if (await uploadButton.isVisible()) {
   58 |     await uploadButton.click();
   59 |     
   60 |     // Create test file based on type
   61 |     let fileContent = '';
   62 |     let fileName = '';
   63 |     let mimeType = '';
   64 |     
   65 |     switch (assetType) {
   66 |       case 'image':
   67 |         fileName = 'test-image.png';
   68 |         mimeType = 'image/png';
   69 |         // Create minimal PNG data
   70 |         fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
   71 |         break;
   72 |       case 'text':
   73 |         fileName = 'test-copy.txt';
   74 |         mimeType = 'text/plain';
   75 |         fileContent = 'Test marketing copy for AIrWAVE platform testing';
   76 |         break;
   77 |       case 'video':
   78 |         fileName = 'test-video.mp4';
   79 |         mimeType = 'video/mp4';
   80 |         fileContent = 'test video data';
   81 |         break;
   82 |     }
   83 |     
   84 |     // Simulate file upload
   85 |     const fileInput = page.locator('input[type="file"]');
   86 |     if (await fileInput.isVisible()) {
   87 |       await fileInput.setInputFiles({
   88 |         name: fileName,
   89 |         mimeType: mimeType,
   90 |         buffer: Buffer.from(fileContent, assetType === 'image' ? 'base64' : 'utf8')
   91 |       });
   92 |     }
   93 |   }
   94 | }
   95 |
   96 | test.describe('AIrWAVE Platform Comprehensive Testing', () => {
   97 |   test.beforeEach(async ({ page }) => {
   98 |     // Set longer timeout for these tests
   99 |     test.setTimeout(60000);
  100 |     
  101 |     // Enable console logging for debugging
  102 |     page.on('console', msg => console.log('Browser console:', msg.text()));
  103 |     page.on('pageerror', error => console.error('Page error:', error.message));
  104 |   });
  105 |
  106 |   test('1. Authentication and Navigation Flow', async ({ page }) => {
  107 |     console.log('Testing authentication and basic navigation...');
  108 |     
  109 |     // Test login
  110 |     await loginToApp(page);
  111 |     
  112 |     // Verify we're on dashboard
  113 |     await expect(page).toHaveURL(/.*dashboard/);
  114 |     await expect(page.locator('h1, h4, h5')).toContainText(/dashboard|welcome|airwave/i);
  115 |     
  116 |     // Test navigation to key pages
  117 |     const navigationTests = [
  118 |       { name: 'Assets', url: '/assets' },
  119 |       { name: 'Templates', url: '/templates' },
  120 |       { name: 'Matrix', url: '/matrix' },
  121 |       { name: 'Strategic Content', url: '/strategic-content' },
  122 |       { name: 'Generate Enhanced', url: '/generate-enhanced' }
  123 |     ];
  124 |     
  125 |     for (const nav of navigationTests) {
  126 |       await page.goto(`${BASE_URL}${nav.url}`);
  127 |       await expect(page).toHaveURL(`*${nav.url}`);
  128 |       console.log(`✓ Navigation to ${nav.name} successful`);
  129 |     }
  130 |   });
  131 |
  132 |   test('2. Asset Library Functionality', async ({ page }) => {
  133 |     console.log('Testing Asset Library functionality...');
  134 |     
  135 |     await loginToApp(page);
  136 |     await page.goto(`${BASE_URL}/assets`);
  137 |     
  138 |     // Wait for page to load
  139 |     await page.waitForLoadState('networkidle');
```