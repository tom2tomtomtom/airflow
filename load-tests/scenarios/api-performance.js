/**
 * API Performance Load Tests
 * Comprehensive testing of all API endpoints under various load conditions
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { API_ENDPOINTS, TEST_DATA, REQUEST_PATTERNS } from '../config/load-test-config.js';

// Custom metrics
const apiResponseTime = new Trend('api_response_time');
const apiErrors = new Rate('api_errors');
const throughput = new Counter('api_throughput');
const concurrentUsers = new Gauge('concurrent_users');

// Test configuration
export const options = {
  scenarios: {
    // Normal load simulation
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'normal' },
    },
    
    // Spike testing
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '30s', target: 50 }, // Sudden spike
        { duration: '1m', target: 50 },   // Sustained
        { duration: '30s', target: 10 },  // Recovery
        { duration: '1m', target: 10 },
      ],
      tags: { test_type: 'spike' },
    },
    
    // API-specific stress test
    api_stress: {
      executor: 'constant-vus',
      vus: 30,
      duration: '4m',
      tags: { test_type: 'stress' },
    },
  },
  
  thresholds: {
    // Overall API performance
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.1'], // Less than 10% errors
    api_response_time: ['p(95)<800'],
    api_errors: ['rate<0.05'],
    
    // Specific endpoint thresholds
    'http_req_duration{endpoint:clients}': ['p(95)<500'],
    'http_req_duration{endpoint:analytics}': ['p(95)<1500'],
    'http_req_duration{endpoint:assets}': ['p(95)<800'],
    'http_req_duration{endpoint:auth}': ['p(95)<300'],
    
    // Throughput requirements
    api_throughput: ['rate>50'], // At least 50 requests per second
  },
};

/* global __ENV, __ITER */

const BASE_URL = __ENV.LOAD_TEST_BASE_URL || 'http://localhost:3000';
let authToken = null;

// Headers for authenticated requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': authToken ? `Bearer ${authToken}` : `Bearer ${__ENV.LOAD_TEST_USER_TOKEN || 'test-token'}`,
  'User-Agent': 'K6-LoadTest/1.0',
  'Accept': 'application/json',
});

export function setup() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting API Performance Load Tests');
  // eslint-disable-next-line no-console
  console.log(`📍 Target URL: ${BASE_URL}`);
  
  // Authenticate and get a real token
  const authResponse = authenticateUser();
  if (authResponse.success) {
    // eslint-disable-next-line no-console
    console.log('✅ Authentication successful');
    return { 
      baseUrl: BASE_URL,
      authToken: authResponse.token 
    };
  } else {
    // eslint-disable-next-line no-console
    console.log('⚠️  Authentication failed, using test token');
    return { baseUrl: BASE_URL };
  }
}

export default function apiPerformanceTest(data) {
  if (data.authToken) {
    authToken = data.authToken;
  }
  
  concurrentUsers.add(1);
  
  // Choose request pattern based on scenario tags
  const testType = __ITER % 3;
  
  switch(testType) {
    case 0:
      simulateTypicalUserSession();
      break;
    case 1:
      simulateAnalyticsHeavyUser();
      break;
    case 2:
      simulateContentCreator();
      break;
    default:
      simulateAPIOnlyUsage();
  }
  
  throughput.add(1);
  sleep(randomIntBetween(1, 3)); // Variable think time
}

/**
 * Authenticate user and get token
 */
function authenticateUser() {
  const loginData = {
    email: 'loadtest@example.com',
    password: 'loadtest123',
  };
  
  const response = http.post(
    `${BASE_URL}${API_ENDPOINTS.auth.login}`,
    JSON.stringify(loginData),
    { 
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'auth', operation: 'login' }
    }
  );
  
  const success = check(response, {
    'auth login status 200 or 201': (r) => [200, 201].includes(r.status),
  });
  
  if (success) {
    try {
      const data = JSON.parse(response.body);
      return { success: true, token: data.token || data.accessToken };
    } catch {
      return { success: false };
    }
  }
  
  return { success: false };
}

/**
 * Simulate typical user session
 */
