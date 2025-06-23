/**
 * Load Testing Configuration for AIRFLOW
 * Comprehensive performance testing scenarios
 */

const BASE_URL = process.env.LOAD_TEST_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.LOAD_TEST_API_KEY || 'test-api-key';
const USER_TOKEN = process.env.LOAD_TEST_USER_TOKEN || 'test-user-token';

// Test scenarios configuration
export const LOAD_TEST_SCENARIOS = {
  // Basic API endpoint tests
  api_baseline: {
    name: 'API Baseline Performance',
    description: 'Basic API endpoint performance under normal load',
    duration: '2m',
    vus: 10, // Virtual users
    ramp_up: '30s',
    ramp_down: '30s',
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
      http_req_failed: ['rate<0.1'], // Less than 10% failure rate
      checks: ['rate>0.95'], // 95% of checks pass
    },
  },

  // Database optimization validation
  database_stress: {
    name: 'Database Query Optimization Validation',
    description: 'Test optimized database queries under stress',
    duration: '3m',
    vus: 25,
    ramp_up: '1m',
    ramp_down: '1m',
    thresholds: {
      http_req_duration: ['p(95)<800'], // Relaxed for complex queries
      http_req_failed: ['rate<0.05'], // Very low failure rate
      'http_req_duration{name:client_stats}': ['p(95)<300'], // Optimized client stats
      'http_req_duration{name:analytics}': ['p(95)<1000'], // Analytics queries
    },
  },

  // High concurrency test
  peak_load: {
    name: 'Peak Load Simulation',
    description: 'Simulate peak usage with high concurrency',
    duration: '5m',
    vus: 50,
    ramp_up: '2m',
    ramp_down: '2m',
    thresholds: {
      http_req_duration: ['p(95)<1000'], // Under 1 second
      http_req_failed: ['rate<0.2'], // 20% failure tolerance at peak
      http_reqs: ['rate>20'], // Minimum 20 requests per second
    },
  },

  // Endurance test
  endurance: {
    name: 'Endurance Testing',
    description: 'Long-running test to detect memory leaks and performance degradation',
    duration: '15m',
    vus: 15,
    ramp_up: '3m',
    ramp_down: '3m',
    thresholds: {
      http_req_duration: ['p(95)<600'], // Sustained performance
      http_req_failed: ['rate<0.1'],
      'http_req_duration{trend:stable}': ['trend<10'], // Performance should not degrade
    },
  },

  // Spike test
  spike: {
    name: 'Spike Load Testing',
    description: 'Test sudden traffic spikes and recovery',
    stages: [
      { duration: '1m', target: 5 }, // Normal load
      { duration: '30s', target: 100 }, // Sudden spike
      { duration: '2m', target: 100 }, // Sustained spike
      { duration: '30s', target: 5 }, // Back to normal
      { duration: '1m', target: 5 }, // Recovery
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'], // Higher tolerance for spikes
      http_req_failed: ['rate<0.3'], // 30% failure tolerance during spike
    },
  },
};

// API endpoints to test
export const API_ENDPOINTS = {
  // Core endpoints
  clients: {
    list: '/api/clients',
    create: '/api/clients',
    get: '/api/clients/{id}',
    update: '/api/clients/{id}',
    stats: '/api/clients?include_stats=true',
  },

  // Optimized endpoints
  optimized: {
    clients: '/api/optimized/clients',
    analytics: '/api/optimized/analytics',
  },

  // Performance monitoring
  performance: {
    dashboard: '/api/performance/dashboard',
  },

  // Asset management
  assets: {
    list: '/api/assets',
    upload: '/api/assets/upload',
    search: '/api/assets/search',
  },

  // Analytics
  analytics: {
    summary: '/api/analytics/summary',
    events: '/api/analytics/events',
    campaigns: '/api/analytics/campaigns',
  },

  // Authentication
  auth: {
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    profile: '/api/auth/profile',
  },
};

