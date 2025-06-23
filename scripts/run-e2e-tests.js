#!/usr/bin/env node

/**
 * Enhanced E2E Test Runner for AIRWAVE
 * Provides intelligent test suite selection and execution
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test suite configurations
const TEST_SUITES = {
  smoke: {
    name: 'Smoke Tests',
    description: 'Quick validation that core features work',
    tests: ['tests/e2e/auth-flow-integrated.spec.ts', 'tests/e2e/simple-navigation-test.spec.ts'],
    timeout: 300000, // 5 minutes
    projects: ['chromium-functional'],
  },

  auth: {
    name: 'Authentication Tests',
    description: 'Comprehensive authentication flow testing',
    tests: ['tests/e2e/auth-flow-integrated.spec.ts'],
    timeout: 600000, // 10 minutes
    projects: ['chromium-functional', 'firefox-functional', 'mobile-chrome'],
  },

  workflow: {
    name: 'Workflow Tests',
    description: 'Complete user workflow testing',
    tests: [
      'tests/e2e/complete-user-workflow.spec.ts',
      'tests/e2e/flow-complete-workflow.spec.ts',
      'tests/e2e/flow-workflow-detailed.spec.ts',
    ],
    timeout: 1200000, // 20 minutes
    projects: ['chromium-functional'],
  },

  assets: {
    name: 'Asset Management Tests',
    description: 'Asset upload, management, and organization',
    tests: ['tests/e2e/asset-management-integrated.spec.ts'],
    timeout: 900000, // 15 minutes
    projects: ['chromium-functional', 'webkit-functional'],
  },

  ui: {
    name: 'UI/UX Tests',
    description: 'User interface and experience validation',
    tests: ['tests/e2e/comprehensive-ui-flow.spec.ts', 'tests/e2e/flow-ui-inspection.spec.ts'],
    timeout: 600000, // 10 minutes
    projects: ['chromium-functional'],
  },

  performance: {
    name: 'Performance Tests',
    description: 'Performance and load testing',
    tests: ['tests/e2e/performance-accessibility.spec.ts'],
    timeout: 1800000, // 30 minutes
    projects: ['performance'],
  },

  accessibility: {
    name: 'Accessibility Tests',
    description: 'Accessibility and inclusive design validation',
    tests: ['tests/e2e/performance-accessibility.spec.ts'],
    timeout: 900000, // 15 minutes
    projects: ['accessibility'],
  },

  crossBrowser: {
    name: 'Cross-Browser Tests',
    description: 'Cross-browser compatibility testing',
    tests: [
      'tests/e2e/auth-flow-integrated.spec.ts',
      'tests/e2e/asset-management-integrated.spec.ts',
    ],
    timeout: 1200000, // 20 minutes
    projects: ['chromium-functional', 'firefox-functional', 'webkit-functional'],
  },

  mobile: {
    name: 'Mobile Tests',
    description: 'Mobile and responsive design testing',
    tests: ['tests/e2e/auth-flow-integrated.spec.ts', 'tests/e2e/comprehensive-ui-flow.spec.ts'],
    timeout: 900000, // 15 minutes
    projects: ['mobile-chrome', 'mobile-safari', 'tablet'],
  },

  visual: {
    name: 'Visual Regression Tests',
    description: 'Visual regression and screenshot comparison',
    tests: ['tests/e2e/comprehensive-ui-flow.spec.ts'],
    timeout: 600000, // 10 minutes
    projects: ['visual'],
  },

  comprehensive: {
    name: 'Comprehensive Test Suite',
    description: 'Complete test coverage across all areas',
    tests: [
      'tests/e2e/auth-flow-integrated.spec.ts',
      'tests/e2e/complete-user-workflow.spec.ts',
      'tests/e2e/asset-management-integrated.spec.ts',
      'tests/e2e/comprehensive-ui-flow.spec.ts',
      'tests/e2e/performance-accessibility.spec.ts',
    ],
    timeout: 3600000, // 60 minutes
    projects: [
      'chromium-functional',
      'firefox-functional',
      'mobile-chrome',
      'performance',
      'accessibility',
    ],
  },

  debug: {
    name: 'Debug Suite',
    description: 'Debug-friendly test execution',
    tests: ['tests/e2e/brief-workflow-debug.spec.ts', 'tests/e2e/flow-simple-analysis.spec.ts'],
    timeout: 1800000, // 30 minutes (long for debugging)
    projects: ['chromium-functional'],
    headed: true,
    debug: true,
  },
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suite: 'smoke',
    config: 'playwright.config.enhanced.ts',
    headed: false,
    debug: false,
    project: null,
    grep: null,
    workers: null,
    maxFailures: null,
    reporter: null,
    updateSnapshots: false,
    verbose: false,
    dryRun: false,
    ci: process.env.CI === 'true',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--suite':
      case '-s':
        options.suite = args[++i];
        break;
      case '--config':
      case '-c':
        options.config = args[++i];
        break;
      case '--headed':
        options.headed = true;
        break;
      case '--debug':
        options.debug = true;
        options.headed = true;
        break;
      case '--project':
      case '-p':
        options.project = args[++i];
        break;
      case '--grep':
      case '-g':
        options.grep = args[++i];
        break;
      case '--workers':
      case '-w':
        options.workers = parseInt(args[++i]);
        break;
      case '--max-failures':
        options.maxFailures = parseInt(args[++i]);
        break;
      case '--reporter':
      case '-r':
        options.reporter = args[++i];
        break;
      case '--update-snapshots':
      case '-u':
        options.updateSnapshots = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      case '--list-suites':
        listSuites();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.warn(`⚠️ Unknown option: ${arg}`);
        }
        break;
    }
  }

  return options;
}

// Show help information
function showHelp() {
  console.log(`
🎭 AIRWAVE E2E Test Runner

Usage: node scripts/run-e2e-tests.js [options]

Options:
  -s, --suite <name>        Test suite to run (default: smoke)
  -c, --config <file>       Playwright config file (default: playwright.config.enhanced.ts)
  --headed                  Run tests in headed mode
  --debug                   Run tests in debug mode (implies --headed)
  -p, --project <name>      Run specific project only
  -g, --grep <pattern>      Run tests matching pattern
  -w, --workers <num>       Number of worker processes
  --max-failures <num>      Maximum number of failures before stopping
  -r, --reporter <name>     Reporter to use
  -u, --update-snapshots    Update visual snapshots
  -v, --verbose             Verbose output
  --dry-run                 Show what would be executed without running
  --list-suites             List available test suites
  -h, --help                Show this help

Available Test Suites:
${Object.entries(TEST_SUITES)
  .map(([key, suite]) => `  ${key.padEnd(15)} ${suite.description}`)
  .join('\n')}

Examples:
  node scripts/run-e2e-tests.js --suite auth --headed
  node scripts/run-e2e-tests.js --suite workflow --project chromium-functional
  node scripts/run-e2e-tests.js --suite debug --debug
  node scripts/run-e2e-tests.js --suite comprehensive --max-failures 3
`);
}

// List available test suites
function listSuites() {
  console.log('\n📋 Available Test Suites:\n');

  Object.entries(TEST_SUITES).forEach(([key, suite]) => {
    console.log(`🔹 ${key}`);
    console.log(`   Name: ${suite.name}`);
    console.log(`   Description: ${suite.description}`);
    console.log(`   Tests: ${suite.tests.length} files`);
    console.log(`   Projects: ${suite.projects.join(', ')}`);
    console.log(`   Timeout: ${suite.timeout / 60000} minutes`);
    console.log('');
  });
}

// Validate environment
function validateEnvironment() {
  console.log('🔍 Validating environment...');

  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    console.log('✅ Playwright is installed');
  } catch (error) {
    console.error('❌ Playwright is not installed. Run: npm install @playwright/test');
    process.exit(1);
  }

  // Check if browsers are installed
  try {
    execSync('npx playwright install --dry-run', { stdio: 'pipe' });
    console.log('✅ Playwright browsers are installed');
  } catch (error) {
    console.warn('⚠️ Some browsers may not be installed. Run: npx playwright install');
  }

  // Check if development server can be started
  if (!process.env.CI) {
    console.log('✅ Environment validation completed');
  }
}

// Build Playwright command
function buildPlaywrightCommand(options) {
  const suite = TEST_SUITES[options.suite];
  if (!suite) {
    console.error(`❌ Unknown test suite: ${options.suite}`);
    console.log('Available suites:', Object.keys(TEST_SUITES).join(', '));
    process.exit(1);
  }

  const args = ['npx', 'playwright', 'test'];

  // Add config
  args.push('--config', options.config);

  // Add test files
  suite.tests.forEach(test => args.push(test));

  // Add projects
  if (options.project) {
    args.push('--project', options.project);
  } else {
    suite.projects.forEach(project => {
      args.push('--project', project);
    });
  }

  // Add options
  if (options.headed || suite.headed) {
    args.push('--headed');
  }

  if (options.debug || suite.debug) {
    args.push('--debug');
  }

  if (options.grep) {
    args.push('--grep', options.grep);
  }

  if (options.workers !== null) {
    args.push('--workers', options.workers.toString());
  }

  if (options.maxFailures !== null) {
    args.push('--max-failures', options.maxFailures.toString());
  }

  if (options.reporter) {
    args.push('--reporter', options.reporter);
  }

  if (options.updateSnapshots) {
    args.push('--update-snapshots');
  }

  // Set timeout
  args.push('--timeout', suite.timeout.toString());

  // CI specific options
  if (options.ci) {
    args.push('--reporter=github');
    args.push('--forbid-only');
  }

  return args;
}

// Run pre-test checks
function runPreTestChecks() {
  console.log('🔧 Running pre-test checks...');

  // Check TypeScript compilation
  try {
    console.log('📝 Checking TypeScript compilation...');
    execSync('npm run type-check', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.warn('⚠️ TypeScript compilation has issues, but continuing with tests');
  }

  // Check if tests directory exists
  if (!fs.existsSync('tests/e2e')) {
    console.error('❌ E2E tests directory not found');
    process.exit(1);
  }

  console.log('✅ Pre-test checks completed');
}

// Run post-test actions
function runPostTestActions(success, options) {
  console.log('\n📊 Running post-test actions...');

  // Generate test report summary
  const resultsFile = 'test-results/results.json';
  if (fs.existsSync(resultsFile)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      console.log('\n📈 Test Results Summary:');
      console.log(`   Suite: ${options.suite}`);
      console.log(`   Total: ${results.stats?.total || 'N/A'}`);
      console.log(`   Passed: ${results.stats?.passed || 'N/A'}`);
      console.log(`   Failed: ${results.stats?.failed || 'N/A'}`);
      console.log(`   Duration: ${results.stats?.duration || 'N/A'}ms`);
    } catch (error) {
      console.log('ℹ️ Could not parse test results');
    }
  }

  // Show test artifacts location
  if (fs.existsSync('test-results')) {
    const files = fs.readdirSync('test-results');
    if (files.length > 0) {
      console.log(`\n📁 Test artifacts: test-results/ (${files.length} files)`);

      // Highlight important files
      if (files.includes('html-report')) {
        console.log('   📋 HTML Report: test-results/html-report/index.html');
      }
      if (files.some(f => f.includes('trace'))) {
        console.log('   🔍 Trace files available for debugging');
      }
    }
  }

  if (success) {
    console.log('\n🎉 All tests completed successfully!');
  } else {
    console.log('\n❌ Some tests failed. Check the results above.');
  }
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log(`🚀 Starting AIRWAVE E2E Test Suite: ${options.suite.toUpperCase()}`);
  console.log(`📋 Suite: ${TEST_SUITES[options.suite]?.name || options.suite}`);
  console.log(`⚙️ Config: ${options.config}`);

  if (options.dryRun) {
    console.log('\n🔍 DRY RUN - Command that would be executed:');
    const command = buildPlaywrightCommand(options);
    console.log(command.join(' '));
    return;
  }

  // Validate environment
  validateEnvironment();

  // Run pre-test checks
  runPreTestChecks();

  // Build and execute command
  const command = buildPlaywrightCommand(options);
  const [executable, ...args] = command;

  console.log('\n🎭 Executing Playwright tests...');
  if (options.verbose) {
    console.log('Command:', command.join(' '));
  }

  try {
    const child = spawn(executable.replace('npx', 'npx'), args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '0',
      },
    });

    const exitCode = await new Promise(resolve => {
      child.on('close', resolve);
    });

    const success = exitCode === 0;
    runPostTestActions(success, options);

    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Failed to execute tests:', error.message);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  TEST_SUITES,
  parseArgs,
  buildPlaywrightCommand,
  main,
};
