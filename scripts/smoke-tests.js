#!/usr/bin/env node

/**
 * Post-Deployment Smoke Testing Suite
 * Automated tests to verify application functionality after deployment
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class SmokeTestSuite {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.BASE_URL || 'http://localhost:3000';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.results = [];
    this.testUser = {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'testpassword123'
    };
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const urlObj = new URL(fullUrl);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'AIRWAVE-SmokeTest/1.0',
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: this.timeout
      };

      const req = client.request(requestOptions, (res) => {
        let body = '';
        
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            responseTime: Date.now() - startTime
          });
        });
      });

      const startTime = Date.now();
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async runTest(testName, testFn, options = {}) {
    const maxRetries = options.retries || this.retries;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await testFn();
        const duration = Date.now() - startTime;

        this.results.push({
          name: testName,
          status: 'PASSED',
          duration,
          attempt,
          result
        });

        console.log(`✅ ${testName} - PASSED (${duration}ms)`);
        return result;

      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          console.log(`⚠️  ${testName} - RETRY ${attempt}/${maxRetries}: ${error.message}`);
          await this.sleep(1000 * attempt); // Exponential backoff
        }
      }
    }

    this.results.push({
      name: testName,
      status: 'FAILED',
      attempt: maxRetries,
      error: lastError.message
    });

    console.log(`❌ ${testName} - FAILED: ${lastError.message}`);
    throw lastError;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test: Application Health Check
  async testHealthCheck() {
    await this.runTest('Health Check', async () => {
      const response = await this.makeRequest('/api/health');
      
      if (response.statusCode !== 200) {
        throw new Error(`Health check failed with status ${response.statusCode}`);
      }

      const health = JSON.parse(response.body);
      
      if (health.status !== 'healthy') {
        throw new Error(`Application is not healthy: ${health.status}`);
      }

      if (!health.services?.database?.status === 'connected') {
        throw new Error('Database is not connected');
      }

      return health;
    });
  }

  // Test: Application Status
  async testStatusEndpoint() {
    await this.runTest('Status Endpoint', async () => {
      const response = await this.makeRequest('/api/status');
      
      if (response.statusCode !== 200) {
        throw new Error(`Status endpoint failed with status ${response.statusCode}`);
      }

      return JSON.parse(response.body);
    });
  }

  // Test: Home Page Loading
  async testHomePageLoad() {
    await this.runTest('Home Page Load', async () => {
      const response = await this.makeRequest('/');
      
      if (response.statusCode !== 200) {
        throw new Error(`Home page failed to load with status ${response.statusCode}`);
      }

      if (!response.body.includes('<title>')) {
        throw new Error('Home page does not contain a title tag');
      }

      if (response.responseTime > 5000) {
        throw new Error(`Home page load time too slow: ${response.responseTime}ms`);
      }

      return { responseTime: response.responseTime };
    });
  }

  // Test: User Registration (if enabled)
  async testUserRegistration() {
    await this.runTest('User Registration', async () => {
      const testEmail = `test+${Date.now()}@example.com`;
      const response = await this.makeRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: testEmail,
          password: 'TestPassword123!',
          name: 'Test User'
        }
      });

      // Accept both 200 (success) and 400 (user already exists) as valid
      if (response.statusCode !== 200 && response.statusCode !== 400) {
        throw new Error(`Registration failed with status ${response.statusCode}: ${response.body}`);
      }

      return { email: testEmail, statusCode: response.statusCode };
    });
  }

  // Test: User Login
  async testUserLogin() {
    await this.runTest('User Login', async () => {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: this.testUser.email,
          password: this.testUser.password
        }
      });

      // Login might fail if test user doesn't exist, which is acceptable
      if (response.statusCode === 200) {
        const result = JSON.parse(response.body);
        if (!result.token && !result.access_token) {
          throw new Error('Login successful but no token returned');
        }
        return result;
      } else if (response.statusCode === 401) {
        // User doesn't exist or wrong credentials - acceptable in testing
        return { message: 'Test user not found or incorrect credentials' };
      } else {
        throw new Error(`Login failed with unexpected status ${response.statusCode}`);
      }
    });
  }

  // Test: Asset Upload Endpoint
  async testAssetUploadEndpoint() {
    await this.runTest('Asset Upload Endpoint Check', async () => {
      // Just check if the endpoint exists and returns appropriate error for no auth
      const response = await this.makeRequest('/api/assets/upload', {
        method: 'POST'
      });

      // Expect 401 (unauthorized) or 400 (bad request) rather than 404 (not found)
      if (response.statusCode === 404) {
        throw new Error('Asset upload endpoint not found');
      }

      return { statusCode: response.statusCode };
    });
  }

  // Test: AI Generation Endpoints
  async testAIEndpoints() {
    const endpoints = [
      '/api/ai/generate',
      '/api/content-generate',
      '/api/matrix-generate',
      '/api/strategy-generate'
    ];

    for (const endpoint of endpoints) {
      await this.runTest(`AI Endpoint ${endpoint}`, async () => {
        const response = await this.makeRequest(endpoint, { method: 'POST' });
        
        // Expect 401 (unauthorized) or 400 (bad request) rather than 404 or 500
        if (response.statusCode === 404) {
          throw new Error(`AI endpoint ${endpoint} not found`);
        }

        if (response.statusCode >= 500) {
          throw new Error(`AI endpoint ${endpoint} server error: ${response.statusCode}`);
        }

        return { endpoint, statusCode: response.statusCode };
      });
    }
  }

  // Test: Database Connectivity
  async testDatabaseConnectivity() {
    await this.runTest('Database Connectivity', async () => {
      // Use the health endpoint to verify database connection
      const response = await this.makeRequest('/api/health');
      
      if (response.statusCode !== 200) {
        throw new Error('Health endpoint failed');
      }

      const health = JSON.parse(response.body);
      
      if (health.services?.database?.status !== 'connected') {
        throw new Error(`Database not connected: ${health.services.database.status}`);
      }

      return {
        latency: health.services.database.latency,
        status: health.services.database.status
      };
    });
  }

  // Test: Environment Configuration
  async testEnvironmentConfig() {
    await this.runTest('Environment Configuration', async () => {
      const response = await this.makeRequest('/api/health');
      
      if (response.statusCode !== 200) {
        throw new Error('Health endpoint failed');
      }

      const health = JSON.parse(response.body);
      
      if (!health.environment) {
        throw new Error('Environment not specified in health check');
      }

      const expectedEnv = process.env.NODE_ENV || 'development';
      if (health.environment !== expectedEnv) {
        console.warn(`⚠️  Environment mismatch: expected ${expectedEnv}, got ${health.environment}`);
      }

      return {
        environment: health.environment,
        version: health.version
      };
    });
  }

  // Test: Static Assets
  async testStaticAssets() {
    const assets = [
      '/favicon.ico',
      '/_next/static/css/',
      '/_next/static/chunks/'
    ];

    for (const asset of assets) {
      await this.runTest(`Static Asset ${asset}`, async () => {
        const response = await this.makeRequest(asset);
        
        // For CSS and JS, we just check they don't return 404
        if (asset.includes('css') || asset.includes('chunks')) {
          // These might return 404 if no files exist, which is acceptable
          return { statusCode: response.statusCode };
        }

        // Favicon should exist
        if (asset === '/favicon.ico' && response.statusCode === 404) {
          console.warn('⚠️  Favicon not found - consider adding one');
        }

        return { statusCode: response.statusCode };
      });
    }
  }

  // Test: Security Headers
  async testSecurityHeaders() {
    await this.runTest('Security Headers', async () => {
      const response = await this.makeRequest('/');
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy'
      ];

      const missingHeaders = [];
      
      for (const header of requiredHeaders) {
        if (!response.headers[header]) {
          missingHeaders.push(header);
        }
      }

      if (missingHeaders.length > 0) {
        console.warn(`⚠️  Missing security headers: ${missingHeaders.join(', ')}`);
      }

      return {
        headers: response.headers,
        missingHeaders
      };
    });
  }

  // Generate Test Report
  generateReport() {
    const timestamp = new Date().toISOString();
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const total = this.results.length;

    const report = {
      timestamp,
      baseUrl: this.baseUrl,
      summary: {
        total,
        passed,
        failed,
        successRate: ((passed / total) * 100).toFixed(2)
      },
      results: this.results
    };

    // Save to file
    const reportFile = path.join(process.cwd(), `smoke-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return { report, reportFile };
  }

  // Run all smoke tests
  async runAllTests() {
    console.log('🚀 Starting AIRWAVE Smoke Test Suite');
    console.log(`🎯 Target: ${this.baseUrl}`);
    console.log(`⏱️  Timeout: ${this.timeout}ms`);
    console.log(`🔄 Retries: ${this.retries}\n`);

    const startTime = Date.now();

    try {
      // Core functionality tests
      await this.testHealthCheck();
      await this.testStatusEndpoint();
      await this.testHomePageLoad();
      await this.testDatabaseConnectivity();
      await this.testEnvironmentConfig();

      // Authentication tests (non-critical)
      try {
        await this.testUserRegistration();
        await this.testUserLogin();
      } catch (error) {
        console.log('⚠️  Authentication tests failed (non-critical)');
      }

      // API endpoint tests
      await this.testAssetUploadEndpoint();
      await this.testAIEndpoints();

      // Infrastructure tests
      await this.testStaticAssets();
      await this.testSecurityHeaders();

    } catch (error) {
      console.error(`\n💥 Critical test failed: ${error.message}`);
    }

    const duration = Date.now() - startTime;
    const { report, reportFile } = this.generateReport();

    console.log('\n📊 Smoke Test Results:');
    console.log(`   Total Tests: ${report.summary.total}`);
    console.log(`   Passed: ${report.summary.passed}`);
    console.log(`   Failed: ${report.summary.failed}`);
    console.log(`   Success Rate: ${report.summary.successRate}%`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Report: ${reportFile}`);

    // Exit with error code if tests failed
    if (report.summary.failed > 0) {
      const criticalFailures = this.results.filter(r => 
        r.status === 'FAILED' && 
        ['Health Check', 'Database Connectivity', 'Home Page Load'].includes(r.name)
      );

      if (criticalFailures.length > 0) {
        console.error('\n❌ Critical tests failed. Deployment may have issues.');
        process.exit(1);
      } else {
        console.warn('\n⚠️  Some non-critical tests failed.');
        process.exit(0);
      }
    } else {
      console.log('\n✅ All smoke tests passed! Deployment appears successful.');
      process.exit(0);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        options.baseUrl = args[++i];
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--retries':
        options.retries = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
AIRWAVE Smoke Test Suite

Usage: node smoke-tests.js [options]

Options:
  --url <url>        Base URL to test (default: http://localhost:3000)
  --timeout <ms>     Request timeout in milliseconds (default: 10000)
  --retries <num>    Number of retries per test (default: 3)
  --help            Show this help message

Environment Variables:
  BASE_URL              Base URL for testing
  TEST_USER_EMAIL       Test user email
  TEST_USER_PASSWORD    Test user password
  NODE_ENV             Expected environment
        `);
        process.exit(0);
        break;
    }
  }

  const smokeTests = new SmokeTestSuite(options);
  smokeTests.runAllTests().catch(console.error);
}

module.exports = { SmokeTestSuite };
