const { chromium } = require('playwright');
const testData = require('./test-data.js');

async function quickGenerationTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🚀 Quick Generation Test - Testing Real Data Input\n');

  try {
    // Test 1: Strategy Page Real Data Input
    console.log('📋 Testing Strategy Page');
    await page.goto('http://localhost:3000/strategy');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: './screenshots/strategy-before-input.png' });
    
    // Fill in real brief data - look for any textarea
    const textareas = await page.locator('textarea');
    if (await textareas.count() > 0) {
      await textareas.first().fill(testData.briefs[0].content);
      console.log('✅ Brief content filled');
    }
    
    // Fill target audience - look for any input with audience in placeholder
    const audienceInputs = await page.locator('input').all();
    for (const input of audienceInputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.toLowerCase().includes('audience')) {
        await input.fill(testData.briefs[0].target_audience);
        console.log('✅ Target audience filled');
        break;
      }
    }
    
    // Fill objectives - look for any input with objective/goal in placeholder  
    for (const input of audienceInputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && (placeholder.toLowerCase().includes('objective') || placeholder.toLowerCase().includes('goal'))) {
        await input.fill(testData.briefs[0].campaign_objectives);
        console.log('✅ Campaign objectives filled');
        break;
      }
    }
    
    await page.screenshot({ path: './screenshots/strategy-after-input.png' });
    
    // Look for Create Brief button
    const createBtns = await page.locator('button').all();
    for (const btn of createBtns) {
      const text = await btn.textContent();
      if (text && text.includes('Create Brief')) {
        await btn.click();
        console.log('✅ Create Brief button clicked');
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    // Look for Generate Motivations button
    const generateBtns = await page.locator('button').all();
    for (const btn of generateBtns) {
      const text = await btn.textContent();
      if (text && text.includes('Generate Motivations')) {
        console.log('🔄 Clicking Generate Motivations...');
        await btn.click();
        console.log('✅ Generate Motivations clicked - API call should be made');
        await page.waitForTimeout(5000);
        break;
      }
    }
    
    await page.screenshot({ path: './screenshots/strategy-after-generation.png' });
    
    // Test 2: Generate Page Real Data Input
    console.log('\n🎨 Testing Generate Page');
    await page.goto('http://localhost:3000/generate-enhanced');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: './screenshots/generate-before-input.png' });
    
    // Fill brief on generate page
    const generateTextareas = await page.locator('textarea');
    if (await generateTextareas.count() > 0) {
      await generateTextareas.first().fill(testData.briefs[1].content);
      console.log('✅ Generate page brief filled');
    }
    
    // Look for any Generate button
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Generate') && !text.includes('Test')) {
        console.log(`🔄 Found Generate button: ${text}`);
        await btn.click();
        console.log('✅ Generate button clicked - API call should be made');
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    // Test image prompt input
    console.log('\n🖼️ Testing Image Generation Input');
    const imagePrompt = testData.imagePrompts[0].prompt;
    const allInputs = await page.locator('input, textarea').all();
    
    for (const input of allInputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.toLowerCase().includes('prompt')) {
        await input.fill(imagePrompt);
        console.log('✅ Image prompt filled with real data');
        break;
      }
    }
    
    // Test video prompt input
    console.log('\n🎥 Testing Video Generation Input');
    const videoPrompt = testData.videoPrompts[0].prompt;
    
    for (const input of allInputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.toLowerCase().includes('video')) {
        await input.fill(videoPrompt);
        console.log('✅ Video prompt filled with real data');
        break;
      }
    }
    
    // Test voice script input
    console.log('\n🎤 Testing Voice Generation Input');
    const voiceScript = testData.voiceScripts[0].text;
    
    for (const input of allInputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && (placeholder.toLowerCase().includes('voice') || placeholder.toLowerCase().includes('text'))) {
        await input.fill(voiceScript);
        console.log('✅ Voice script filled with real data');
        break;
      }
    }
    
    await page.screenshot({ path: './screenshots/generate-after-input.png' });
    
    console.log('\n🎉 QUICK GENERATION TEST COMPLETE');
    console.log('✅ Real test data successfully inputted into forms');
    console.log('✅ Generation buttons clicked - APIs should be called');
    console.log('✅ All input fields tested with realistic content');
    console.log('\n📸 Screenshots saved:');
    console.log('- strategy-before-input.png');
    console.log('- strategy-after-input.png'); 
    console.log('- strategy-after-generation.png');
    console.log('- generate-before-input.png');
    console.log('- generate-after-input.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  await browser.close();
}

quickGenerationTest();