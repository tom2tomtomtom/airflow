import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright Configuration for AIRWAVE
 * Optimized for comprehensive E2E testing with performance monitoring
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel for faster execution */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry configuration - more retries in CI for flaky tests */
  retries: process.env.CI ? 3 : 1,

  /* Optimize workers for CI vs local development */
  workers: process.env.CI ? 2 : undefined,

  /* Enhanced reporting for comprehensive analysis */
  reporter: [
    [
      'html',
      {
        open: process.env.CI ? 'never' : 'on-failure',
        outputFolder: 'test-results/html-report',
      },
    ],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['github'], // GitHub Actions integration
    ['blob'], // Enable trace viewer
  ],

  /* Global test configuration */
  use: {
    /* Base URL for all tests */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Enhanced tracing and debugging */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Timeouts optimized for AI operations */
    actionTimeout: 30000,
    navigationTimeout: 45000,

    /* Extra HTTP headers for test identification */
    extraHTTPHeaders: {
      'X-Test-Run': 'playwright-e2e',
      'X-Test-Timestamp': new Date().toISOString(),
    },

    /* Ignore HTTPS certificate errors in test environments */
    ignoreHTTPSErrors: true,

    /* Locale for consistent testing */
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  /* Test timeout - increased for AI operations */
  timeout: 180000, // 3 minutes for AI-heavy workflows

  /* Expect timeout */
  expect: {
    timeout: 15000, // Increased for complex UI operations
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/artifacts',

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  /* Configure projects for comprehensive testing */
  projects: [
    /* Setup project for authentication and data seeding */
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    /* Core functional tests - Chrome */
    {
      name: 'chromium-functional',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
      testMatch: [
        '**/auth-flow-*.spec.ts',
        '**/complete-user-workflow.spec.ts',
        '**/asset-management-*.spec.ts',
      ],
    },

    /* Performance tests - optimized Chrome */
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Performance monitoring headers
        extraHTTPHeaders: {
          'X-Performance-Test': 'true',
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/performance-*.spec.ts', '**/flow-workflow-detailed.spec.ts'],
      timeout: 300000, // 5 minutes for performance tests
    },

    /* Accessibility tests */
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // Force high contrast mode for accessibility testing
        colorScheme: 'dark',
      },
      dependencies: ['setup'],
      testMatch: ['**/accessibility-*.spec.ts', '**/complete-user-workflow.spec.ts'],
    },

    /* Cross-browser compatibility */
    {
      name: 'firefox-functional',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testMatch: ['**/auth-flow-integrated.spec.ts', '**/simple-navigation-test.spec.ts'],
    },

    {
      name: 'webkit-functional',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testMatch: ['**/auth-flow-integrated.spec.ts', '**/asset-management-integrated.spec.ts'],
    },

    /* Mobile testing */
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // Mobile-specific settings
        hasTouch: true,
        isMobile: true,
      },
      dependencies: ['setup'],
      testMatch: ['**/auth-flow-integrated.spec.ts', '**/comprehensive-ui-flow.spec.ts'],
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true,
        isMobile: true,
      },
      dependencies: ['setup'],
      testMatch: ['**/auth-flow-integrated.spec.ts', '**/simple-navigation-test.spec.ts'],
    },

    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true,
        isMobile: false,
      },
      dependencies: ['setup'],
      testMatch: ['**/complete-user-workflow.spec.ts'],
    },

    /* Visual regression testing */
    {
      name: 'visual',
      use: {
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual testing
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
      testMatch: ['**/visual-*.spec.ts', '**/comprehensive-ui-flow.spec.ts'],
    },

    /* API integration tests */
    {
      name: 'api-integration',
      use: {
        ...devices['Desktop Chrome'],
        // API-focused configuration
        extraHTTPHeaders: {
          'X-API-Test': 'true',
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/api-*.spec.ts', '**/flow-*.spec.ts'],
    },

    /* Stress testing */
    {
      name: 'stress',
      use: {
        ...devices['Desktop Chrome'],
        // Stress test configuration
        extraHTTPHeaders: {
          'X-Stress-Test': 'true',
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/stress-*.spec.ts'],
      timeout: 600000, // 10 minutes for stress tests
    },
  ],

  /* Development server configuration */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_ENABLE_MOCKS: 'true',
    },
  },

  /* Metadata for test reporting */
  metadata: {
    testRunId: process.env.GITHUB_RUN_ID || Date.now().toString(),
    buildNumber: process.env.GITHUB_RUN_NUMBER || '1',
    environment: process.env.NODE_ENV || 'test',
    version: process.env.npm_package_version || '1.0.0',
  },
});