function simulateTypicalUserSession() {
  group('Typical User Session', () => {
    // User authentication check
    testEndpoint('GET', API_ENDPOINTS.auth.profile, null, 'auth', 'profile');
    
    // Browse clients
    testEndpoint('GET', `${API_ENDPOINTS.clients.list}?limit=20`, null, 'clients', 'list');
    sleep(1);
    
    // Check client stats occasionally
    if (Math.random() < 0.3) {
      testEndpoint('GET', `${API_ENDPOINTS.clients.stats}?limit=10`, null, 'clients', 'stats');
    }
    
    // Browse assets
    testEndpoint('GET', `${API_ENDPOINTS.assets.list}?limit=15`, null, 'assets', 'list');
    sleep(0.5);
    
    // Check analytics summary
    if (Math.random() < 0.4) {
      testEndpoint('GET', `${API_ENDPOINTS.analytics.summary}?period=month`, null, 'analytics', 'summary');
    }
    
    // Occasionally check performance dashboard
    if (Math.random() < 0.1) {
      testEndpoint('GET', API_ENDPOINTS.performance.dashboard, null, 'performance', 'dashboard');
    }
  });
}

/**
 * Simulate analytics-heavy user
 */
function simulateAnalyticsHeavyUser() {
  group('Analytics Heavy User', () => {
    // Multiple analytics requests
    const periods = ['week', 'month', 'quarter'];
    const period = periods[Math.floor(Math.random() * periods.length)];
    
    testEndpoint('GET', `${API_ENDPOINTS.analytics.summary}?period=${period}`, null, 'analytics', 'summary');
    sleep(1);
    
    // Campaign analytics
    testEndpoint('GET', `${API_ENDPOINTS.analytics.campaigns}?period=${period}`, null, 'analytics', 'campaigns');
    sleep(0.5);
    
    // Optimized analytics endpoint
    testEndpoint('GET', `${API_ENDPOINTS.optimized.analytics}?period=${period}&metrics=campaigns,videos,views`, null, 'analytics', 'optimized');
    sleep(1);
    
    // Performance monitoring
    testEndpoint('GET', API_ENDPOINTS.performance.dashboard, null, 'performance', 'dashboard');
    sleep(2);
    
    // Events analytics
    testEndpoint('GET', `${API_ENDPOINTS.analytics.events}?limit=50`, null, 'analytics', 'events');
  });
}

/**
 * Simulate content creator workflow
 */
function simulateContentCreator() {
  group('Content Creator Workflow', () => {
    // Browse clients first
    testEndpoint('GET', `${API_ENDPOINTS.clients.list}?limit=10`, null, 'clients', 'list');
    sleep(0.5);
    
    // Search for assets
    const searchTerms = ['logo', 'banner', 'video', 'image', 'template'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    testEndpoint('GET', `${API_ENDPOINTS.assets.search}?query=${searchTerm}`, null, 'assets', 'search');
    sleep(1);
    
    // Browse asset collections
    testEndpoint('GET', `${API_ENDPOINTS.assets.list}?category=brand&limit=20`, null, 'assets', 'list_filtered');
    sleep(0.5);
    
    // Simulate asset upload (without actual file)
    if (Math.random() < 0.2) {
      const mockAssetData = {
        name: `test-asset-${randomString(8)}.jpg`,
        category: 'product',
        usage: 'hero',
        tags: ['test', 'loadtest'],
      };
      
      // Note: This would typically be a multipart form, simplified for load testing
      testEndpoint('POST', API_ENDPOINTS.assets.upload, mockAssetData, 'assets', 'upload');
    }
    
    // Create a test client occasionally
    if (Math.random() < 0.1) {
      const clientData = TEST_DATA.clients.generate(randomIntBetween(1, 1000));
      testEndpoint('POST', API_ENDPOINTS.clients.create, clientData, 'clients', 'create');
    }
  });
}

/**
 * Simulate API-only usage (no UI)
 */
function simulateAPIOnlyUsage() {
  group('API Only Usage', () => {
    // Use optimized endpoints
    testEndpoint('GET', `${API_ENDPOINTS.optimized.clients}?limit=25`, null, 'clients', 'optimized');
    sleep(0.3);
    
    testEndpoint('GET', `${API_ENDPOINTS.optimized.analytics}?period=week`, null, 'analytics', 'optimized');
    sleep(0.5);
    
    // CRUD operations
    if (Math.random() < 0.15) {
      // Create client
      const clientData = TEST_DATA.clients.generate(randomIntBetween(1, 10000));
      const createResponse = testEndpoint('POST', API_ENDPOINTS.clients.create, clientData, 'clients', 'create');
      
      if (createResponse && createResponse.status === 201) {
        try {
          const client = JSON.parse(createResponse.body).data;
          
          // Update the client
          const updateData = { ...clientData, description: 'Updated via API load test' };
          testEndpoint('PUT', API_ENDPOINTS.clients.update.replace('{id}', client.id), updateData, 'clients', 'update');
          sleep(0.2);
          
          // Get specific client
          testEndpoint('GET', API_ENDPOINTS.clients.get.replace('{id}', client.id), null, 'clients', 'get');
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Failed to parse client creation response');
        }
      }
    }
  });
}

/**
 * Generic endpoint testing function
 */
function testEndpoint(method, endpoint, payload, category, operation) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = getHeaders();
  const tags = { 
    endpoint: category,
    operation: operation,
    method: method.toLowerCase()
  };
  
  let response;
  const startTime = Date.now();
  
  try {
    switch(method.toUpperCase()) {
      case 'GET':
        response = http.get(url, { headers, tags });
        break;
      case 'POST':
        response = http.post(url, JSON.stringify(payload), { headers, tags });
        break;
      case 'PUT':
        response = http.put(url, JSON.stringify(payload), { headers, tags });
        break;
      case 'DELETE':
        response = http.del(url, null, { headers, tags });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    const responseTime = Date.now() - startTime;
    apiResponseTime.add(responseTime);
    
    const success = check(response, {
      [`${operation} status success`]: (r) => r.status >= 200 && r.status < 400,
      [`${operation} response time acceptable`]: (r) => r.timings.duration < 5000,
      [`${operation} has response body`]: (r) => r.body && r.body.length > 0,
    });
    
    if (!success) {
      apiErrors.add(1);
      // eslint-disable-next-line no-console
      console.warn(`❌ ${operation} failed:`, {
        status: response.status,
        url: url,
        duration: response.timings.duration
      });
    }
    
    // Validate JSON response for GET requests
    if (method === 'GET' && response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        check(response, {
          [`${operation} valid JSON`]: () => true,
          [`${operation} success field`]: () => data.success !== false,
        });
      } catch {
        check(response, {
          [`${operation} valid JSON`]: () => false,
        });
      }
    }
    
    return response;
    
  } catch (error) {
    apiErrors.add(1);
    // eslint-disable-next-line no-console
    console.error(`🚨 ${operation} error:`, error.message);
    return null;
  }
}

