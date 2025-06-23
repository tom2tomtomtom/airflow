# Load Testing Infrastructure for AIRFLOW

Comprehensive load testing suite to validate performance optimizations and ensure system reliability under various load conditions.

## 🚀 Quick Start

### Prerequisites

1. **Install k6**: Load testing tool
   ```bash
   # macOS
   brew install k6
   
   # Linux
   sudo apt install k6
   
   # Windows
   choco install k6
   ```

2. **Start AIRFLOW Application**:
   ```bash
   npm run dev
   ```

3. **Verify Application Health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Running Load Tests

```bash
# Run all load tests
npm run load:test

# Run specific scenarios
npm run load:test:database    # Database optimization validation
npm run load:test:api        # API performance testing
npm run load:test:endurance  # Long-running stability test

# Dry run (preview without executing)
npm run load:test:dry-run

# Verbose output
npm run load:test:all
```

## 📊 Test Scenarios

### 1. Database Optimization (`database-optimization.js`)
**Purpose**: Validate our N+1 query fixes and database optimizations

**Key Tests**:
- Client statistics loading (N+1 elimination)
- Analytics query optimization
- Full-text search performance
- Collection asset loading efficiency

**Thresholds**:
- Client stats response time < 300ms (p95)
- Analytics response time < 1000ms (p95)
- Optimized endpoint error rate < 1%

**Duration**: ~4 minutes

### 2. API Performance (`api-performance.js`)
**Purpose**: Comprehensive testing of all API endpoints

**User Simulation Patterns**:
- **Typical User**: Browse clients, assets, check analytics
- **Analytics Heavy**: Multiple analytics requests, performance monitoring
- **Content Creator**: Asset management, uploads, client creation
- **API Only**: Direct API usage with CRUD operations

**Thresholds**:
- Request duration (p95) < 1000ms
- Request failure rate < 10%
- API throughput > 50 req/s

**Duration**: ~9 minutes

### 3. Endurance Testing (`endurance-test.js`)
**Purpose**: Long-running test to detect memory leaks and performance degradation

**Monitoring**:
- Performance stability over time
- Memory usage patterns
- Connection error tracking
- Response time trend analysis

**Thresholds**:
- Performance degradation < 50%
- Connection errors < 100
- Sustained performance < 1000ms (p95)

**Duration**: 20 minutes

## 🔧 Configuration

### Environment Variables

```bash
# Required
LOAD_TEST_BASE_URL=http://localhost:3000    # Target application URL
LOAD_TEST_USER_TOKEN=your-auth-token        # Authentication token
LOAD_TEST_API_KEY=your-api-key              # API key for endpoints

# Optional
NODE_ENV=test                               # Environment mode
```

### Test Configuration (`config/load-test-config.js`)

```javascript
// Scenario configurations
LOAD_TEST_SCENARIOS: {
  database_stress: {
    duration: '3m',
    vus: 25,  // Virtual users
    thresholds: {
      http_req_duration: ['p(95)<800'],
      http_req_failed: ['rate<0.05'],
    }
  }
}

// Performance benchmarks
PERFORMANCE_BENCHMARKS: {
  read: {
    simple_list: 200,    // ms
    search: 400,
  },
  database: {
    client_stats: 250,   // Optimized with materialized views
    collections: 300,    // N+1 elimination
  }
}
```

## 📈 Understanding Results

### Metrics Tracked

- **Response Time**: Average, p95, p99 response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Custom Metrics**:
  - `client_stats_response_time`: Database optimization validation
  - `analytics_response_time`: Complex query performance
  - `optimized_endpoint_errors`: Error rate for optimized endpoints

### Result Files

Results are saved in `load-tests/results/`:
- `{scenario}-{timestamp}.json`: Raw k6 output
- `{scenario}-summary.txt`: Human-readable summary
- `load-test-report-{timestamp}.json`: Consolidated report

### Sample Output

