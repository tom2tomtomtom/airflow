#!/usr/bin/env node

/**
 * Comprehensive Test Runner for AIrWAVE Platform
 * Orchestrates the complete testing suite with proper setup and reporting
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ComprehensiveTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.testResults = {};
    this.outputDir = 'test-results';
    this.configFile = 'playwright.config.comprehensive-enhanced.ts';
    
    // Ensure output directory exists
    this.ensureOutputDir();
    
    // Parse command line arguments
    this.parseArguments();
  }

  parseArguments() {
    const args = process.argv.slice(2);
    this.options = {
      suite: 'all', // all, functional, performance, accessibility, mobile, cross-browser
      browsers: [], // specific browsers to test
      headed: false,
      debug: false,
      ui: false,
      parallel: true,
      retries: process.env.CI ? 2 : 0,
      workers: process.env.CI ? 2 : undefined,
      timeout: 120000, // 2 minutes
      grep: undefined,
      project: undefined,
      baseUrl: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--suite':
          this.options.suite = args[++i];
          break;
        case '--browsers':
          this.options.browsers = args[++i].split(',');
          break;
        case '--headed':
          this.options.headed = true;
          break;
        case '--debug':
          this.options.debug = true;
          this.options.headed = true;
          this.options.parallel = false;
          this.options.workers = 1;
          break;
        case '--ui':
          this.options.ui = true;
          break;
        case '--no-parallel':
          this.options.parallel = false;
          break;
        case '--retries':
          this.options.retries = parseInt(args[++i]);
          break;
        case '--workers':
          this.options.workers = parseInt(args[++i]);
          break;
        case '--timeout':
          this.options.timeout = parseInt(args[++i]);
          break;
        case '--grep':
          this.options.grep = args[++i];
          break;
        case '--project':
          this.options.project = args[++i];
          break;
        case '--base-url':
          this.options.baseUrl = args[++i];
          break;
        case '--help':
          this.showHelp();
          process.exit(0);
          break;
      }
    }
  }

  showHelp() {
    console.log(`
AIrWAVE Comprehensive Test Runner

Usage: node scripts/run-comprehensive-tests.js [options]

Options:
  --suite <type>        Test suite to run (all, functional, performance, accessibility, mobile, cross-browser)
  --browsers <list>     Comma-separated list of browsers (chrome, firefox, safari)
  --headed              Run tests in headed mode
  --debug               Run tests in debug mode (headed, no parallel, single worker)
  --ui                  Run tests with Playwright UI
  --no-parallel         Disable parallel execution
  --retries <number>    Number of retries for failed tests
  --workers <number>    Number of worker processes
  --timeout <ms>        Test timeout in milliseconds
  --grep <pattern>      Only run tests matching pattern
  --project <name>      Run specific project only
  --base-url <url>      Base URL for testing
  --help                Show this help message

Examples:
  # Run all tests
  node scripts/run-comprehensive-tests.js

  # Run only performance tests
  node scripts/run-comprehensive-tests.js --suite performance

  # Run cross-browser tests on Chrome and Firefox
  node scripts/run-comprehensive-tests.js --suite cross-browser --browsers chrome,firefox

  # Debug specific test
  node scripts/run-comprehensive-tests.js --debug --grep "login workflow"

  # Run mobile tests
  node scripts/run-comprehensive-tests.js --suite mobile

Test Suites:
  all              - Complete test suite (functional + performance + accessibility + mobile + cross-browser)
  functional       - Core functional tests across main browsers
  performance      - Performance benchmarking and optimization tests
  accessibility    - WCAG compliance and accessibility testing
  mobile           - Mobile device and responsive design testing
  cross-browser    - Cross-browser compatibility testing
`);
  }

  ensureOutputDir() {
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'html-report'),
      path.join(this.outputDir, 'performance'),
      path.join(this.outputDir, 'accessibility'),
      path.join(this.outputDir, 'artifacts')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async run() {
    console.log('🚀 Starting AIrWAVE Comprehensive Testing Suite');
    console.log(`📋 Suite: ${this.options.suite}`);
    console.log(`🌐 Base URL: ${this.options.baseUrl}`);
    console.log(`⚙️  Workers: ${this.options.workers || 'auto'}`);
    console.log(`🔄 Retries: ${this.options.retries}`);
    console.log(`⏱️  Timeout: ${this.options.timeout}ms`);
    console.log('');

    try {
      // Pre-flight checks
      await this.preflightChecks();
      
      // Run the appropriate test suite
      await this.runTestSuite();
      
      // Generate comprehensive report
      await this.generateReport();
      
      // Show final summary
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }

  async preflightChecks() {
    console.log('🔍 Running pre-flight checks...');
    
    // Check if Playwright is installed
    try {
      await this.execCommand('npx playwright --version');
    } catch (error) {
      throw new Error('Playwright not found. Run: npm install @playwright/test');
    }
    
    // Check if browsers are installed
    try {
      await this.execCommand('npx playwright install --dry-run');
    } catch (error) {
      console.log('📦 Installing browsers...');
      await this.execCommand('npx playwright install');
    }
    
    // Check if server is running
    try {
      const response = await fetch(this.options.baseUrl);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️  Warning: Test server may not be running');
      console.log(`   Make sure your application is running at ${this.options.baseUrl}`);
      console.log('   You can start it with: npm run dev');
    }
    
    console.log('✅ Pre-flight checks complete\n');
  }

  async runTestSuite() {
    const suiteConfig = this.getTestSuiteConfig();
    
    console.log(`🧪 Running ${this.options.suite} test suite...`);
    console.log(`📁 Projects: ${suiteConfig.projects.join(', ')}`);
    console.log(`📄 Test patterns: ${suiteConfig.testMatch.join(', ')}`);
    console.log('');

    const playwrightArgs = this.buildPlaywrightArgs(suiteConfig);
    
    try {
      const result = await this.execCommand(`npx playwright test ${playwrightArgs.join(' ')}`);
      this.testResults.exitCode = 0;
      this.testResults.output = result;
    } catch (error) {
      this.testResults.exitCode = error.code || 1;
      this.testResults.output = error.stdout || error.message;
      
      // Don't throw here - we want to generate reports even for failed tests
      console.log('⚠️  Some tests failed, but continuing to generate reports...');
    }
  }

  getTestSuiteConfig() {
    const configs = {
      all: {
        projects: ['chrome-functional', 'firefox-functional', 'safari-functional', 'mobile-chrome', 'performance', 'accessibility'],
        testMatch: ['**/*.spec.ts']
      },
      functional: {
        projects: ['chrome-functional', 'firefox-functional'],
        testMatch: ['**/e2e/**/*.spec.ts']
      },
      performance: {
        projects: ['performance'],
        testMatch: ['**/*performance*.spec.ts', '**/*perf*.spec.ts']
      },
      accessibility: {
        projects: ['accessibility'],
        testMatch: ['**/*accessibility*.spec.ts', '**/*a11y*.spec.ts']
      },
      mobile: {
        projects: ['mobile-chrome', 'mobile-safari', 'tablet'],
        testMatch: ['**/e2e/**/*.spec.ts', '**/*mobile*.spec.ts']
      },
      'cross-browser': {
        projects: ['chrome-functional', 'firefox-functional', 'safari-functional'],
        testMatch: ['**/complete-user-workflow.spec.ts', '**/auth-flow-integrated.spec.ts']
      }
    };

    return configs[this.options.suite] || configs.all;
  }

  buildPlaywrightArgs(suiteConfig) {
    const args = [
      '--config', this.configFile,
      '--output-dir', this.outputDir
    ];

    // Add projects
    if (this.options.project) {
      args.push('--project', this.options.project);
    } else if (suiteConfig.projects.length > 0) {
      for (const project of suiteConfig.projects) {
        args.push('--project', project);
      }
    }

    // Add test patterns
    if (suiteConfig.testMatch.length > 0) {
      args.push(...suiteConfig.testMatch);
    }

    // Add options
    if (this.options.headed) args.push('--headed');
    if (this.options.debug) args.push('--debug');
    if (this.options.ui) args.push('--ui');
    if (!this.options.parallel) args.push('--workers', '1');
    if (this.options.workers && this.options.parallel) args.push('--workers', this.options.workers.toString());
    if (this.options.retries) args.push('--retries', this.options.retries.toString());
    if (this.options.grep) args.push('--grep', this.options.grep);

    // Add timeout
    args.push('--timeout', this.options.timeout.toString());

    // Add environment variables
    const env = {
      PLAYWRIGHT_TEST_BASE_URL: this.options.baseUrl,
      NODE_ENV: 'test'
    };

    // Set environment variables
    Object.assign(process.env, env);

    return args;
  }

  async generateReport() {
    console.log('\n📊 Generating comprehensive test report...');
    
    try {
      // Generate HTML report
      await this.execCommand('npx playwright show-report --host 0.0.0.0');
      
      // Create summary report
      await this.createSummaryReport();
      
      console.log('✅ Reports generated successfully');
      console.log(`📁 HTML Report: ${path.join(this.outputDir, 'html-report', 'index.html')}`);
      console.log(`📁 Summary Report: ${path.join(this.outputDir, 'summary-report.json')}`);
      
    } catch (error) {
      console.log('⚠️  Warning: Could not generate all reports:', error.message);
    }
  }

  async createSummaryReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const summary = {
      suite: this.options.suite,
      duration: {
        total: duration,
        formatted: this.formatDuration(duration)
      },
      timestamp: new Date().toISOString(),
      environment: {
        os: `${os.type()} ${os.release()}`,
        node: process.version,
        baseUrl: this.options.baseUrl,
        workers: this.options.workers,
        retries: this.options.retries,
        timeout: this.options.timeout
      },
      results: {
        exitCode: this.testResults.exitCode,
        success: this.testResults.exitCode === 0
      },
      reports: {
        html: path.join(this.outputDir, 'html-report', 'index.html'),
        performance: path.join(this.outputDir, 'performance', 'performance-report.json'),
        accessibility: path.join(this.outputDir, 'accessibility', 'accessibility-report.json'),
        junit: path.join(this.outputDir, 'junit.xml'),
        json: path.join(this.outputDir, 'results.json')
      }
    };

    // Try to read detailed results if available
    try {
      const resultsPath = path.join(this.outputDir, 'results.json');
      if (fs.existsSync(resultsPath)) {
        const detailedResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        summary.detailed = {
          stats: detailedResults.stats,
          suites: detailedResults.suites?.length || 0,
          tests: detailedResults.stats?.total || 0,
          passed: detailedResults.stats?.passed || 0,
          failed: detailedResults.stats?.failed || 0,
          skipped: detailedResults.stats?.skipped || 0
        };
      }
    } catch (error) {
      // Ignore if we can't read detailed results
    }

    const summaryPath = path.join(this.outputDir, 'summary-report.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  showSummary() {
    const duration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`🧪 Suite: ${this.options.suite}`);
    console.log(`⏱️  Duration: ${this.formatDuration(duration)}`);
    console.log(`🌐 Base URL: ${this.options.baseUrl}`);
    console.log(`📁 Results: ${this.outputDir}/`);
    
    if (this.testResults.exitCode === 0) {
      console.log('✅ Result: ALL TESTS PASSED');
    } else {
      console.log('❌ Result: SOME TESTS FAILED');
    }
    
    console.log('\n📊 Available Reports:');
    console.log(`   • HTML Report: ${this.outputDir}/html-report/index.html`);
    console.log(`   • Performance: ${this.outputDir}/performance/performance-report.json`);
    console.log(`   • Accessibility: ${this.outputDir}/accessibility/accessibility-report.json`);
    console.log(`   • Summary: ${this.outputDir}/summary-report.json`);
    
    console.log('\n🚀 Next Steps:');
    if (this.testResults.exitCode === 0) {
      console.log('   • Review performance metrics');
      console.log('   • Check accessibility compliance');
      console.log('   • Consider expanding test coverage');
    } else {
      console.log('   • Review failed tests in HTML report');
      console.log('   • Check test artifacts for debugging');
      console.log('   • Fix issues and re-run tests');
    }
    
    console.log('='.repeat(60));
    
    // Exit with appropriate code
    process.exit(this.testResults.exitCode);
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Executing: ${command}`);
      
      exec(command, { 
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 10 * 60 * 1000 // 10 minute timeout
      }, (error, stdout, stderr) => {
        if (error) {
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

// Run the test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveTestRunner;