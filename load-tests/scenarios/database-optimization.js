/**
 * Database Optimization Load Tests
 * Validates our N+1 query fixes and performance optimizations
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { API_ENDPOINTS, TEST_DATA, PERFORMANCE_BENCHMARKS } from '../config/load-test-config.js';

// Custom metrics
const clientStatsResponseTime = new Trend('client_stats_response_time');
const analyticsResponseTime = new Trend('analytics_response_time');
const optimizedEndpointErrors = new Rate('optimized_endpoint_errors');
const databaseQueryCount = new Counter('database_query_count');

// Test configuration
export const options = {
  scenarios: {
    // Test N+1 query optimization
    client_stats_load: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '2m', target: 15 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'client_stats' },
    },
    
    // Test analytics optimization
    analytics_stress: {
      executor: 'ramping-vus',
      startVUs: 3,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'analytics' },
    },
    
    // Test full-text search
    search_performance: {
      executor: 'constant-vus',
      vus: 8,
      duration: '3m',
      tags: { test_type: 'search' },
    },
  },
  
  thresholds: {
    // Overall performance
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.05'],
    
    // Specific optimizations
    client_stats_response_time: ['p(95)<300'], // Should be fast with materialized views
    analytics_response_time: ['p(95)<1000'], // Complex analytics
    optimized_endpoint_errors: ['rate<0.01'], // Very low error rate
    
    // Database performance
    'http_req_duration{name:optimized_clients}': ['p(95)<250'],
    'http_req_duration{name:client_collections}': ['p(95)<350'],
  },
};

/* global __ENV */

const BASE_URL = __ENV.LOAD_TEST_BASE_URL || 'http://localhost:3000';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${__ENV.LOAD_TEST_USER_TOKEN || 'test-token'}`,
};

export function setup() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting Database Optimization Load Tests');
  // eslint-disable-next-line no-console
  console.log(`📍 Target URL: ${BASE_URL}`);
  
  // Warm up the application
  // eslint-disable-next-line no-console
  console.log('🔥 Warming up application...');
  http.get(`${BASE_URL}/api/health`);
  
  return { baseUrl: BASE_URL };
}

export default function databaseOptimizationTest(_data) {
  const testType = __ENV.TEST_TYPE || 'mixed';
  
  switch(testType) {
    case 'client_stats':
      testClientStatsOptimization();
      break;
    case 'analytics':
      testAnalyticsOptimization();
      break;
    case 'search':
      testSearchOptimization();
      break;
    default:
      testMixedWorkload();
  }
  
  sleep(1); // Think time between requests
}

/**
 * Test client statistics optimization (N+1 query fix)
 */
function testClientStatsOptimization() {
  group('Client Stats Optimization', () => {
    // Test basic client list (should be fast)
    const basicResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.clients.list}?limit=20`,
      { headers, tags: { name: 'basic_clients' } }
    );
    
    check(basicResponse, {
      'basic client list status 200': (r) => r.status === 200,
      'basic client list fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.read.simple_list,
    });
    
    // Test client list WITH stats (this had N+1 problem)
    const startTime = Date.now();
    const statsResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.clients.stats}?limit=20`,
      { headers, tags: { name: 'client_stats' } }
    );
    const statsResponseTime = Date.now() - startTime;
    
    clientStatsResponseTime.add(statsResponseTime);
    
    const statsSuccess = check(statsResponse, {
      'client stats status 200': (r) => r.status === 200,
      'client stats has data': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.success && Array.isArray(data.data);
        } catch {
          return false;
        }
      },
      'client stats optimized': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.database.client_stats,
      'client stats includes counts': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.data.length > 0 && 
                 'total_campaigns' in data.data[0] &&
                 'total_assets' in data.data[0];
        } catch {
          return false;
        }
      },
    });
    
    if (!statsSuccess) {
      optimizedEndpointErrors.add(1);
    }
    
    // Test optimized client endpoint
    const optimizedResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.optimized.clients}?limit=20`,
      { headers, tags: { name: 'optimized_clients' } }
    );
    
    check(optimizedResponse, {
      'optimized clients status 200': (r) => r.status === 200,
      'optimized clients fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.database.client_stats,
      'optimized clients includes meta': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.meta && data.meta.optimized === true;
        } catch {
          return false;
        }
      },
    });
  });
}

/**
 * Test analytics optimization
 */
