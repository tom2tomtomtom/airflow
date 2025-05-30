# Test info

- Name: Asset Upload Integration Tests >> Asset Library Display
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/asset-upload-test.spec.ts:174:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
  navigated to "https://airwave2.netlify.app/"
  navigated to "https://airwave2.netlify.app/"
  navigated to "https://airwave2.netlify.app/"
  navigated to "https://airwave2.netlify.app/login?from=%2Fdashboard"
  navigated to "https://airwave2.netlify.app/login?from=%2Fdashboard"
  navigated to "https://airwave2.netlify.app/login?from=%2Fdashboard"
============================================================
    at loginWithDemo (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/asset-upload-test.spec.ts:12:16)
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/asset-upload-test.spec.ts:177:5
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
   3 | const BASE_URL = 'https://airwave2.netlify.app';
   4 |
   5 | async function loginWithDemo(page: Page) {
   6 |   await page.goto(`${BASE_URL}/login`);
   7 |   
   8 |   // Use demo login
   9 |   const demoButton = page.locator('[data-testid="demo-login-button"]');
   10 |   if (await demoButton.isVisible()) {
   11 |     await demoButton.click();
>  12 |     await page.waitForURL('**/dashboard', { timeout: 15000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
   13 |   }
   14 | }
   15 |
   16 | test.describe('Asset Upload Integration Tests', () => {
   17 |   test.beforeEach(async ({ page }) => {
   18 |     test.setTimeout(60000);
   19 |   });
   20 |
   21 |   test('Real Asset Upload Flow', async ({ page }) => {
   22 |     console.log('Testing real asset upload functionality...');
   23 |     
   24 |     // Login
   25 |     await loginWithDemo(page);
   26 |     
   27 |     // Navigate to assets page
   28 |     await page.goto(`${BASE_URL}/assets`);
   29 |     await page.waitForLoadState('networkidle');
   30 |     
   31 |     // Look for upload button
   32 |     const uploadButtons = page.locator('button:has-text("Upload"), button:has-text("Add"), [aria-label*="upload"]');
   33 |     const uploadButton = uploadButtons.first();
   34 |     
   35 |     if (await uploadButton.isVisible()) {
   36 |       console.log('✅ Upload button found');
   37 |       await uploadButton.click();
   38 |       
   39 |       // Wait for upload modal
   40 |       const uploadModal = page.locator('[data-testid="upload-modal"]');
   41 |       await expect(uploadModal).toBeVisible();
   42 |       console.log('✅ Upload modal opened');
   43 |       
   44 |       // Test file input
   45 |       const fileInput = page.locator('input[type="file"]');
   46 |       if (await fileInput.isVisible()) {
   47 |         console.log('✅ File input found');
   48 |         
   49 |         // Create test file
   50 |         const testFile = {
   51 |           name: 'test-image.png',
   52 |           mimeType: 'image/png',
   53 |           buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
   54 |         };
   55 |         
   56 |         // Upload test file
   57 |         await fileInput.setInputFiles(testFile);
   58 |         console.log('✅ Test file selected');
   59 |         
   60 |         // Wait for file to appear in list
   61 |         await page.waitForTimeout(1000);
   62 |         
   63 |         // Look for upload button in modal
   64 |         const uploadBtn = page.locator('button:has-text("Upload")');
   65 |         if (await uploadBtn.isVisible()) {
   66 |           console.log('✅ Upload button in modal found');
   67 |           
   68 |           // Click upload
   69 |           await uploadBtn.click();
   70 |           console.log('✅ Upload initiated');
   71 |           
   72 |           // Wait for upload to complete
   73 |           await page.waitForTimeout(5000);
   74 |           
   75 |           // Check if modal closed (indicates success)
   76 |           const isModalClosed = await uploadModal.isHidden();
   77 |           if (isModalClosed) {
   78 |             console.log('✅ Upload completed - modal closed');
   79 |           } else {
   80 |             console.log('⚠️ Modal still open - checking progress');
   81 |           }
   82 |         }
   83 |       }
   84 |     } else {
   85 |       console.log('⚠️ Upload button not found - checking page structure');
   86 |       
   87 |       // Log page content for debugging
   88 |       const pageContent = await page.textContent('body');
   89 |       console.log('Page content:', pageContent?.substring(0, 500));
   90 |     }
   91 |     
   92 |     // Check if assets appear in the grid
   93 |     await page.waitForTimeout(2000);
   94 |     const assetGrid = page.locator('[data-testid="asset-grid"], .asset-grid, .MuiGrid-container');
   95 |     if (await assetGrid.isVisible()) {
   96 |       console.log('✅ Asset grid visible');
   97 |     }
   98 |     
   99 |     console.log('Asset upload flow test completed');
  100 |   });
  101 |
  102 |   test('API Upload Endpoint Test', async ({ page }) => {
  103 |     console.log('Testing upload API endpoint...');
  104 |     
  105 |     // Login first to get session
  106 |     await loginWithDemo(page);
  107 |     
  108 |     // Test API endpoint directly
  109 |     const apiResponse = await page.evaluate(async () => {
  110 |       try {
  111 |         // Create test FormData
  112 |         const formData = new FormData();
```