```
Database Optimization Load Test Results
=====================================

🎯 Overall Performance:
   Request Duration (p95): 245.67ms
   Request Failure Rate: 0.82%
   Requests per Second: 87.3

⚡ Database Optimizations:
   Client Stats Response Time (p95): 198.45ms  ✅ PASS
   Analytics Response Time (p95): 756.23ms     ✅ PASS
   Optimized Endpoint Errors: 0.15%            ✅ PASS

🎯 Performance Targets:
   ✅ Client Stats < 300ms: PASS
   ✅ Analytics < 1000ms: PASS
   ✅ Error Rate < 1%: PASS
```

## 🎯 Performance Targets

### Database Optimizations
- ✅ **Client Stats < 300ms**: Validates materialized view performance
- ✅ **N+1 Elimination**: Collection loading in single queries
- ✅ **Full-text Search < 400ms**: Index utilization
- ✅ **Analytics < 1000ms**: Optimized aggregation queries

### API Performance
- ✅ **P95 Response Time < 1000ms**: Overall API responsiveness
- ✅ **Error Rate < 10%**: System reliability
- ✅ **Throughput > 50 req/s**: Concurrent user capacity

### System Stability
- ✅ **20min Endurance**: No performance degradation
- ✅ **Memory Stability**: No memory leaks
- ✅ **Connection Health**: Minimal connection errors

## 🛠️ Advanced Usage

### Custom Scenarios

Create new test scenarios in `scenarios/`:

```javascript
// scenarios/custom-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function() {
  const response = http.get('http://localhost:3000/api/custom');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
```

### Environment-Specific Testing

```bash
# Development environment
LOAD_TEST_BASE_URL=http://localhost:3000 npm run load:test

# Staging environment  
LOAD_TEST_BASE_URL=https://staging.airwave.com npm run load:test

# Production environment (use with caution)
LOAD_TEST_BASE_URL=https://app.airwave.com npm run load:test:database
```

### Continuous Integration

```yaml
# .github/workflows/load-tests.yml
name: Load Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run dev &
      - run: sleep 30  # Wait for app to start
      - run: npm run load:test
```

## 📊 Monitoring Integration

### APM Integration

Load tests automatically generate metrics compatible with:
- **Grafana**: Import dashboards from `monitoring/grafana/`
- **DataDog**: Custom metrics with `dd.` prefix
- **New Relic**: Performance insights integration

### Alerts Configuration

Set up alerts for:
- Response time degradation > 50%
- Error rate increase > 5%
- Throughput drop > 30%

## 🔍 Troubleshooting

### Common Issues

1. **"k6 not found"**
   ```bash
   # Install k6 first
   brew install k6  # macOS
   ```

2. **"Application not responding"**
   ```bash
   # Check if app is running
   curl http://localhost:3000/api/health
   
   # Start the application
   npm run dev
   ```

3. **"High error rates"**
   - Check authentication tokens
   - Verify database connectivity
   - Review application logs

4. **"Performance degradation"**
   - Run database optimizations: `npm run db:optimize`
   - Check system resources
   - Review recent code changes

### Debug Mode

```bash
# Run with verbose logging
npm run load:test:all

# Test specific scenario with debug
K6_DEBUG=true npm run load:test:database

# Dry run to validate configuration
npm run load:test:dry-run
```

## 🎯 Optimization Validation

### Before/After Comparison

The load tests specifically validate our optimizations:

1. **N+1 Query Elimination**:
   - Before: Multiple queries for client stats
   - After: Single materialized view query
   - Target: 60-80% improvement

2. **Full-Text Search**:
   - Before: ILIKE pattern matching
   - After: PostgreSQL FTS indexes
   - Target: 50-300% improvement

3. **Analytics Aggregation**:
   - Before: Multiple sequential queries
   - After: Single RPC call with CTEs
   - Target: 40-60% improvement

### Performance Regression Detection

Load tests will fail if performance regresses beyond thresholds, ensuring:
- Database optimizations remain effective
- New code doesn't introduce performance issues
- System maintains scalability standards

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/automated-performance-testing/)
- [Database Optimization Guide](../database-optimizations.sql)
- [AIRWAVE Performance Architecture](../docs/performance-architecture.md)

## 🤝 Contributing

When adding new optimizations:

1. Add corresponding load tests
2. Update performance benchmarks
3. Document expected improvements
4. Run regression validation

Load testing ensures our optimizations deliver real-world performance benefits! 🚀