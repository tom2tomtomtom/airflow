#!/usr/bin/env node

/**
 * Load Test Runner Script
 * Orchestrates comprehensive load testing for AIRFLOW
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const LOAD_TEST_DIR = path.join(__dirname, '..', 'load-tests');
const RESULTS_DIR = path.join(LOAD_TEST_DIR, 'results');
const SCENARIOS_DIR = path.join(LOAD_TEST_DIR, 'scenarios');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test scenarios configuration
const TEST_SCENARIOS = {
  'database-optimization': {
    file: 'database-optimization.js',
    description: 'Validate database query optimizations and N+1 fixes',
    duration: '4m',
    priority: 'high',
    env: {
      TEST_TYPE: 'mixed'
    }
  },
  
  'api-performance': {
    file: 'api-performance.js', 
    description: 'Comprehensive API endpoint performance testing',
    duration: '9m',
    priority: 'high',
    env: {
      TEST_TYPE: 'normal'
    }
  },
  
  'endurance': {
    file: 'endurance-test.js',
    description: 'Long-running stability and memory leak detection',
    duration: '20m',
    priority: 'medium',
    env: {
      TEST_TYPE: 'endurance'
    }
  },
};

// Environment configuration
const DEFAULT_ENV = {
  LOAD_TEST_BASE_URL: process.env.LOAD_TEST_BASE_URL || 'http://localhost:3000',
  LOAD_TEST_USER_TOKEN: process.env.LOAD_TEST_USER_TOKEN || 'test-token',
  LOAD_TEST_API_KEY: process.env.LOAD_TEST_API_KEY || 'test-api-key',
};

/**
 * Check if k6 is installed
 */
async function checkK6Installation() {
  try {
    await execAsync('k6 version');
    console.log('✅ k6 is installed and ready');
    return true;
  } catch (error) {
    console.error('❌ k6 is not installed or not in PATH');
    console.error('📦 Install k6 from: https://k6.io/docs/getting-started/installation/');
    console.error('   macOS: brew install k6');
    console.error('   Linux: sudo apt install k6');
    console.error('   Windows: choco install k6');
    return false;
  }
}

/**
 * Check if target application is running
 */
