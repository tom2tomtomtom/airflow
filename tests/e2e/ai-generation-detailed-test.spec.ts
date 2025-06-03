import { test, expect } from '@playwright/test';

test('AI Generation Detailed Test', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes
  
  console.log('🎨 AIRWAVE AI Generation Detailed Test\n');
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
    }
  });
  
  // Login
  console.log('📝 Logging in...');
  await page.goto('http://localhost:3003/login');
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  await page.click('[data-testid="sign-in-button"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Logged in successfully\n');
  
  // Navigate to generate-enhanced
  console.log('📝 Navigating to AI Generation page...');
  await page.goto('http://localhost:3003/generate-enhanced');
  
  // Wait for content to load
  console.log('⏳ Waiting for page content...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Extra wait for dynamic content
  
  // Check page content
  const pageContent = await page.content();
  console.log(`📄 Page loaded, content length: ${pageContent.length} characters`);
  
  // Look for main headings
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
  console.log('\n📝 Page headings:');
  headings.forEach(h => {
    if (h.trim()) console.log(`  - ${h.trim()}`);
  });
  
  // Check for tabs
  const tabs = await page.locator('[role="tab"], .MuiTab-root').count();
  console.log(`\n📑 Found ${tabs} tabs`);
  
  if (tabs > 0) {
    const tabTexts = await page.locator('[role="tab"], .MuiTab-root').allTextContents();
    console.log('Tab labels:');
    tabTexts.forEach(t => {
      if (t.trim()) console.log(`  - ${t.trim()}`);
    });
    
    // Click on Image Generation tab if found
    const imageTab = page.locator('[role="tab"]:has-text("Image"), .MuiTab-root:has-text("Image")').first();
    if (await imageTab.isVisible()) {
      console.log('\n🖼️ Clicking on Image Generation tab...');
      await imageTab.click();
      await page.waitForTimeout(1000);
    }
  }
  
  // Take screenshot after navigation
  await page.screenshot({ path: 'ai-generation-page-loaded.png', fullPage: true });
  console.log('📸 Screenshot saved: ai-generation-page-loaded.png');
  
  // Look for any textarea or input fields
  console.log('\n🔍 Looking for input fields...');
  const allInputs = await page.locator('input, textarea').all();
  console.log(`Found ${allInputs.length} input fields`);
  
  // Try to find the image prompt field specifically
  const imagePromptField = await page.locator('textarea').filter({ 
    hasText: /describe.*image|image.*prompt|generate.*image/i 
  }).first();
  
  if (await imagePromptField.isVisible({ timeout: 5000 })) {
    console.log('✅ Found image prompt field');
    
    const prompt = 'Modern tech office with AI analytics dashboard on large screens, professional atmosphere';
    await imagePromptField.fill(prompt);
    console.log('✅ Filled prompt');
    
    // Look for generate button
    const generateBtn = await page.locator('button').filter({ 
      hasText: /generate.*image|create.*image|generate/i 
    }).first();
    
    if (await generateBtn.isVisible()) {
      console.log('\n🚀 Clicking generate button...');
      await generateBtn.click();
      
      console.log('⏳ Waiting for AI generation...');
      
      // Wait for loading indicator to appear and disappear
      try {
        await page.waitForSelector('[role="progressbar"], .MuiCircularProgress-root', { 
          timeout: 5000 
        });
        console.log('⏳ Generation in progress...');
        
        await page.waitForSelector('[role="progressbar"], .MuiCircularProgress-root', { 
          state: 'hidden',
          timeout: 90000 
        });
        console.log('✅ Generation completed');
        
        // Look for generated images
        const images = await page.locator('img').filter({ 
          hasNot: { hasText: /avatar|logo|icon/i } 
        }).count();
        console.log(`\n📊 Found ${images} images on page`);
        
        await page.screenshot({ path: 'ai-generation-complete.png', fullPage: true });
        console.log('📸 Final screenshot: ai-generation-complete.png');
        
      } catch (error) {
        console.log('⚠️  Generation timeout or no loading indicator');
        await page.screenshot({ path: 'ai-generation-error.png', fullPage: true });
      }
    } else {
      console.log('❌ Generate button not found');
    }
  } else {
    console.log('❌ Image prompt field not found');
    
    // List all visible text areas for debugging
    const textareas = await page.locator('textarea').all();
    console.log(`\n📝 Found ${textareas.length} textareas:`);
    for (let i = 0; i < textareas.length; i++) {
      const placeholder = await textareas[i].getAttribute('placeholder');
      const isVisible = await textareas[i].isVisible();
      console.log(`  ${i + 1}. Placeholder: "${placeholder || 'none'}", Visible: ${isVisible}`);
    }
  }
  
  console.log('\n✅ Test completed');
});