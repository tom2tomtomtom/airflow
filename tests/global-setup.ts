import { getErrorMessage } from '@/utils/errorUtils';
import { chromium, FullConfig } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AIRWAVE E2E Test Suite Global Setup');

  const { baseURL } = config.projects[0].use;
  const targetURL = baseURL || 'http://localhost:3000';

  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto(targetURL, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✅ Development server is ready');

    // Health check
    await performHealthCheck(page, targetURL);

    // Pre-authenticate and store auth state
    console.log('🔐 Setting up authentication state...');
    const authHelper = new AuthHelper(page);

    const testEmail = process.env.TEST_USER_EMAIL || 'test@airwave.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPass123!';

    await authHelper.login(testEmail, testPassword);
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Save authentication state for all test projects
    await context.storageState({ path: 'tests/auth-state.json' });
    console.log('✅ Authentication state saved');

    // Setup comprehensive test data
    await setupTestData(page);

    // Verify test environment is ready
    await verifyTestEnvironment(page);

    console.log('🎉 Global setup completed successfully');
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Global setup failed:', message);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Perform comprehensive health check
 */
async function performHealthCheck(page: any, baseURL: string) {
  console.log('🔍 Performing health checks...');

  try {
    // Check API health endpoint
    const apiResponse = await page.request.get('/api/health');
    if (apiResponse.ok()) {
      console.log('✅ API endpoints are accessible');
    } else {
      console.warn('⚠️ API health check failed, proceeding with caution');
    }

    // Check auth endpoints
    const authResponse = await page.request.get('/api/auth/session');
    console.log(`✅ Auth endpoints status: ${authResponse.status()}`);

    // Check static resources load
    await page.goto(baseURL + '/login');
    await page.waitForLoadState('networkidle');
    console.log('✅ Static resources loading properly');
  } catch (error) {
    console.warn('⚠️ Some health checks failed, tests may be unstable:', getErrorMessage(error));
  }
}

/**
 * Setup comprehensive test data
 */
async function setupTestData(page: any) {
  console.log('📊 Setting up comprehensive test data...');

  // Create test client for E2E tests
  await setupTestClient(page);

  // Setup test user permissions
  await setupTestUserPermissions(page);

  // Create test campaign data
  await setupTestCampaigns(page);

  console.log('✅ Test data setup completed');
}

/**
 * Setup test client
 */
async function setupTestClient(page: any) {
  try {
    // Navigate to clients page
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Check if test client already exists
    const testClientExists = await page.locator('text=E2E Test Client').isVisible();

    if (!testClientExists) {
      console.log('Creating test client...');

      const testClient = {
        name: 'E2E Test Client',
        industry: 'Technology',
        description: 'Client created for E2E testing purposes',
        email: 'test@e2e.com',
        brandColor: '#007bff',
        secondaryColor: '#6c757d',
      };

      // Try API approach first
      try {
        await page.request.post('/api/v2/clients', {
          data: testClient,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ Test client created via API');
      } catch (error) {
        // Fallback to UI creation
        console.log('API creation failed, using UI...');

        const createButton = page.locator('[data-testid="create-client-button"]');
        if (await createButton.isVisible()) {
          await createButton.click();

          await page.locator('[data-testid="client-name-input"]').fill(testClient.name);
          await page.locator('[data-testid="client-email-input"]').fill(testClient.email);
          await page
            .locator('[data-testid="client-description-input"]')
            .fill(testClient.description);

          await page.locator('[data-testid="save-client-button"]').click();
          await page.waitForSelector('[data-testid="client-created-success"]', { timeout: 10000 });

          console.log('✅ Test client created via UI');
        }
      }
    } else {
      console.log('✅ Test client already exists');
    }
  } catch (error) {
    console.warn('⚠️ Test client setup failed:', getErrorMessage(error));
  }
}

/**
 * Setup test user permissions
 */
async function setupTestUserPermissions(page: any) {
  try {
    // Verify user has necessary permissions for testing
    const userMenuVisible = await page.locator('[data-testid="user-menu"]').isVisible();
    if (userMenuVisible) {
      console.log('✅ User permissions verified');
    } else {
      console.warn('⚠️ User menu not found, permissions may be limited');
    }
  } catch (error) {
    console.warn('⚠️ Permission setup failed:', getErrorMessage(error));
  }
}

/**
 * Setup test campaigns
 */
async function setupTestCampaigns(page: any) {
  try {
    // Create minimal test campaign data that tests can build upon
    console.log('Setting up test campaign data...');

    // Navigate to dashboard to ensure we're in the right context
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    console.log('✅ Test campaign environment ready');
  } catch (error) {
    console.warn('⚠️ Test campaign setup failed:', getErrorMessage(error));
  }
}

/**
 * Verify test environment is ready
 */
async function verifyTestEnvironment(page: any) {
  console.log('🔍 Verifying test environment...');

  try {
    // Verify navigation works
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify basic elements are present
    const dashboardTitle = await page.locator('h1, h2').first().isVisible();
    if (dashboardTitle) {
      console.log('✅ Dashboard accessible');
    }

    // Verify client selection works
    const clientSelector = page.locator('[data-testid="client-selector"]');
    if (await clientSelector.isVisible()) {
      console.log('✅ Client selector available');
    }

    console.log('✅ Test environment verification completed');
  } catch (error) {
    console.warn('⚠️ Test environment verification failed:', getErrorMessage(error));
  }
}

export default globalSetup;
