import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Enhanced Comprehensive Playwright Configuration for AIrWAVE
 * Includes all testing scenarios: functional, UX, performance, accessibility, cross-browser
 */
export default defineConfig({
  // Test directory structure
  testDir: './tests',
  
  // Global test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  // Extended timeouts for comprehensive testing
  timeout: 120 * 1000, // 2 minutes per test
  expect: {
    timeout: 15 * 1000, // 15 seconds for assertions
  },
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/utils/global-setup.ts'),
  globalTeardown: require.resolve('./tests/utils/global-teardown.ts'),
  
  // Test data and reporting
  use: {
    // Base URL for testing
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    // Global test settings
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser settings
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Extended timeouts for complex operations
    actionTimeout: 30 * 1000,
    navigationTimeout: 60 * 1000,
    
    // Permissions for comprehensive testing
    permissions: ['notifications', 'clipboard-write', 'clipboard-read'],
    
    // Authentication storage
    storageState: {
      cookies: [],
      origins: []
    }
  },

  // Comprehensive test projects for different scenarios
  projects: [
    // Setup project for authentication and data seeding
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Core Functional Testing - Desktop Chrome
    {
      name: 'chrome-functional',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [
        /.*\.perf\.spec\.ts/,
        /.*\.visual\.spec\.ts/,
        /.*\.mobile\.spec\.ts/,
        /.*\.accessibility\.spec\.ts/
      ],
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    
    // Cross-Browser Testing - Firefox
    {
      name: 'firefox-functional',
      testMatch: /.*workflow.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    
    // Cross-Browser Testing - Safari
    {
      name: 'safari-functional',
      testMatch: /.*workflow.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
    },
    
    // Mobile Testing - Chrome
    {
      name: 'mobile-chrome',
      testMatch: [
        /.*workflow.*\.spec\.ts/,
        /.*mobile.*\.spec\.ts/,
        /.*accessibility.*\.spec\.ts/
      ],
      use: { 
        ...devices['Pixel 5'],
        // Slow down for better mobile testing
        launchOptions: {
          slowMo: 100
        }
      },
      dependencies: ['setup'],
    },
    
    // Mobile Testing - Safari
    {
      name: 'mobile-safari',
      testMatch: [
        /.*workflow.*\.spec\.ts/,
        /.*mobile.*\.spec\.ts/
      ],
      use: { 
        ...devices['iPhone 12'],
        launchOptions: {
          slowMo: 100
        }
      },
      dependencies: ['setup'],
    },
    
    // Tablet Testing
    {
      name: 'tablet',
      testMatch: /.*workflow.*\.spec\.ts/,
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 }
      },
      dependencies: ['setup'],
    },
    
    // Performance Testing
    {
      name: 'performance',
      testMatch: /.*performance.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Performance-specific settings
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
      dependencies: ['setup'],
    },
    
    // Accessibility Testing
    {
      name: 'accessibility',
      testMatch: /.*accessibility.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Accessibility-specific settings
        launchOptions: {
          args: ['--force-prefers-reduced-motion']
        }
      },
      dependencies: ['setup'],
    },
    
    // Visual Regression Testing
    {
      name: 'visual',
      testMatch: /.*visual.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Consistent visual testing
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
          ]
        }
      },
      dependencies: ['setup'],
    },
    
    // API Testing
    {
      name: 'api',
      testMatch: /.*api.*\.spec\.ts/,
      use: {
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },
      dependencies: ['setup'],
    },
    
    // Load Testing Simulation
    {
      name: 'load-simulation',
      testMatch: /.*load.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      dependencies: ['setup'],
      // Run with multiple workers to simulate load
      fullyParallel: true,
    },
    
    // Security Testing
    {
      name: 'security',
      testMatch: /.*security.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Security testing specific settings
        ignoreHTTPSErrors: false,
        bypassCSP: false
      },
      dependencies: ['setup'],
    }
  ],

  // Local development server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes for complex app startup
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Comprehensive reporting configuration
  reporter: [
    // HTML Report with detailed breakdown
    ['html', { 
      outputFolder: 'test-results/html-report',
      open: process.env.CI ? 'never' : 'on-failure',
      attachmentsBaseURL: process.env.PLAYWRIGHT_ATTACHMENTS_BASE_URL
    }],
    
    // JSON Report for analysis
    ['json', { 
      outputFile: 'test-results/results.json' 
    }],
    
    // JUnit XML for CI integration
    ['junit', { 
      outputFile: 'test-results/junit.xml',
      includeProjectInTestName: true
    }],
    
    // Custom performance reporter
    ['./tests/utils/performance-reporter.ts'],
    
    // Accessibility reporter
    ['./tests/utils/accessibility-reporter.ts'],
    
    // GitHub Actions reporter in CI
    ...(process.env.CI ? [['github']] : []),
    
    // Console reporter for local development
    ...(!process.env.CI ? [['list', { printSteps: true }]] : [])
  ],

  // Output directories
  outputDir: 'test-results/artifacts',
  
  // Metadata for comprehensive testing
  metadata: {
    testSuite: 'AIrWAVE Comprehensive Testing',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    browser: 'multi-browser',
    os: process.platform,
    timestamp: new Date().toISOString()
  },

  // Test configuration
  grep: process.env.PLAYWRIGHT_GREP ? new RegExp(process.env.PLAYWRIGHT_GREP) : undefined,
  grepInvert: process.env.PLAYWRIGHT_GREP_INVERT ? new RegExp(process.env.PLAYWRIGHT_GREP_INVERT) : undefined,
});