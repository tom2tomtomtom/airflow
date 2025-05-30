# Test info

- Name: Production AIrWAVE Integration Tests with Demo Auth >> Complete Platform Integration Test
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/production-integration-test.spec.ts:31:7

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('main, [role="main"], .dashboard')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('main, [role="main"], .dashboard')

    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/production-integration-test.spec.ts:39:36
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
   6 |   console.log('🎯 Using demo authentication...');
   7 |   
   8 |   await page.goto(`${BASE_URL}/login`);
   9 |   await page.waitForLoadState('networkidle');
   10 |   
   11 |   // Click demo login button
   12 |   const demoButton = page.locator('button:has-text("Continue with Demo")');
   13 |   await expect(demoButton).toBeVisible({ timeout: 10000 });
   14 |   await demoButton.click();
   15 |   
   16 |   // Wait for any redirect or page change
   17 |   await page.waitForTimeout(3000);
   18 |   
   19 |   // Try to navigate directly to dashboard
   20 |   await page.goto(`${BASE_URL}/dashboard`);
   21 |   await page.waitForLoadState('networkidle');
   22 |   
   23 |   console.log('✅ Demo authentication completed');
   24 | }
   25 |
   26 | test.describe('Production AIrWAVE Integration Tests with Demo Auth', () => {
   27 |   test.beforeEach(async ({ page }) => {
   28 |     test.setTimeout(180000); // 3 minutes for complete flows
   29 |   });
   30 |
   31 |   test('Complete Platform Integration Test', async ({ page }) => {
   32 |     console.log('🚀 Testing complete AIrWAVE platform integration...');
   33 |     
   34 |     // Test 1: Authentication and Navigation
   35 |     await loginWithDemo(page);
   36 |     
   37 |     // Verify dashboard access
   38 |     const dashboardContent = page.locator('main, [role="main"], .dashboard');
>  39 |     await expect(dashboardContent).toBeVisible({ timeout: 10000 });
      |                                    ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
   40 |     console.log('✅ Dashboard accessible');
   41 |     
   42 |     // Test 2: OpenAI Integration
   43 |     console.log('🤖 Testing OpenAI integration...');
   44 |     const openaiResponse = await page.evaluate(async () => {
   45 |       try {
   46 |         const response = await fetch('/api/test/openai');
   47 |         const data = await response.json();
   48 |         return { success: response.ok, data };
   49 |       } catch (error) {
   50 |         return { success: false, error: error.message };
   51 |       }
   52 |     });
   53 |     
   54 |     console.log('OpenAI Test Result:', openaiResponse.success ? '✅ WORKING' : '❌ FAILED');
   55 |     if (openaiResponse.data?.message) {
   56 |       console.log('OpenAI Response:', openaiResponse.data.message.substring(0, 100) + '...');
   57 |     }
   58 |     
   59 |     // Test 3: Creatomate Integration  
   60 |     console.log('🎬 Testing Creatomate integration...');
   61 |     const creatomateResponse = await page.evaluate(async () => {
   62 |       try {
   63 |         const response = await fetch('/api/creatomate/test');
   64 |         const data = await response.json();
   65 |         return { success: response.ok, data };
   66 |       } catch (error) {
   67 |         return { success: false, error: error.message };
   68 |       }
   69 |     });
   70 |     
   71 |     console.log('Creatomate Test Result:', creatomateResponse.success ? '✅ WORKING' : '❌ FAILED');
   72 |     if (creatomateResponse.data?.data?.message) {
   73 |       console.log('Creatomate Response:', creatomateResponse.data.data.message);
   74 |     }
   75 |     
   76 |     // Test 4: Real-Time Events
   77 |     console.log('⚡ Testing real-time events...');
   78 |     const realtimeTest = await page.evaluate(() => {
   79 |       return new Promise((resolve) => {
   80 |         try {
   81 |           const eventSource = new EventSource('/api/realtime/events');
   82 |           let connected = false;
   83 |           
   84 |           eventSource.onopen = () => {
   85 |             connected = true;
   86 |             resolve({ success: true, message: 'Real-time connection established' });
   87 |             eventSource.close();
   88 |           };
   89 |           
   90 |           eventSource.onerror = () => {
   91 |             if (!connected) {
   92 |               resolve({ success: false, message: 'Failed to connect to real-time events' });
   93 |             }
   94 |             eventSource.close();
   95 |           };
   96 |           
   97 |           // Timeout after 10 seconds
   98 |           setTimeout(() => {
   99 |             if (!connected) {
  100 |               resolve({ success: false, message: 'Real-time connection timeout' });
  101 |             }
  102 |             eventSource.close();
  103 |           }, 10000);
  104 |         } catch (error) {
  105 |           resolve({ success: false, message: error.message });
  106 |         }
  107 |       });
  108 |     });
  109 |     
  110 |     console.log('Real-time Test Result:', realtimeTest.success ? '✅ WORKING' : '❌ FAILED');
  111 |     console.log('Real-time Message:', realtimeTest.message);
  112 |     
  113 |     // Test 5: AI Content Generation
  114 |     console.log('🎨 Testing AI content generation...');
  115 |     const aiGenerationResponse = await page.evaluate(async () => {
  116 |       try {
  117 |         const response = await fetch('/api/ai/generate', {
  118 |           method: 'POST',
  119 |           headers: { 'Content-Type': 'application/json' },
  120 |           body: JSON.stringify({
  121 |             prompt: 'Create a tagline for an eco-friendly product',
  122 |             type: 'text',
  123 |             clientId: 'demo-client'
  124 |           })
  125 |         });
  126 |         const data = await response.json();
  127 |         return { success: response.ok, data };
  128 |       } catch (error) {
  129 |         return { success: false, error: error.message };
  130 |       }
  131 |     });
  132 |     
  133 |     console.log('AI Generation Test Result:', aiGenerationResponse.success ? '✅ WORKING' : '❌ FAILED');
  134 |     if (aiGenerationResponse.data?.result?.content) {
  135 |       const content = Array.isArray(aiGenerationResponse.data.result.content) 
  136 |         ? aiGenerationResponse.data.result.content[0] 
  137 |         : aiGenerationResponse.data.result.content;
  138 |       console.log('Generated Content:', content.substring(0, 100) + '...');
  139 |     }
```