#!/usr/bin/env node

/**
 * AIrWAVE Deployment Validation Script
 * 
 * This script validates that a deployed AIrWAVE instance is working correctly.
 * Run: node scripts/validate-deployment.js https://your-app.netlify.app
 */

const https = require('https');
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AIrWAVE-Deployment-Validator/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = res.headers['content-type']?.includes('application/json') 
            ? JSON.parse(data) 
            : data;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            rawData: data
          });
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.on('error', reject);
  });
}

async function validateEndpoint(baseUrl, endpoint, expectedStatus = 200, description = '') {
  const url = `${baseUrl}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(url);
    const duration = Date.now() - startTime;
    
    const statusOk = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(response.statusCode)
      : response.statusCode === expectedStatus;
    
    if (statusOk) {
      log(`✅ ${endpoint} - ${response.statusCode} (${duration}ms) ${description}`, 'green');
      return { success: true, response, duration };
    } else {
      log(`❌ ${endpoint} - Expected ${expectedStatus}, got ${response.statusCode} (${duration}ms)`, 'red');
      return { success: false, response, duration };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ ${endpoint} - Error: ${error.message} (${duration}ms)`, 'red');
    return { success: false, error, duration };
  }
}

async function validateDeployment(baseUrl) {
  log(`\n${colors.bold}🚀 AIrWAVE Deployment Validation${colors.reset}\n`);
  log(`Validating: ${baseUrl}`, 'blue');
  log('─'.repeat(60), 'blue');
  
  const tests = [
    // Basic connectivity
    { endpoint: '/', expectedStatus: 200, description: '(Homepage)' },
    { endpoint: '/login', expectedStatus: 200, description: '(Login page)' },
    { endpoint: '/signup', expectedStatus: 200, description: '(Signup page)' },
    
    // API endpoints
    { endpoint: '/api/health', expectedStatus: 200, description: '(Health check)' },
    { endpoint: '/api/status', expectedStatus: 200, description: '(Status check)' },
    
    // Protected routes (should redirect)
    { endpoint: '/dashboard', expectedStatus: [200, 307, 302], description: '(Protected route)' },
    { endpoint: '/clients', expectedStatus: [200, 307, 302], description: '(Protected route)' },
    
    // API authentication (should require auth)
    { endpoint: '/api/clients', expectedStatus: 401, description: '(Requires auth)' },
    { endpoint: '/api/assets', expectedStatus: 401, description: '(Requires auth)' },
  ];
  
  const results = [];
  let successCount = 0;
  
  for (const test of tests) {
    const result = await validateEndpoint(
      baseUrl, 
      test.endpoint, 
      test.expectedStatus, 
      test.description
    );
    results.push(result);
    if (result.success) successCount++;
  }
  
  // Detailed health check analysis
  log(`\n${colors.bold}🔍 Health Check Analysis${colors.reset}`, 'blue');
  log('─'.repeat(60), 'blue');
  
  const healthResult = results.find(r => r.response?.data?.status);
  if (healthResult && healthResult.response.data) {
    const health = healthResult.response.data;
    log(`Overall Status: ${health.status === 'healthy' ? '✅' : '❌'} ${health.status}`, 
        health.status === 'healthy' ? 'green' : 'red');
    
    if (health.checks) {
      Object.entries(health.checks).forEach(([service, check]) => {
        const icon = check.status === 'ok' ? '✅' : 
                    check.message?.includes('optional') ? '⚠️' : '❌';
        const color = check.status === 'ok' ? 'green' : 
                     check.message?.includes('optional') ? 'yellow' : 'red';
        
        log(`  ${icon} ${service}: ${check.status} ${check.message || ''} (${check.latency}ms)`, color);
      });
    }
  }
  
  // Performance analysis
  log(`\n${colors.bold}⚡ Performance Analysis${colors.reset}`, 'blue');
  log('─'.repeat(60), 'blue');
  
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  log(`Average Response Time: ${avgDuration.toFixed(0)}ms`);
  
  const healthCheck = results.find(r => r.response?.data?.status);
  if (healthCheck) {
    const perfColor = healthCheck.duration < 1000 ? 'green' : 
                     healthCheck.duration < 3000 ? 'yellow' : 'red';
    log(`Health Check Response: ${healthCheck.duration}ms`, perfColor);
  }
  
  // Summary
  log(`\n${colors.bold}📊 Validation Summary${colors.reset}`, 'blue');
  log('─'.repeat(60), 'blue');
  
  const successRate = (successCount / tests.length * 100).toFixed(1);
  const summaryColor = successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red';
  
  log(`Tests Passed: ${successCount}/${tests.length} (${successRate}%)`, summaryColor);
  
  if (successRate >= 90) {
    log(`\n🎉 Deployment is READY for production!`, 'green');
  } else if (successRate >= 70) {
    log(`\n⚠️  Deployment has some issues but core functionality works.`, 'yellow');
  } else {
    log(`\n❌ Deployment has significant issues that need to be addressed.`, 'red');
  }
  
  // Recommendations
  if (healthResult && healthResult.response.data?.checks) {
    const checks = healthResult.response.data.checks;
    const hasRedisError = checks.redis?.status === 'error';
    const hasEmailFallback = checks.email?.details?.provider === 'fallback';
    
    if (hasRedisError || hasEmailFallback) {
      log(`\n${colors.bold}💡 Optional Enhancements${colors.reset}`, 'blue');
      log('─'.repeat(60), 'blue');
      
      if (hasRedisError) {
        log(`⚠️  Redis not configured - Rate limiting and background jobs disabled`);
        log(`   Add UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN to enable.`);
      }
      
      if (hasEmailFallback) {
        log(`⚠️  Email using fallback logging - Notifications will be logged only`);
        log(`   Add RESEND_API_KEY to enable email notifications.`);
      }
    }
  }
  
  log(`\n${colors.bold}🔗 Next Steps${colors.reset}`, 'blue');
  log('─'.repeat(60), 'blue');
  log(`1. Test user registration: ${baseUrl}/signup`);
  log(`2. Test user login: ${baseUrl}/login`);
  log(`3. Monitor health endpoint: ${baseUrl}/api/health`);
  log(`4. Check application logs in your hosting platform`);
  log(`\nFor issues, refer to PRODUCTION_READINESS_CHECKLIST.md`);
}

// Main execution
const baseUrl = process.argv[2];

if (!baseUrl) {
  log('Usage: node scripts/validate-deployment.js <url>', 'red');
  log('Example: node scripts/validate-deployment.js https://my-app.netlify.app', 'yellow');
  process.exit(1);
}

// Validate URL format
try {
  new URL(baseUrl);
} catch (e) {
  log(`Invalid URL: ${baseUrl}`, 'red');
  process.exit(1);
}

validateDeployment(baseUrl.replace(/\/$/, '')).catch(error => {
  log(`\nValidation failed: ${error.message}`, 'red');
  process.exit(1);
});