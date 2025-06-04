const puppeteer = require('puppeteer');

async function testWorkflow() {
  console.log('🚀 Starting manual API testing...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. Test login
    console.log('📝 Testing login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'tomh@redbaez.com');
    await page.type('input[type="password"]', 'Wijlre2010');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful, current URL:', page.url());
    
    // 2. Test clients page
    console.log('👥 Testing clients page...');
    await page.goto('http://localhost:3000/clients');
    await page.waitForTimeout(3000);
    
    const clientsPageStatus = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasContent: document.body.innerText.length > 100,
        hasErrors: document.body.innerText.includes('Error') || document.body.innerText.includes('500'),
        title: document.title
      };
    });
    
    console.log('📊 Clients page status:', clientsPageStatus);
    
    // 3. Test API call via browser
    console.log('🔌 Testing API call...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/clients', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        return {
          status: response.status,
          statusText: response.statusText,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    console.log('📡 API Response:', apiResponse);
    
    // 4. Test client creation navigation
    console.log('➕ Testing client creation navigation...');
    await page.goto('http://localhost:3000/create-client');
    await page.waitForTimeout(2000);
    
    const createClientStatus = await page.evaluate(() => ({
      url: window.location.href,
      hasForm: !!document.querySelector('form'),
      hasSteps: document.querySelectorAll('.MuiStep-root, [data-testid*="step"]').length,
      title: document.title
    }));
    
    console.log('📝 Create client page status:', createClientStatus);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testWorkflow().catch(console.error);