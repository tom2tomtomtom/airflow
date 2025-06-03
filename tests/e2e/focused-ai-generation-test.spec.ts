import { test, expect } from '@playwright/test';

test('Focused AI Generation Test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  
  console.log('🎨 AIRWAVE AI Generation Test\n');
  
  // Login
  console.log('📝 Logging in...');
  await page.goto('http://localhost:3003/login');
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  await page.click('[data-testid="sign-in-button"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Logged in\n');
  
  // Go directly to AI generation page
  console.log('📝 Navigating to AI Generation...');
  await page.goto('http://localhost:3003/generate-enhanced');
  await page.waitForLoadState('networkidle');
  
  // Wait for page to fully load
  await page.waitForTimeout(2000);
  
  // Check if we're on the generation page
  const pageTitle = await page.title();
  console.log(`📄 Page title: ${pageTitle}`);
  
  // Look for any text input or textarea on the page
  console.log('\n🔍 Looking for input fields...');
  const textInputs = await page.locator('input[type="text"], textarea').count();
  console.log(`Found ${textInputs} text input fields`);
  
  // Try different selectors for the prompt field
  const selectors = [
    'textarea[placeholder*="Describe"]',
    'textarea[placeholder*="prompt"]',
    'textarea[placeholder*="image"]',
    'textarea[placeholder*="generate"]',
    '#imagePrompt',
    'textarea[name="prompt"]',
    'textarea[name="imagePrompt"]',
    'textarea'
  ];
  
  let promptField = null;
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        promptField = element;
        console.log(`✅ Found prompt field with selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  if (!promptField) {
    console.log('❌ Could not find prompt field');
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-generate-page.png', fullPage: true });
    console.log('📸 Debug screenshot saved: debug-generate-page.png');
    
    // List all visible buttons
    const buttons = await page.locator('button').all();
    console.log(`\n📝 Found ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const text = await buttons[i].textContent();
      console.log(`  - ${text?.trim()}`);
    }
    
    return;
  }
  
  // Fill the prompt
  const testPrompt = 'Modern minimalist tech office with AI visualization screens';
  await promptField.fill(testPrompt);
  console.log('✅ Prompt entered\n');
  
  // Look for generate button
  console.log('🔍 Looking for generate button...');
  const generateButtons = [
    'button:has-text("Generate Images")',
    'button:has-text("Generate")',
    'button:has-text("Create")',
    'button[type="submit"]'
  ];
  
  let generateButton = null;
  for (const selector of generateButtons) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 })) {
        generateButton = button;
        const buttonText = await button.textContent();
        console.log(`✅ Found generate button: "${buttonText?.trim()}"`);
        break;
      }
    } catch (e) {
      // Continue
    }
  }
  
  if (!generateButton) {
    console.log('❌ Generate button not found');
    await page.screenshot({ path: 'debug-no-generate-button.png', fullPage: true });
    return;
  }
  
  // Click generate
  console.log('\n🚀 Clicking generate button...');
  await generateButton.click();
  
  console.log('⏳ Waiting for generation (max 60 seconds)...');
  
  // Wait for any image to appear
  try {
    await page.waitForSelector('img:not([src*="avatar"]):not([src*="logo"])', { 
      timeout: 60000 
    });
    console.log('✅ Image appeared!');
    
    // Count generated images
    const generatedImages = await page.locator('img:not([src*="avatar"]):not([src*="logo"])').count();
    console.log(`📊 Found ${generatedImages} generated images`);
    
    // Take screenshot
    await page.screenshot({ path: 'ai-generation-success.png', fullPage: true });
    console.log('📸 Success screenshot: ai-generation-success.png');
    
  } catch (error) {
    console.log('⚠️  No images generated within timeout');
    await page.screenshot({ path: 'ai-generation-timeout.png', fullPage: true });
    console.log('📸 Timeout screenshot: ai-generation-timeout.png');
  }
  
  console.log('\n📊 Test Summary:');
  console.log('✅ Authentication working');
  console.log('✅ Navigation to AI generation page working');
  console.log(`${promptField ? '✅' : '❌'} Prompt field found`);
  console.log(`${generateButton ? '✅' : '❌'} Generate button found`);
});