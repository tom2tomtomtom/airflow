#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * Sets up error tracking, performance monitoring, and uptime checks
 */

const fs = require('fs');
const path = require('path');

// Monitoring configuration templates
const MONITORING_CONFIGS = {
  sentry: {
    // Sentry configuration for error tracking
    config: `
// Sentry Error Tracking Configuration
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  beforeSend(event) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ChunkLoadError' || error?.type === 'ResizeObserver loop limit exceeded') {
          return null;
        }
      }
    }
    return event;
  },
  beforeSendTransaction(event) {
    // Sample transactions based on environment
    return Math.random() < (process.env.NODE_ENV === 'production' ? 0.1 : 1.0) ? event : null;
  },
});

export { Sentry };
`,
    envVars: [
      'SENTRY_DSN=your_sentry_dsn_here',
      'NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn_here',
    ]
  },

  uptime: {
    // Uptime monitoring script
    script: `
#!/usr/bin/env node

/**
 * Uptime Monitoring Script
 * Checks application health and sends alerts
 */

const https = require('https');
const fs = require('fs');

const CONFIG = {
  endpoints: [
    { name: 'Health Check', url: '/api/health', critical: true },
    { name: 'Status Check', url: '/api/status', critical: false },
    { name: 'Auth Check', url: '/api/auth/status', critical: true },
  ],
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  alertWebhook: process.env.ALERT_WEBHOOK_URL,
  checkInterval: 60000, // 1 minute
  timeout: 10000, // 10 seconds
};

class UptimeMonitor {
  constructor() {
    this.consecutiveFailures = new Map();
    this.lastAlertTime = new Map();
  }

  async checkEndpoint(endpoint) {
    return new Promise((resolve) => {
      const url = \`\${CONFIG.baseUrl}\${endpoint.url}\`;
      const startTime = Date.now();
      
      const request = https.get(url, { timeout: CONFIG.timeout }, (res) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            status: res.statusCode,
            responseTime,
            healthy: res.statusCode >= 200 && res.statusCode < 300,
            body: body.substring(0, 500), // Limit body size
            timestamp: new Date().toISOString(),
          });
        });
      });

      request.on('error', (error) => {
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          responseTime: Date.now() - startTime,
          healthy: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          responseTime: CONFIG.timeout,
          healthy: false,
          error: 'Request timeout',
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  async sendAlert(endpoint, result) {
    if (!CONFIG.alertWebhook) return;

    const alertData = {
      text: \`🚨 ALERT: \${endpoint.name} is DOWN\`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Endpoint', value: endpoint.url, short: true },
          { title: 'Status', value: result.status || 'N/A', short: true },
          { title: 'Response Time', value: \`\${result.responseTime}ms\`, short: true },
          { title: 'Error', value: result.error || 'Unknown', short: false },
          { title: 'Timestamp', value: result.timestamp, short: false },
        ]
      }]
    };

    try {
      // This would integrate with your preferred alerting system
      console.log('ALERT:', JSON.stringify(alertData, null, 2));
    } catch (error) {
      console.error('Failed to send alert:', error.message);
    }
  }

  async checkAll() {
    console.log(\`\\n🔍 Health Check - \${new Date().toISOString()}\`);
    
    for (const endpoint of CONFIG.endpoints) {
      const result = await this.checkEndpoint(endpoint);
      
      if (result.healthy) {
        console.log(\`✅ \${result.name}: \${result.status} (\${result.responseTime}ms)\`);
        this.consecutiveFailures.set(endpoint.name, 0);
      } else {
        const failures = (this.consecutiveFailures.get(endpoint.name) || 0) + 1;
        this.consecutiveFailures.set(endpoint.name, failures);
        
        console.log(\`❌ \${result.name}: \${result.status || 'ERROR'} (\${result.responseTime}ms) - \${result.error || 'Unknown error'}\`);
        
        // Send alert after 3 consecutive failures for critical endpoints
        if (endpoint.critical && failures >= 3) {
          const lastAlert = this.lastAlertTime.get(endpoint.name) || 0;
          const now = Date.now();
          
          // Don't spam alerts - minimum 15 minutes between alerts
          if (now - lastAlert > 900000) {
            await this.sendAlert(endpoint, result);
            this.lastAlertTime.set(endpoint.name, now);
          }
        }
      }
    }
  }

  start() {
    console.log('🚀 Starting uptime monitoring...');
    console.log(\`Monitoring \${CONFIG.endpoints.length} endpoints every \${CONFIG.checkInterval/1000} seconds\`);
    
    // Initial check
    this.checkAll();
    
    // Schedule regular checks
    setInterval(() => this.checkAll(), CONFIG.checkInterval);
  }
}

if (require.main === module) {
  const monitor = new UptimeMonitor();
  monitor.start();
}

module.exports = UptimeMonitor;
`
  },

  performance: {
    // Performance monitoring utility
    script: `
/**
 * Performance Monitoring Utilities
 * Tracks and reports application performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  // Start timing an operation
  start(label) {
    this.startTimes.set(label, process.hrtime.bigint());
  }

  // End timing and record metric
  end(label, metadata = {}) {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(\`No start time found for metric: \${label}\`);
      return;
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    this.recordMetric(label, duration, metadata);
    this.startTimes.delete(label);
    
    return duration;
  }

  // Record a custom metric
  recordMetric(label, value, metadata = {}) {
    const metric = {
      label,
      value,
      metadata,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    this.metrics.get(label).push(metric);
    
    // Keep only last 100 measurements per metric
    const measurements = this.metrics.get(label);
    if (measurements.length > 100) {
      measurements.shift();
    }

    // Log slow operations
    if (value > 1000) { // > 1 second
      console.warn(\`⚠️  Slow operation detected: \${label} took \${value.toFixed(2)}ms\`, metadata);
    }
  }

  // Get statistics for a metric
  getStats(label) {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const values = measurements.map(m => m.value);
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  // Get all metrics summary
  getSummary() {
    const summary = {};
    
    for (const [label] of this.metrics) {
      summary[label] = this.getStats(label);
    }
    
    return summary;
  }

  // Express.js middleware for automatic API monitoring
  middleware() {
    return (req, res, next) => {
      const label = \`API_\${req.method}_\${req.route?.path || req.path}\`;
      this.start(label);
      
      const originalEnd = res.end;
      res.end = (...args) => {
        const duration = this.end(label, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
        });
        
        originalEnd.apply(res, args);
      };
      
      next();
    };
  }

  // Memory usage monitoring
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: usage.rss / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024, // MB
      arrayBuffers: usage.arrayBuffers / 1024 / 1024, // MB
    };
  }

  // Log performance summary
  logSummary() {
    console.log('\\n📊 Performance Summary:');
    console.log('Memory Usage:', this.getMemoryUsage());
    
    const summary = this.getSummary();
    for (const [label, stats] of Object.entries(summary)) {
      if (stats) {
        console.log(\`\${label}: avg=\${stats.mean.toFixed(2)}ms, p95=\${stats.p95.toFixed(2)}ms, count=\${stats.count}\`);
      }
    }
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-log summary every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => performanceMonitor.logSummary(), 300000);
}

module.exports = { PerformanceMonitor, performanceMonitor };
`
  }
};

