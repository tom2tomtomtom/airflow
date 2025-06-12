const { chromium } = require('playwright');

/**
 * Quick test to identify and fix API authentication issues
 */

async function testAPIAuthentication() {
    console.log('🔍 Testing API Authentication Issues');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Monitor all network requests
    const apiRequests = [];
    
    page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/') || url.includes('supabase.co')) {
            apiRequests.push({
                url,
                status: response.status(),
                headers: response.headers(),
                statusText: response.statusText()
            });
            
            if (response.status() >= 400) {
                console.log(`❌ Failed API Request: ${response.status()} ${url}`);
            } else {
                console.log(`✅ Successful API Request: ${response.status()} ${url}`);
            }
        }
    });
    
    try {
        // 1. Navigate to homepage
        console.log('\n📍 Step 1: Loading homepage...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 2. Check authentication state
        console.log('\n📍 Step 2: Checking authentication...');
        const hasAuth = await page.evaluate(() => {
            return !!(localStorage.getItem('supabase.auth.token') || 
                     sessionStorage.getItem('supabase.auth.token') ||
                     document.cookie.includes('sb-'));
        });
        console.log(`Authentication found: ${hasAuth}`);
        
        // 3. Try templates page
        console.log('\n📍 Step 3: Testing Templates API...');
        await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // 4. Try matrix page
        console.log('\n📍 Step 4: Testing Matrix page...');
        try {
            await page.goto('http://localhost:3000/matrix', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            console.log('✅ Matrix page loaded successfully');
        } catch (error) {
            console.log('❌ Matrix page failed to load:', error.message);
        }
        
        // 5. Try dashboard
        console.log('\n📍 Step 5: Testing Dashboard...');
        try {
            await page.goto('http://localhost:3000/dashboard', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            console.log('✅ Dashboard loaded successfully');
        } catch (error) {
            console.log('❌ Dashboard failed to load:', error.message);
        }
        
        // 6. Take final screenshot
        await page.screenshot({ 
            path: './screenshots/api-auth-test-final.png', 
            fullPage: true 
        });
        
        console.log('\n📊 API Request Summary:');
        const failedRequests = apiRequests.filter(req => req.status >= 400);
        const successfulRequests = apiRequests.filter(req => req.status < 400);
        
        console.log(`✅ Successful requests: ${successfulRequests.length}`);
        console.log(`❌ Failed requests: ${failedRequests.length}`);
        
        if (failedRequests.length > 0) {
            console.log('\n🔍 Failed Request Details:');
            failedRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.status} ${req.url}`);
            });
        }
        
        // Analyze authentication issues
        const authIssues = failedRequests.filter(req => req.status === 401 || req.status === 403);
        const schemaIssues = failedRequests.filter(req => req.status === 400 && req.url.includes('supabase'));
        
        if (authIssues.length > 0) {
            console.log('\n🚨 Authentication Issues Found:');
            authIssues.forEach(req => {
                console.log(`- ${req.url} (${req.status})`);
            });
        }
        
        if (schemaIssues.length > 0) {
            console.log('\n🚨 Database Schema Issues Found:');
            schemaIssues.forEach(req => {
                console.log(`- ${req.url} (${req.status})`);
            });
        }
        
        return {
            authenticationFound: hasAuth,
            totalRequests: apiRequests.length,
            successfulRequests: successfulRequests.length,
            failedRequests: failedRequests.length,
            authIssues: authIssues.length,
            schemaIssues: schemaIssues.length,
            recommendations: generateRecommendations(hasAuth, authIssues.length, schemaIssues.length)
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return null;
    } finally {
        await browser.close();
    }
}

function generateRecommendations(hasAuth, authIssues, schemaIssues) {
    const recommendations = [];
    
    if (!hasAuth) {
        recommendations.push('1. User is not properly authenticated - check authentication flow');
    }
    
    if (authIssues > 0) {
        recommendations.push('2. Fix API authentication - check JWT tokens and session management');
    }
    
    if (schemaIssues > 0) {
        recommendations.push('3. Fix database schema issues - check Supabase table structure');
        recommendations.push('4. Verify RLS policies are correctly configured');
    }
    
    recommendations.push('5. Check environment variables and API keys');
    recommendations.push('6. Verify Supabase connection configuration');
    
    return recommendations;
}

// Run the test
if (require.main === module) {
    testAPIAuthentication()
        .then(result => {
            if (result) {
                console.log('\n📋 Final Report:');
                console.log(`Authentication Status: ${result.authenticationFound ? '✅' : '❌'}`);
                console.log(`API Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%`);
                
                console.log('\n💡 Recommendations:');
                result.recommendations.forEach(rec => console.log(rec));
            }
        })
        .catch(console.error);
}

module.exports = { testAPIAuthentication };