async function checkApplicationHealth() {
  const baseUrl = DEFAULT_ENV.LOAD_TEST_BASE_URL;
  console.log(`🔍 Checking application health at ${baseUrl}...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Application is running and healthy');
      return true;
    } else {
      console.warn(`⚠️  Application returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Cannot reach application at ${baseUrl}`);
    console.error('💡 Make sure the application is running with: npm run dev');
    return false;
  }
}

/**
 * Run a specific load test scenario
 */
async function runScenario(scenarioName, scenario, options = {}) {
  const { dryRun = false, verbose = false } = options;
  
  console.log(`\n🚀 Running ${scenarioName} load test...`);
  console.log(`📝 ${scenario.description}`);
  console.log(`⏱️  Expected duration: ${scenario.duration}`);
  
  if (dryRun) {
    console.log('🔍 Dry run mode - skipping actual test execution');
    return { success: true, dryRun: true };
  }
  
  const scenarioFile = path.join(SCENARIOS_DIR, scenario.file);
  const resultFile = path.join(RESULTS_DIR, `${scenarioName}-${Date.now()}.json`);
  
  if (!fs.existsSync(scenarioFile)) {
    console.error(`❌ Scenario file not found: ${scenarioFile}`);
    return { success: false, error: 'Scenario file not found' };
  }
  
  // Prepare environment variables
  const env = { ...process.env, ...DEFAULT_ENV, ...scenario.env };
  
  // Build k6 command
  const k6Args = [
    'run',
    '--out', `json=${resultFile}`,
  ];
  
  if (verbose) {
    k6Args.push('--verbose');
  }
  
  k6Args.push(scenarioFile);
  
  console.log(`📊 Results will be saved to: ${resultFile}`);
  console.log(`🎯 Command: k6 ${k6Args.join(' ')}`);
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const k6Process = spawn('k6', k6Args, {
      env,
      stdio: 'pipe'
    });
    
    let stdout = '';
    let stderr = '';
    
    k6Process.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      if (verbose) {
        process.stdout.write(output);
      } else {
        // Show progress indicators
        if (output.includes('running') || output.includes('iteration')) {
          process.stdout.write('.');
        }
      }
    });
    
    k6Process.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (verbose) {
        process.stderr.write(output);
      }
    });
    
    k6Process.on('close', (code) => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`\n⏱️  Test completed in ${duration.toFixed(1)}s`);
      
      if (code === 0) {
        console.log('✅ Test passed successfully');
        
        // Try to parse and display quick summary
        try {
          if (fs.existsSync(resultFile)) {
            const results = parseTestResults(resultFile);
            displayQuickSummary(scenarioName, results);
          }
        } catch (error) {
          console.warn('⚠️  Could not parse results for summary');
        }
        
        resolve({ 
          success: true, 
          duration, 
          resultFile,
          stdout,
          stderr 
        });
      } else {
        console.error(`❌ Test failed with exit code ${code}`);
        if (stderr) {
          console.error('Error output:', stderr);
        }
        resolve({ 
          success: false, 
          exitCode: code, 
          duration,
          stdout,
          stderr 
        });
      }
    });
    
    k6Process.on('error', (error) => {
      console.error(`🚨 Failed to start k6 process: ${error.message}`);
      resolve({ 
        success: false, 
        error: error.message 
      });
    });
  });
}

/**
 * Parse test results for quick summary
 */
function parseTestResults(resultFile) {
  try {
    const fileContent = fs.readFileSync(resultFile, 'utf8');
    const lines = fileContent.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    
    if (lastLine && lastLine.includes('"type":"Point"')) {
      return JSON.parse(lastLine);
    }
    
    // Try to find summary data
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.includes('"metric":"http_req_duration"')) {
        return JSON.parse(line);
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Display quick test summary
 */
function displayQuickSummary(scenarioName, results) {
  if (!results || !results.data) return;
  
  console.log(`\n📊 Quick Summary for ${scenarioName}:`);
  
  const { data } = results;
  if (data.value !== undefined) {
    console.log(`   Response Time: ${data.value.toFixed(2)}ms`);
  }
  
  if (data.tags) {
    console.log(`   Tags: ${JSON.stringify(data.tags)}`);
  }
}

/**
 * Run all scenarios or specific ones
 */
async function runTests(options = {}) {
  const { 
    scenarios = [],
    dryRun = false,
    verbose = false,
    skipChecks = false 
  } = options;
  
  console.log('🧪 AIRFLOW Load Testing Suite');
  console.log('============================\n');
  
  // Pre-flight checks
  if (!skipChecks) {
    console.log('🔍 Running pre-flight checks...');
    
    const k6Ready = await checkK6Installation();
    if (!k6Ready) {
      process.exit(1);
    }
    
    const appHealthy = await checkApplicationHealth();
    if (!appHealthy) {
      console.error('❌ Application health check failed');
      console.error('💡 Start the application or check LOAD_TEST_BASE_URL');
      process.exit(1);
    }
  }
  
  // Determine which scenarios to run
  const scenariosToRun = scenarios.length > 0 
    ? scenarios.filter(name => TEST_SCENARIOS[name])
    : Object.keys(TEST_SCENARIOS);
  
  if (scenariosToRun.length === 0) {
    console.error('❌ No valid scenarios to run');
    console.error('Available scenarios:', Object.keys(TEST_SCENARIOS).join(', '));
    process.exit(1);
  }
  
  console.log(`🎯 Running ${scenariosToRun.length} scenario(s):`);
  scenariosToRun.forEach(name => {
    console.log(`   • ${name}: ${TEST_SCENARIOS[name].description}`);
  });
  
  // Run scenarios
  const results = [];
  let totalDuration = 0;
  
  for (const scenarioName of scenariosToRun) {
    const scenario = TEST_SCENARIOS[scenarioName];
    const result = await runScenario(scenarioName, scenario, { dryRun, verbose });
    
    results.push({
      scenario: scenarioName,
      ...result
    });
    
    if (result.duration) {
      totalDuration += result.duration;
    }
    
    // Brief pause between scenarios
    if (!dryRun && scenariosToRun.indexOf(scenarioName) < scenariosToRun.length - 1) {
      console.log('\n⏸️  Pausing 10 seconds between scenarios...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  // Summary report
  console.log('\n📋 Load Testing Summary');
  console.log('======================');
  console.log(`⏱️  Total duration: ${totalDuration.toFixed(1)}s`);
  console.log(`📊 Scenarios run: ${results.length}`);
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed scenarios:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.scenario}: ${r.error || 'Unknown error'}`);
    });
  }
  
  // Generate consolidated report
  if (!dryRun) {
    generateConsolidatedReport(results);
  }
  
  return results;
}

/**
 * Generate consolidated test report
 */
function generateConsolidatedReport(results) {
  const reportFile = path.join(RESULTS_DIR, `load-test-report-${Date.now()}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      baseUrl: DEFAULT_ENV.LOAD_TEST_BASE_URL,
      nodeVersion: process.version,
    },
    summary: {
      totalScenarios: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
    },
    scenarios: results,
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Consolidated report saved: ${reportFile}`);
}

/**
 * Main CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Load Test Runner for AIRFLOW

Usage: node run-load-tests.js [options] [scenarios...]

Scenarios:
  database-optimization  Validate database query optimizations
  api-performance       Comprehensive API performance testing  
  endurance            Long-running stability testing

Options:
  --dry-run            Show what would be run without executing
  --verbose            Show detailed k6 output
  --skip-checks        Skip pre-flight health checks
  --help, -h           Show this help message

Examples:
  node run-load-tests.js                           # Run all scenarios
  node run-load-tests.js database-optimization     # Run specific scenario
  node run-load-tests.js --dry-run                 # Preview without running
  node run-load-tests.js --verbose api-performance # Detailed output

Environment Variables:
  LOAD_TEST_BASE_URL    Target application URL (default: http://localhost:3000)
  LOAD_TEST_USER_TOKEN  Authentication token for tests
  LOAD_TEST_API_KEY     API key for authenticated endpoints
    `);
    return;
  }
  
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    skipChecks: args.includes('--skip-checks'),
    scenarios: args.filter(arg => !arg.startsWith('--')),
  };
  
  try {
    const results = await runTests(options);
    
    const failed = results.filter(r => !r.success).length;
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('🚨 Load testing failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, runScenario, TEST_SCENARIOS };