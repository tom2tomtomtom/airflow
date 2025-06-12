const { chromium } = require('playwright');

/**
 * Simple test to see what's happening on the Matrix page
 */

async function testMatrixSimple() {
    console.log('🔍 Simple Matrix Page Test');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Console Error: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
    });
    
    try {
        console.log('\n📍 Navigate to Matrix page (no networkidle wait)...');
        await page.goto('http://localhost:3000/matrix', { waitUntil: 'domcontentloaded' });
        
        console.log('✅ Page navigation completed');
        
        // Wait a bit for React to load
        await page.waitForTimeout(5000);
        
        // Check what we can see on the page
        const title = await page.title();
        console.log(`Page title: ${title}`);
        
        const hasH1 = await page.locator('h1').count();
        console.log(`H1 elements found: ${hasH1}`);
        
        const hasError = await page.locator('[data-testid*="error"], .error').count();
        console.log(`Error elements: ${hasError}`);
        
        const hasMatrix = await page.locator('[data-testid*="matrix"], .matrix').count();
        console.log(`Matrix elements: ${hasMatrix}`);
        
        const bodyText = await page.locator('body').textContent();
        const hasContent = bodyText && bodyText.length > 100;
        console.log(`Page has content: ${hasContent ? '✅' : '❌'}`);
        
        if (bodyText && bodyText.length < 500) {
            console.log(`Page content preview: "${bodyText.substring(0, 200)}..."`);
        }
        
        // Take a screenshot
        await page.screenshot({ 
            path: './screenshots/matrix-simple-test.png', 
            fullPage: true 
        });
        
        console.log('✅ Screenshot saved');
        
        return {
            pageLoaded: true,
            hasContent,
            errorElements: hasError,
            matrixElements: hasMatrix
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}

// Run the test
if (require.main === module) {
    testMatrixSimple()
        .then(result => {
            if (result) {
                console.log('\n📊 Simple Matrix Test Results:');
                console.log(`Page Loaded: ${result.pageLoaded ? '✅' : '❌'}`);
                console.log(`Has Content: ${result.hasContent ? '✅' : '❌'}`);
                console.log(`Error Elements: ${result.errorElements}`);
                console.log(`Matrix Elements: ${result.matrixElements}`);
            }
        })
        .catch(console.error);
}

module.exports = { testMatrixSimple };