function testAnalyticsOptimization() {
  group('Analytics Optimization', () => {
    // Test regular analytics endpoint
    const analyticsResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.analytics.summary}?period=month`,
      { headers, tags: { name: 'analytics_summary' } }
    );
    
    check(analyticsResponse, {
      'analytics status 200': (r) => r.status === 200,
      'analytics reasonable time': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.complex.analytics,
    });
    
    // Test optimized analytics endpoint (should use RPC calls)
    const startTime = Date.now();
    const optimizedAnalyticsResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.optimized.analytics}?period=month&metrics=campaigns,videos,views`,
      { headers, tags: { name: 'optimized_analytics' } }
    );
    const analyticsTime = Date.now() - startTime;
    
    analyticsResponseTime.add(analyticsTime);
    
    const analyticsSuccess = check(optimizedAnalyticsResponse, {
      'optimized analytics status 200': (r) => r.status === 200,
      'optimized analytics has summary': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.summary && 
                 typeof data.summary.total_campaigns === 'number' &&
                 typeof data.summary.total_views === 'number';
        } catch {
          return false;
        }
      },
      'optimized analytics cache header': (r) => r.headers['X-Cache'] !== undefined,
      'optimized analytics fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.complex.analytics,
    });
    
    if (!analyticsSuccess) {
      optimizedEndpointErrors.add(1);
    }
    
    // Test analytics with different parameters
    const parameterizedResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.optimized.analytics}?period=week&granularity=day`,
      { headers, tags: { name: 'analytics_parameterized' } }
    );
    
    check(parameterizedResponse, {
      'parameterized analytics status 200': (r) => r.status === 200,
      'parameterized analytics data structure': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.data && typeof data.data === 'object';
        } catch {
          return false;
        }
      },
    });
  });
}

/**
 * Test search optimization (full-text search indexes)
 */
function testSearchOptimization() {
  group('Search Optimization', () => {
    const searchTerms = ['tech', 'marketing', 'client', 'campaign', 'test'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    // Test client search (should use full-text search indexes)
    const clientSearchResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.clients.list}?search=${searchTerm}&limit=10`,
      { headers, tags: { name: 'client_search' } }
    );
    
    check(clientSearchResponse, {
      'client search status 200': (r) => r.status === 200,
      'client search fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.read.search,
      'client search results': (r) => {
        try {
          const data = JSON.parse(r.body);
          return Array.isArray(data.data);
        } catch {
          return false;
        }
      },
    });
    
    // Test asset search
    const assetSearchResponse = http.get(
      `${BASE_URL}${API_ENDPOINTS.assets.search}?query=${searchTerm}&limit=10`,
      { headers, tags: { name: 'asset_search' } }
    );
    
    check(assetSearchResponse, {
      'asset search status 200': (r) => r.status === 200,
      'asset search fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.read.search,
    });
    
    // Test optimized search endpoint if available
    const optimizedSearchResponse = http.get(
      `${BASE_URL}/api/search/content?query=${searchTerm}&type=all&limit=10`,
      { headers, tags: { name: 'optimized_search' } }
    );
    
    // This endpoint might not exist, so don't fail if 404
    if (optimizedSearchResponse.status !== 404) {
      check(optimizedSearchResponse, {
        'optimized search status 200': (r) => r.status === 200,
        'optimized search very fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.database.search,
      });
    }
  });
}

/**
 * Test mixed workload simulation
 */
function testMixedWorkload() {
  group('Mixed Database Workload', () => {
    // Simulate realistic user behavior
    const workflows = [
      () => testClientStatsOptimization(),
      () => testAnalyticsOptimization(),
      () => testSearchOptimization(),
    ];
    
    // Randomly execute one of the workflows
    const workflow = workflows[Math.floor(Math.random() * workflows.length)];
    workflow();
    
    // Add some database write operations
    if (Math.random() < 0.2) { // 20% chance
      testDatabaseWrites();
    }
  });
}

/**
 * Test database write operations
 */
function testDatabaseWrites() {
  group('Database Write Operations', () => {
    // Create a test client
    const clientData = TEST_DATA.clients.generate(Math.floor(Math.random() * 1000));
    
    const createResponse = http.post(
      `${BASE_URL}${API_ENDPOINTS.clients.create}`,
      JSON.stringify(clientData),
      { headers, tags: { name: 'client_create' } }
    );
    
    const clientCreated = check(createResponse, {
      'client create status 201': (r) => r.status === 201,
      'client create fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.write.create,
    });
    
    if (clientCreated) {
      try {
        const client = JSON.parse(createResponse.body).data;
        databaseQueryCount.add(1);
        
        // Update the client
        const updateResponse = http.put(
          `${BASE_URL}${API_ENDPOINTS.clients.update.replace('{id}', client.id)}`,
          JSON.stringify({ ...clientData, description: 'Updated during load test' }),
          { headers, tags: { name: 'client_update' } }
        );
        
        check(updateResponse, {
          'client update status 200': (r) => r.status === 200,
          'client update fast': (r) => r.timings.duration < PERFORMANCE_BENCHMARKS.write.update,
        });
        
        databaseQueryCount.add(1);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse client response:', e);
      }
    }
  });
}

export function teardown(_data) {
  // eslint-disable-next-line no-console
  console.log('🏁 Database Optimization Load Tests completed');
  // eslint-disable-next-line no-console
  console.log('📊 Check the metrics for optimization validation');
}

// Handle results
export function handleSummary(data) {
  return {
    'load-test-results/database-optimization-results.json': JSON.stringify(data, null, 2),
    'load-test-results/database-optimization-summary.txt': generateTextSummary(data),
  };
}

function generateTextSummary(data) {
  const { metrics } = data;
  
  return `
Database Optimization Load Test Results
=====================================

🎯 Overall Performance:
   Request Duration (p95): ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
   Request Failure Rate: ${(metrics.http_req_failed?.values?.rate * 100)?.toFixed(2) || 'N/A'}%
   Requests per Second: ${metrics.http_reqs?.values?.rate?.toFixed(2) || 'N/A'}

⚡ Database Optimizations:
   Client Stats Response Time (p95): ${metrics.client_stats_response_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
   Analytics Response Time (p95): ${metrics.analytics_response_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
   Optimized Endpoint Errors: ${(metrics.optimized_endpoint_errors?.values?.rate * 100)?.toFixed(2) || 'N/A'}%

📈 Database Operations:
   Total Database Queries: ${metrics.database_query_count?.values?.count || 'N/A'}
   
🎯 Performance Targets:
   ✅ Client Stats < 300ms: ${(metrics.client_stats_response_time?.values?.['p(95)'] || 0) < 300 ? 'PASS' : 'FAIL'}
   ✅ Analytics < 1000ms: ${(metrics.analytics_response_time?.values?.['p(95)'] || 0) < 1000 ? 'PASS' : 'FAIL'}
   ✅ Error Rate < 1%: ${(metrics.optimized_endpoint_errors?.values?.rate * 100 || 0) < 1 ? 'PASS' : 'FAIL'}

Generated at: ${new Date().toISOString()}
  `;
}