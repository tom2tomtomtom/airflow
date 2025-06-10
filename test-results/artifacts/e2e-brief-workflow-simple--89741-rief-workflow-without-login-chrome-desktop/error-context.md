# Test info

- Name: Brief Workflow Simple Test >> should test brief workflow without login
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/brief-workflow-simple.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/flow
Call log:
  - navigating to "http://localhost:3001/flow", waiting until "load"

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/brief-workflow-simple.spec.ts:8:16
```

# Page snapshot

```yaml
- heading "This site can’t be reached" [level=1]
- paragraph:
  - strong: localhost
  - text: refused to connect.
- paragraph: "Try:"
- list:
  - listitem: Checking the connection
  - listitem:
    - link "Checking the proxy and the firewall":
      - /url: "#buttons"
- text: ERR_CONNECTION_REFUSED
- button "Reload"
- button "Details"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Brief Workflow Simple Test', () => {
   4 |   test('should test brief workflow without login', async ({ page }) => {
   5 |     console.log('=== Starting Simple Brief Workflow Test ===');
   6 |     
   7 |     // Navigate directly to flow page
>  8 |     await page.goto('http://localhost:3001/flow');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/flow
   9 |     await page.waitForLoadState('networkidle');
   10 |     
   11 |     // Take screenshot of initial state
   12 |     await page.screenshot({ path: 'debug-flow-initial.png', fullPage: true });
   13 |     console.log('Initial page loaded');
   14 |     
   15 |     // Look for any workflow or brief related elements
   16 |     const workflowElements = await page.locator('*').filter({ hasText: /brief|workflow|upload/i }).all();
   17 |     console.log(`Found ${workflowElements.length} workflow-related elements`);
   18 |     
   19 |     // Check if we need to login
   20 |     if (await page.locator('input[type="email"]').isVisible()) {
   21 |       console.log('Login required, filling credentials...');
   22 |       await page.fill('input[type="email"]', 'tomh@redbaez.com');
   23 |       await page.fill('input[type="password"]', 'password123');
   24 |       await page.click('button[type="submit"]');
   25 |       await page.waitForTimeout(3000);
   26 |     }
   27 |     
   28 |     // Look for brief workflow triggers
   29 |     const briefButtons = await page.locator('button, [role="button"]').filter({ hasText: /brief|upload|workflow/i }).all();
   30 |     console.log(`Found ${briefButtons.length} brief-related buttons`);
   31 |     
   32 |     if (briefButtons.length > 0) {
   33 |       console.log('Clicking brief workflow button...');
   34 |       await briefButtons[0].click();
   35 |       await page.waitForTimeout(2000);
   36 |       await page.screenshot({ path: 'debug-after-brief-click.png', fullPage: true });
   37 |     }
   38 |     
   39 |     // Check for dialog/modal
   40 |     const dialog = page.locator('[role="dialog"], .MuiDialog-root');
   41 |     const isDialogVisible = await dialog.isVisible();
   42 |     console.log(`Dialog visible: ${isDialogVisible}`);
   43 |     
   44 |     if (isDialogVisible) {
   45 |       await page.screenshot({ path: 'debug-dialog-open.png', fullPage: true });
   46 |       
   47 |       // Look for upload area
   48 |       const uploadArea = page.locator('[class*="dropzone"], input[type="file"]');
   49 |       const hasUploadArea = await uploadArea.isVisible();
   50 |       console.log(`Upload area visible: ${hasUploadArea}`);
   51 |       
   52 |       if (hasUploadArea) {
   53 |         console.log('Upload area found - workflow is accessible');
   54 |         
   55 |         // Look for any text that might be jumbled
   56 |         const dialogContent = await dialog.textContent();
   57 |         if (dialogContent) {
   58 |           const hasJumbledText = dialogContent.includes('[object') || dialogContent.includes('undefined') || dialogContent.includes('Object Object');
   59 |           console.log(`Has jumbled text in dialog: ${hasJumbledText}`);
   60 |           
   61 |           if (hasJumbledText) {
   62 |             console.log('🚨 ISSUE: Jumbled text detected in dialog');
   63 |             console.log('Problematic content:', dialogContent.substring(0, 200));
   64 |           }
   65 |         }
   66 |       }
   67 |     }
   68 |     
   69 |     console.log('=== Simple Test Complete ===');
   70 |   });
   71 |
   72 |   test('should test API endpoints directly', async ({ request }) => {
   73 |     console.log('=== Testing API Endpoints ===');
   74 |     
   75 |     // Test brief parsing API with simple text
   76 |     const testBriefContent = `
   77 | Redbaez Airwave Brief
   78 | Objective: Create engaging social media content for insurance products
   79 | Target Audience: Young professionals aged 25-40
   80 | Key Messages: 
   81 | - Affordable insurance solutions
   82 | - Quick and easy application process  
   83 | - Comprehensive coverage options
   84 | Platforms: Instagram, Facebook, LinkedIn
   85 | Budget: $50,000
   86 | Timeline: 3 months
   87 | Product: Life Insurance
   88 | Value Proposition: Protecting what matters most at an affordable price
   89 | Industry: Insurance
   90 | Brand Guidelines: Use modern, trustworthy tone with bright colors
   91 | Requirements: Mobile-first design, accessibility compliance
   92 | Competitors: Lemonade, Progressive, Geico
   93 | `;
   94 |     
   95 |     // Create form data
   96 |     const formData = new FormData();
   97 |     const blob = new Blob([testBriefContent], { type: 'text/plain' });
   98 |     formData.append('file', blob, 'test-brief.txt');
   99 |     
  100 |     try {
  101 |       const response = await fetch('http://localhost:3001/api/flow/parse-brief', {
  102 |         method: 'POST',
  103 |         body: formData,
  104 |       });
  105 |       
  106 |       const result = await response.json();
  107 |       console.log('Parse Brief API Response Status:', response.status);
  108 |       console.log('Parse Brief API Result:', JSON.stringify(result, null, 2));
```