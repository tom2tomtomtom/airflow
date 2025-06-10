import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright configuration for testing without full setup
 * Used for validating the testing infrastructure
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30 * 1000,
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  reporter: [
    ['html', { outputFolder: 'test-results/simple-report' }],
    ['list']
  ],

  outputDir: 'test-results/simple-artifacts',
});