export function teardown(_data) {
  // eslint-disable-next-line no-console
  console.log('🏁 API Performance Load Tests completed');
}

// Handle test results
export function handleSummary(data) {
  const summary = generatePerformanceSummary(data);
  
  return {
    'load-test-results/api-performance-results.json': JSON.stringify(data, null, 2),
    'load-test-results/api-performance-summary.txt': summary,
    stdout: summary,
  };
}

function generatePerformanceSummary(data) {
  const { metrics } = data;
  
  const httpReqDuration = metrics.http_req_duration?.values;
  const httpReqFailed = metrics.http_req_failed?.values;
  const apiResponseTime = metrics.api_response_time?.values;
  const apiErrors = metrics.api_errors?.values;
  const throughput = metrics.api_throughput?.values;
  
  return `
API Performance Load Test Results
===============================

🎯 Overall Performance:
   Request Duration (avg): ${httpReqDuration?.avg?.toFixed(2) || 'N/A'}ms
   Request Duration (p95): ${httpReqDuration?.['p(95)']?.toFixed(2) || 'N/A'}ms
   Request Duration (p99): ${httpReqDuration?.['p(99)']?.toFixed(2) || 'N/A'}ms
   Request Failure Rate: ${(httpReqFailed?.rate * 100)?.toFixed(2) || 'N/A'}%

⚡ API Metrics:
   API Response Time (p95): ${apiResponseTime?.['p(95)']?.toFixed(2) || 'N/A'}ms
   API Error Rate: ${(apiErrors?.rate * 100)?.toFixed(2) || 'N/A'}%
   Throughput: ${throughput?.rate?.toFixed(2) || 'N/A'} req/s

📊 Performance Targets:
   ✅ P95 < 1000ms: ${(httpReqDuration?.['p(95)'] || 0) < 1000 ? 'PASS' : 'FAIL'}
   ✅ Error Rate < 10%: ${(httpReqFailed?.rate * 100 || 0) < 10 ? 'PASS' : 'FAIL'}
   ✅ Throughput > 50 req/s: ${(throughput?.rate || 0) > 50 ? 'PASS' : 'FAIL'}

🔍 Analysis:
   Total Requests: ${metrics.http_reqs?.values?.count || 'N/A'}
   Total Errors: ${Math.round((apiErrors?.rate || 0) * (metrics.http_reqs?.values?.count || 0))}
   Test Duration: ${(data.state?.testRunDurationMs / 1000)?.toFixed(1) || 'N/A'}s

Generated at: ${new Date().toISOString()}
  `;
}