#!/usr/bin/env node

/**
 * Performance Testing Suite
 * Includes Lighthouse audits, load testing, and bundle analysis
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class PerformanceTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.outputDir = options.outputDir || './performance-reports';
    this.thresholds = {
      lighthouse: {
        performance: 90,
        accessibility: 90,
        bestPractices: 90,
        seo: 90,
        pwa: 80
      },
      loadTest: {
        maxResponseTime: 500, // ms
        maxErrorRate: 0.01,   // 1%
        minRps: 50           // requests per second
      }
    };
  }

  async setup() {
    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    console.log('🔧 Setting up performance testing tools...');
    console.log(`📂 Reports will be saved to: ${this.outputDir}`);
  }

  async runLighthouseAudit(pages = ['/']) {
    console.log('🏃‍♂️ Running Lighthouse audits...');

    const results = {};
    
    for (const page of pages) {
      const url = `${this.baseUrl}${page}`;
      const outputFile = path.join(this.outputDir, `lighthouse-${page.replace(/\//g, '_')}-${Date.now()}.json`);
      const htmlFile = path.join(this.outputDir, `lighthouse-${page.replace(/\//g, '_')}-${Date.now()}.html`);

      try {
        console.log(`📊 Auditing: ${url}`);
        
        const { stdout } = await execAsync(
          `npx lighthouse ${url} --output=json,html --output-path=${outputFile.replace('.json', '')} --chrome-flags="--headless --no-sandbox"`
        );

        if (fs.existsSync(outputFile)) {
          const report = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
          const scores = {
            performance: Math.round(report.categories.performance.score * 100),
            accessibility: Math.round(report.categories.accessibility.score * 100),
            bestPractices: Math.round(report.categories['best-practices'].score * 100),
            seo: Math.round(report.categories.seo.score * 100),
            pwa: Math.round(report.categories.pwa.score * 100)
          };

          results[page] = {
            scores,
            passed: this.checkLighthouseThresholds(scores),
            reportFile: outputFile,
            htmlFile: htmlFile,
            url
          };

          console.log(`✅ ${page}:`, scores);
        }
      } catch (error) {
        console.error(`❌ Failed to audit ${page}:`, error.message);
        results[page] = { error: error.message, url };
      }
    }

    return results;
  }

  checkLighthouseThresholds(scores) {
    const failed = [];
    
    for (const [category, threshold] of Object.entries(this.thresholds.lighthouse)) {
      if (scores[category] < threshold) {
        failed.push(`${category}: ${scores[category]} < ${threshold}`);
      }
    }

    return {
      passed: failed.length === 0,
      failures: failed
    };
  }

  async runLoadTest(options = {}) {
    console.log('⚡ Running load test...');

    const config = {
      target: this.baseUrl,
      phases: [
        { duration: 60, arrivalRate: 10 },  // Warm up: 10 RPS for 1 minute
        { duration: 120, arrivalRate: 25 }, // Ramp up: 25 RPS for 2 minutes
        { duration: 300, arrivalRate: 50 }, // Load test: 50 RPS for 5 minutes
        { duration: 60, arrivalRate: 10 },  // Cool down: 10 RPS for 1 minute
      ],
      scenarios: [
        {
          name: 'Health Check',
          weight: 30,
          flow: [
            { get: { url: '/api/health' } }
          ]
        },
        {
          name: 'Home Page',
          weight: 40,
          flow: [
            { get: { url: '/' } }
          ]
        },
        {
          name: 'API Status',
          weight: 30,
          flow: [
            { get: { url: '/api/status' } }
          ]
        }
      ],
      ...options
    };

    const configFile = path.join(this.outputDir, 'load-test-config.yml');
    const reportFile = path.join(this.outputDir, `load-test-${Date.now()}.json`);

    // Write Artillery config
    fs.writeFileSync(configFile, `
config:
  target: '${config.target}'
  phases:
${config.phases.map(phase => `    - duration: ${phase.duration}\n      arrivalRate: ${phase.arrivalRate}`).join('\n')}
  processor: ./load-test-processor.js

scenarios:
${config.scenarios.map(scenario => `
  - name: '${scenario.name}'
    weight: ${scenario.weight}
    flow:
${scenario.flow.map(step => {
  if (step.get) {
    return `      - get:\n          url: '${step.get.url}'`;
  }
  return '';
}).join('\n')}
`).join('')}
`.trim());

    // Create processor for custom metrics
    const processorFile = path.join(this.outputDir, 'load-test-processor.js');
    fs.writeFileSync(processorFile, `
module.exports = {
  setCustomData: function(requestParams, context, ee, next) {
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['X-Load-Test'] = 'true';
    return next();
  },
  
  logResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.log('Error response:', response.statusCode, requestParams.url);
    }
    return next();
  }
};
`);

    try {
      console.log('🎯 Starting load test (this may take ~8 minutes)...');
      
      const { stdout } = await execAsync(
        `npx artillery run ${configFile} --output ${reportFile}`
      );

      if (fs.existsSync(reportFile)) {
        const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        const analysis = this.analyzeLoadTestResults(report);
        
        console.log('📈 Load Test Results:');
        console.log(`   Total Requests: ${analysis.totalRequests}`);
        console.log(`   Success Rate: ${analysis.successRate.toFixed(2)}%`);
        console.log(`   Avg Response Time: ${analysis.avgResponseTime.toFixed(2)}ms`);
        console.log(`   P95 Response Time: ${analysis.p95ResponseTime.toFixed(2)}ms`);
        console.log(`   RPS: ${analysis.rps.toFixed(2)}`);

        return {
          ...analysis,
          passed: this.checkLoadTestThresholds(analysis),
          reportFile,
          configFile
        };
      }
    } catch (error) {
      console.error('❌ Load test failed:', error.message);
      return { error: error.message };
    }
  }

  analyzeLoadTestResults(report) {
    const aggregate = report.aggregate;
    
    return {
      totalRequests: aggregate.counters['http.requests'],
      successfulRequests: aggregate.counters['http.requests'] - (aggregate.counters['http.request_rate'] || 0),
      successRate: ((aggregate.counters['http.requests'] - (aggregate.counters['http.request_rate'] || 0)) / aggregate.counters['http.requests']) * 100,
      avgResponseTime: aggregate.latency?.mean || 0,
      p95ResponseTime: aggregate.latency?.p95 || 0,
      p99ResponseTime: aggregate.latency?.p99 || 0,
      rps: aggregate.rates['http.request_rate']?.mean || 0,
      errors: aggregate.counters.errors || 0,
      codes: aggregate.counters.codes || {}
    };
  }

  checkLoadTestThresholds(results) {
    const failed = [];
    
    if (results.avgResponseTime > this.thresholds.loadTest.maxResponseTime) {
      failed.push(`Average response time: ${results.avgResponseTime.toFixed(2)}ms > ${this.thresholds.loadTest.maxResponseTime}ms`);
    }
    
    const errorRate = (results.errors / results.totalRequests);
    if (errorRate > this.thresholds.loadTest.maxErrorRate) {
      failed.push(`Error rate: ${(errorRate * 100).toFixed(2)}% > ${(this.thresholds.loadTest.maxErrorRate * 100)}%`);
    }
    
    if (results.rps < this.thresholds.loadTest.minRps) {
      failed.push(`RPS: ${results.rps.toFixed(2)} < ${this.thresholds.loadTest.minRps}`);
    }

    return {
      passed: failed.length === 0,
      failures: failed
    };
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');

    try {
      // Build the application
      await execAsync('npm run build');
      
      const buildDir = path.join(process.cwd(), '.next');
      const analysisFile = path.join(this.outputDir, `bundle-analysis-${Date.now()}.json`);

      // Use Next.js bundle analyzer
      const { stdout } = await execAsync('npx next-bundle-analyzer');
      
      // Get build statistics
      const stats = this.getBuildStats(buildDir);
      
      fs.writeFileSync(analysisFile, JSON.stringify(stats, null, 2));
      
      console.log('📊 Bundle Analysis:');
      console.log(`   Total Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
      console.log(`   JavaScript: ${(stats.jsSize / 1024).toFixed(2)} KB`);
      console.log(`   CSS: ${(stats.cssSize / 1024).toFixed(2)} KB`);
      console.log(`   Pages: ${stats.pageCount}`);

      return {
        ...stats,
        passed: stats.totalSize < 250000, // 250KB threshold
        analysisFile
      };
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      return { error: error.message };
    }
  }

  getBuildStats(buildDir) {
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let pageCount = 0;

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          const size = stat.size;
          totalSize += size;
          
          if (file.endsWith('.js')) {
            jsSize += size;
          } else if (file.endsWith('.css')) {
            cssSize += size;
          }
          
          if (file.includes('pages') && file.endsWith('.js')) {
            pageCount++;
          }
        }
      }
    };

    if (fs.existsSync(buildDir)) {
      walkDir(buildDir);
    }

    return { totalSize, jsSize, cssSize, pageCount };
  }

  async generateReport(results) {
    const reportFile = path.join(this.outputDir, `performance-report-${Date.now()}.html`);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 AIRWAVE Performance Test Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Base URL: ${this.baseUrl}</p>
    </div>

    ${results.lighthouse ? this.generateLighthouseSection(results.lighthouse) : ''}
    ${results.loadTest ? this.generateLoadTestSection(results.loadTest) : ''}
    ${results.bundleAnalysis ? this.generateBundleSection(results.bundleAnalysis) : ''}

    <div class="section">
        <h2>📋 Summary</h2>
        <ul>
            <li>Lighthouse: ${results.lighthouse?.overall ? (results.lighthouse.overall ? '✅ PASSED' : '❌ FAILED') : '⏭️ SKIPPED'}</li>
            <li>Load Test: ${results.loadTest?.passed ? (results.loadTest.passed.passed ? '✅ PASSED' : '❌ FAILED') : '⏭️ SKIPPED'}</li>
            <li>Bundle Analysis: ${results.bundleAnalysis?.passed ? '✅ PASSED' : results.bundleAnalysis?.error ? '❌ FAILED' : '⏭️ SKIPPED'}</li>
        </ul>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(reportFile, html);
    console.log(`📄 Report generated: ${reportFile}`);
    
    return reportFile;
  }

  generateLighthouseSection(lighthouse) {
    return `
    <div class="section">
        <h2>💡 Lighthouse Audit Results</h2>
        <table>
            <thead>
                <tr><th>Page</th><th>Performance</th><th>Accessibility</th><th>Best Practices</th><th>SEO</th><th>PWA</th><th>Status</th></tr>
            </thead>
            <tbody>
                ${Object.entries(lighthouse).map(([page, result]) => {
                  if (result.error) {
                    return `<tr><td>${page}</td><td colspan="6" class="error">Error: ${result.error}</td></tr>`;
                  }
                  const status = result.passed.passed ? 'success' : 'error';
                  return `
                    <tr>
                        <td>${page}</td>
                        <td>${result.scores.performance}</td>
                        <td>${result.scores.accessibility}</td>
                        <td>${result.scores.bestPractices}</td>
                        <td>${result.scores.seo}</td>
                        <td>${result.scores.pwa}</td>
                        <td class="${status}">${result.passed.passed ? '✅ PASSED' : '❌ FAILED'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>
    `;
  }

  generateLoadTestSection(loadTest) {
    if (loadTest.error) {
      return `<div class="section"><h2>⚡ Load Test Results</h2><p class="error">Error: ${loadTest.error}</p></div>`;
    }

    const status = loadTest.passed.passed ? 'success' : 'error';
    return `
    <div class="section">
        <h2>⚡ Load Test Results</h2>
        <div class="${status}">Status: ${loadTest.passed.passed ? '✅ PASSED' : '❌ FAILED'}</div>
        ${!loadTest.passed.passed ? `<div class="error">Failures: ${loadTest.passed.failures.join(', ')}</div>` : ''}
        <table>
            <tr><td>Total Requests</td><td>${loadTest.totalRequests}</td></tr>
            <tr><td>Success Rate</td><td>${loadTest.successRate.toFixed(2)}%</td></tr>
            <tr><td>Average Response Time</td><td>${loadTest.avgResponseTime.toFixed(2)}ms</td></tr>
            <tr><td>P95 Response Time</td><td>${loadTest.p95ResponseTime.toFixed(2)}ms</td></tr>
            <tr><td>Requests per Second</td><td>${loadTest.rps.toFixed(2)}</td></tr>
        </table>
    </div>
    `;
  }

  generateBundleSection(bundle) {
    if (bundle.error) {
      return `<div class="section"><h2>📦 Bundle Analysis</h2><p class="error">Error: ${bundle.error}</p></div>`;
    }

    const status = bundle.passed ? 'success' : 'warning';
    return `
    <div class="section">
        <h2>📦 Bundle Analysis</h2>
        <div class="${status}">Size Check: ${bundle.passed ? '✅ PASSED' : '⚠️ WARNING'}</div>
        <table>
            <tr><td>Total Size</td><td>${(bundle.totalSize / 1024).toFixed(2)} KB</td></tr>
            <tr><td>JavaScript</td><td>${(bundle.jsSize / 1024).toFixed(2)} KB</td></tr>
            <tr><td>CSS</td><td>${(bundle.cssSize / 1024).toFixed(2)} KB</td></tr>
            <tr><td>Page Count</td><td>${bundle.pageCount}</td></tr>
        </table>
    </div>
    `;
  }

  async runFullSuite(options = {}) {
    console.log('🚀 Starting full performance test suite...\n');
    
    await this.setup();
    
    const results = {};
    
    // Run Lighthouse audits
    if (!options.skipLighthouse) {
      results.lighthouse = await this.runLighthouseAudit(options.pages || ['/']);
      results.lighthouse.overall = Object.values(results.lighthouse).every(r => !r.error && r.passed?.passed);
    }
    
    // Run load test
    if (!options.skipLoadTest) {
      results.loadTest = await this.runLoadTest(options.loadTestConfig);
    }
    
    // Analyze bundle
    if (!options.skipBundle) {
      results.bundleAnalysis = await this.analyzeBundleSize();
    }
    
    // Generate report
    const reportFile = await this.generateReport(results);
    
    console.log('\n🎉 Performance testing completed!');
    console.log(`📄 Full report: ${reportFile}`);
    
    return results;
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
      case '--skip-lighthouse':
        options.skipLighthouse = true;
        break;
      case '--skip-load-test':
        options.skipLoadTest = true;
        break;
      case '--skip-bundle':
        options.skipBundle = true;
        break;
      case '--pages':
        options.pages = args[++i].split(',');
        break;
    }
  }
  
  const tester = new PerformanceTester(options);
  tester.runFullSuite(options).catch(console.error);
}

module.exports = { PerformanceTester };