// Test data generators
export const TEST_DATA = {
  clients: {
    sample: {
      name: 'Load Test Client',
      industry: 'Technology',
      description: 'Client created during load testing',
      website: 'https://example.com',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
    },
    
    // Generate multiple client variations
    generate: (index) => ({
      name: `Test Client ${index}`,
      industry: ['Technology', 'Healthcare', 'Finance', 'Retail'][index % 4],
      description: `Description for test client ${index}`,
      website: `https://client${index}.example.com`,
      primaryColor: ['#1976d2', '#9c27b0', '#f44336', '#4caf50'][index % 4],
      secondaryColor: '#dc004e',
    }),
  },

  assets: {
    // Mock file data for upload testing
    mockFile: {
      name: 'test-image.jpg',
      type: 'image/jpeg',
      size: 1024 * 100, // 100KB
    },
  },

  analytics: {
    query: {
      period: 'month',
      metrics: ['campaigns', 'videos', 'views'],
      granularity: 'day',
    },
  },
};

// Performance expectations for different operations
export const PERFORMANCE_BENCHMARKS = {
  // Read operations (should be fast with optimizations)
  read: {
    simple_list: 200, // ms
    paginated_list: 300,
    single_item: 150,
    search: 400,
  },

  // Write operations (inherently slower)
  write: {
    create: 500,
    update: 400,
    delete: 300,
  },

  // Complex operations
  complex: {
    analytics: 1000,
    aggregations: 800,
    reports: 1500,
    file_upload: 3000,
  },

  // Database operations (with our optimizations)
  database: {
    client_stats: 250, // Should be fast with materialized views
    collections: 300, // Optimized N+1 elimination
    search: 400, // Full-text search indexes
  },
};

// Request patterns for realistic load simulation
export const REQUEST_PATTERNS = {
  // Typical user session
  user_session: [
    { endpoint: 'auth.login', weight: 1 },
    { endpoint: 'clients.list', weight: 3 },
    { endpoint: 'clients.stats', weight: 1 },
    { endpoint: 'assets.list', weight: 2 },
    { endpoint: 'analytics.summary', weight: 1 },
    { endpoint: 'performance.dashboard', weight: 0.5 },
  ],

  // Heavy analytics user
  analytics_heavy: [
    { endpoint: 'analytics.summary', weight: 4 },
    { endpoint: 'analytics.campaigns', weight: 3 },
    { endpoint: 'optimized.analytics', weight: 2 },
    { endpoint: 'performance.dashboard', weight: 1 },
  ],

  // Content creator pattern
  content_creator: [
    { endpoint: 'clients.list', weight: 2 },
    { endpoint: 'assets.upload', weight: 3 },
    { endpoint: 'assets.search', weight: 2 },
    { endpoint: 'assets.list', weight: 1 },
  ],

  // API-only usage
  api_only: [
    { endpoint: 'optimized.clients', weight: 3 },
    { endpoint: 'optimized.analytics', weight: 2 },
    { endpoint: 'clients.create', weight: 1 },
    { endpoint: 'clients.update', weight: 1 },
  ],
};

// Environment-specific configurations
export const ENVIRONMENTS = {
  development: {
    baseUrl: 'http://localhost:3000',
    concurrency: { min: 5, max: 20 },
    duration: { min: '1m', max: '5m' },
  },
  
  staging: {
    baseUrl: process.env.STAGING_URL,
    concurrency: { min: 10, max: 50 },
    duration: { min: '2m', max: '10m' },
  },
  
  production: {
    baseUrl: process.env.PRODUCTION_URL,
    concurrency: { min: 20, max: 100 },
    duration: { min: '5m', max: '30m' },
    // More strict thresholds for production
    thresholds: {
      http_req_duration: ['p(95)<300'],
      http_req_failed: ['rate<0.01'],
    },
  },
};

// Export configuration
const loadTestConfig = {
  BASE_URL,
  API_KEY,
  USER_TOKEN,
  LOAD_TEST_SCENARIOS,
  API_ENDPOINTS,
  TEST_DATA,
  PERFORMANCE_BENCHMARKS,
  REQUEST_PATTERNS,
  ENVIRONMENTS,
};

export default loadTestConfig;