function createMonitoringFiles() {
  console.log('🔧 Setting up monitoring infrastructure...');
  
  // Create monitoring directory
  const monitoringDir = path.join(process.cwd(), 'src', 'lib', 'monitoring');
  if (!fs.existsSync(monitoringDir)) {
    fs.mkdirSync(monitoringDir, { recursive: true });
  }

  // Create Sentry configuration
  fs.writeFileSync(
    path.join(monitoringDir, 'sentry.ts'),
    MONITORING_CONFIGS.sentry.config
  );

  // Create performance monitor
  fs.writeFileSync(
    path.join(monitoringDir, 'performance.ts'),
    MONITORING_CONFIGS.performance.script
  );

  // Create uptime monitoring script
  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'uptime-monitor.js'),
    MONITORING_CONFIGS.uptime.script
  );

  // Make uptime monitor executable
  fs.chmodSync(path.join(process.cwd(), 'scripts', 'uptime-monitor.js'), '755');

  console.log('✅ Monitoring files created successfully!');
}

function updatePackageJson() {
  console.log('📦 Adding monitoring scripts to package.json...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add monitoring scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'monitor:uptime': 'node scripts/uptime-monitor.js',
    'monitor:performance': 'node -e "const { performanceMonitor } = require(\'./src/lib/monitoring/performance\'); performanceMonitor.logSummary();"',
    'health:check': 'curl -f http://localhost:3000/api/health || exit 1',
  };

  // Add monitoring dependencies to devDependencies
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    '@sentry/nextjs': '^7.x.x',
    'node-cron': '^3.0.3',
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated with monitoring scripts!');
}

function createEnvironmentTemplate() {
  console.log('📝 Creating monitoring environment variables template...');
  
  const envTemplate = `
# Monitoring Configuration
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn_here
ALERT_WEBHOOK_URL=your_slack_webhook_or_discord_webhook_url
BASE_URL=https://your-production-domain.com

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_SAMPLE_RATE=0.1
`;

  const envExamplePath = path.join(process.cwd(), '.env.monitoring.example');
  fs.writeFileSync(envExamplePath, envTemplate.trim());
  
  console.log('✅ Monitoring environment template created!');
}

function main() {
  console.log('🚀 Starting monitoring setup...\n');
  
  try {
    createMonitoringFiles();
    updatePackageJson();
    createEnvironmentTemplate();
    
    console.log('\n🎉 Monitoring setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Configure environment variables in .env.monitoring.example');
    console.log('3. Start uptime monitoring: npm run monitor:uptime');
    console.log('4. Set up Sentry account and add DSN to environment');
    
  } catch (error) {
    console.error('❌ Error setting up monitoring:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createMonitoringFiles, updatePackageJson };
