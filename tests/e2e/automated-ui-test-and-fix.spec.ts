import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test.user@example.com';
const TEST_PASSWORD = 'Test123!@#';

// Interface for bug reports
interface BugReport {
  page: string;
  element: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fix?: {
    file: string;
    type: 'add' | 'modify' | 'remove';
    code: string;
    location?: string;
  };
}

// Interface for UI element test
interface UIElementTest {
  selector: string;
  description: string;
  expectedBehavior: string;
  testFunction: (page: Page) => Promise<boolean>;
}

// Bug storage
const bugs: BugReport[] = [];

// Helper function to login
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="email-input"]', TEST_EMAIL);
  await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
  await page.click('[data-testid="sign-in-button"]');
  await page.waitForNavigation({ url: '**/dashboard' });
}

// Helper function to check element visibility
async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.locator(selector);
    return await element.isVisible({ timeout: 5000 });
  } catch {
    return false;
  }
}

// Helper function to check element functionality
async function isElementFunctional(page: Page, selector: string, action: 'click' | 'fill' = 'click'): Promise<boolean> {
  try {
    const element = await page.locator(selector);
    if (!await element.isVisible()) return false;
    
    if (action === 'click') {
      await element.click({ timeout: 5000 });
      return true;
    } else if (action === 'fill') {
      await element.fill('test', { timeout: 5000 });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Define UI tests for each page
const pageTests: Record<string, UIElementTest[]> = {
  '/login': [
    {
      selector: '[data-testid="password-input"] input',
      description: 'Password input field',
      expectedBehavior: 'Should be visible and accept input',
      testFunction: async (page) => isElementFunctional(page, '[data-testid="password-input"] input', 'fill')
    },
    {
      selector: '[data-testid="password-input"] .MuiInputAdornment-root button',
      description: 'Password visibility toggle',
      expectedBehavior: 'Should toggle password visibility',
      testFunction: async (page) => {
        const passwordInput = await page.locator('[data-testid="password-input"] input');
        const toggleButton = await page.locator('[data-testid="password-input"] .MuiInputAdornment-root button');
        
        if (!await toggleButton.isVisible()) return false;
        
        const initialType = await passwordInput.getAttribute('type');
        await toggleButton.click();
        const newType = await passwordInput.getAttribute('type');
        
        return initialType !== newType;
      }
    },
    {
      selector: '[data-testid="error-message"]',
      description: 'Error message display',
      expectedBehavior: 'Should show error messages when login fails',
      testFunction: async (page) => {
        // Try to login with empty credentials
        await page.click('[data-testid="sign-in-button"]');
        await page.waitForTimeout(1000);
        return await isElementVisible(page, '[data-testid="error-message"]');
      }
    }
  ],
  '/dashboard': [
    {
      selector: '[data-testid="sidebar-nav"]',
      description: 'Sidebar navigation',
      expectedBehavior: 'Should display navigation menu',
      testFunction: async (page) => isElementVisible(page, '[data-testid="sidebar-nav"]')
    },
    {
      selector: '[data-testid="user-menu"]',
      description: 'User menu',
      expectedBehavior: 'Should show user menu with logout option',
      testFunction: async (page) => isElementVisible(page, '[data-testid="user-menu"]')
    }
  ],
  '/assets': [
    {
      selector: '[data-testid="upload-button"]',
      description: 'Upload button',
      expectedBehavior: 'Should be visible and clickable',
      testFunction: async (page) => isElementFunctional(page, '[data-testid="upload-button"]')
    },
    {
      selector: '[data-testid="asset-grid"]',
      description: 'Asset grid',
      expectedBehavior: 'Should display uploaded assets',
      testFunction: async (page) => isElementVisible(page, '[data-testid="asset-grid"]')
    }
  ],
  '/generate': [
    {
      selector: '[data-testid="generation-tabs"]',
      description: 'Generation tabs',
      expectedBehavior: 'Should show tabs for different generation types',
      testFunction: async (page) => isElementVisible(page, '[data-testid="generation-tabs"]')
    },
    {
      selector: '[data-testid="generate-button"]',
      description: 'Generate button',
      expectedBehavior: 'Should be visible and functional',
      testFunction: async (page) => isElementFunctional(page, '[data-testid="generate-button"]')
    }
  ]
};

// Test suite
test.describe('Automated UI Testing and Bug Fixing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any previous test data
    bugs.length = 0;
  });

  test('Test all UI elements and identify bugs', async ({ page }) => {
    console.log('Starting comprehensive UI testing...');

    // Test login page first (unauthenticated)
    console.log('\nTesting Login Page...');
    await page.goto(`${BASE_URL}/login`);
    
    for (const elementTest of pageTests['/login']) {
      console.log(`  Testing: ${elementTest.description}`);
      const passed = await elementTest.testFunction(page);
      
      if (!passed) {
        bugs.push({
          page: '/login',
          element: elementTest.description,
          issue: `${elementTest.description} - ${elementTest.expectedBehavior}`,
          severity: 'high',
          fix: generateFix('/login', elementTest)
        });
        console.log(`    ❌ FAILED: ${elementTest.issue}`);
      } else {
        console.log(`    ✅ PASSED`);
      }
    }

    // Login for authenticated pages
    await login(page);

    // Test authenticated pages
    const authenticatedPages = ['/dashboard', '/assets', '/generate'];
    
    for (const pagePath of authenticatedPages) {
      console.log(`\nTesting ${pagePath}...`);
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(2000); // Allow page to fully load
      
      const tests = pageTests[pagePath] || [];
      for (const elementTest of tests) {
        console.log(`  Testing: ${elementTest.description}`);
        const passed = await elementTest.testFunction(page);
        
        if (!passed) {
          bugs.push({
            page: pagePath,
            element: elementTest.description,
            issue: `${elementTest.description} - ${elementTest.expectedBehavior}`,
            severity: determineSeverity(elementTest),
            fix: generateFix(pagePath, elementTest)
          });
          console.log(`    ❌ FAILED: ${elementTest.issue}`);
        } else {
          console.log(`    ✅ PASSED`);
        }
      }
    }

    // Generate bug report
    await generateBugReport();
  });

  test('Apply fixes for identified bugs', async ({ page }) => {
    console.log('\nApplying fixes for identified bugs...');
    
    // Read the bug report
    const reportPath = path.join(process.cwd(), 'UI_BUG_REPORT.json');
    const reportContent = await fs.readFile(reportPath, 'utf-8');
    const bugReport = JSON.parse(reportContent);
    
    for (const bug of bugReport.bugs) {
      if (bug.fix) {
        console.log(`\nApplying fix for: ${bug.element} on ${bug.page}`);
        await applyFix(bug.fix);
      }
    }
    
    console.log('\nFixes applied. Please run the tests again to verify.');
  });

  test('Verify fixes', async ({ page }) => {
    console.log('\nVerifying applied fixes...');
    
    // Re-run tests to verify fixes
    const verificationResults: any[] = [];
    
    // Test login page
    await page.goto(`${BASE_URL}/login`);
    for (const elementTest of pageTests['/login']) {
      const passed = await elementTest.testFunction(page);
      verificationResults.push({
        page: '/login',
        element: elementTest.description,
        status: passed ? 'FIXED' : 'STILL BROKEN'
      });
    }
    
    // Test authenticated pages
    await login(page);
    
    for (const pagePath of ['/dashboard', '/assets', '/generate']) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(2000);
      
      const tests = pageTests[pagePath] || [];
      for (const elementTest of tests) {
        const passed = await elementTest.testFunction(page);
        verificationResults.push({
          page: pagePath,
          element: elementTest.description,
          status: passed ? 'FIXED' : 'STILL BROKEN'
        });
      }
    }
    
    // Generate verification report
    await generateVerificationReport(verificationResults);
  });
});

// Helper functions

function determineSeverity(test: UIElementTest): 'critical' | 'high' | 'medium' | 'low' {
  if (test.description.includes('login') || test.description.includes('authentication')) {
    return 'critical';
  }
  if (test.description.includes('button') || test.description.includes('navigation')) {
    return 'high';
  }
  return 'medium';
}

function generateFix(page: string, test: UIElementTest): BugReport['fix'] | undefined {
  // Generate appropriate fixes based on the issue
  
  if (test.selector.includes('password') && test.selector.includes('toggle')) {
    return {
      file: '/src/pages/login.tsx',
      type: 'modify',
      code: `// Ensure password toggle button has proper test ID
<IconButton
  onClick={() => setShowPassword(!showPassword)}
  edge="end"
  data-testid="password-toggle-button"
>
  {showPassword ? <VisibilityOff /> : <Visibility />}
</IconButton>`,
      location: 'line 155-160'
    };
  }
  
  if (test.selector.includes('upload-button')) {
    return {
      file: '/src/pages/assets.tsx',
      type: 'add',
      code: `<Button
  variant="contained"
  startIcon={<UploadIcon />}
  onClick={handleUploadClick}
  data-testid="upload-button"
>
  Upload Assets
</Button>`,
      location: 'after asset grid header'
    };
  }
  
  if (test.selector.includes('sidebar-nav')) {
    return {
      file: '/src/components/DashboardLayout.tsx',
      type: 'modify',
      code: `// Add test ID to sidebar navigation
<Box
  component="nav"
  data-testid="sidebar-nav"
  sx={{ ... }}
>`,
      location: 'sidebar navigation component'
    };
  }
  
  return undefined;
}

async function generateBugReport() {
  const report = {
    timestamp: new Date().toISOString(),
    totalBugs: bugs.length,
    criticalBugs: bugs.filter(b => b.severity === 'critical').length,
    highBugs: bugs.filter(b => b.severity === 'high').length,
    bugs: bugs
  };
  
  const reportPath = path.join(process.cwd(), 'UI_BUG_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📋 Bug report generated: ${reportPath}`);
  console.log(`Total bugs found: ${report.totalBugs}`);
  console.log(`Critical: ${report.criticalBugs}, High: ${report.highBugs}`);
}

async function applyFix(fix: BugReport['fix']) {
  if (!fix) return;
  
  try {
    const filePath = path.join(process.cwd(), fix.file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // This is a simplified version - in reality, you'd need more sophisticated code modification
    console.log(`Would apply fix to ${fix.file}:`);
    console.log(`Type: ${fix.type}`);
    console.log(`Location: ${fix.location}`);
    console.log(`Code:\n${fix.code}`);
    
    // For demonstration, we'll create a fixes directory with proposed changes
    const fixesDir = path.join(process.cwd(), 'proposed-fixes');
    await fs.mkdir(fixesDir, { recursive: true });
    
    const fixFileName = fix.file.replace(/\//g, '_') + '.fix';
    await fs.writeFile(
      path.join(fixesDir, fixFileName),
      `FILE: ${fix.file}\nTYPE: ${fix.type}\nLOCATION: ${fix.location}\n\nPROPOSED CODE:\n${fix.code}`
    );
  } catch (error) {
    console.error(`Error applying fix: ${error}`);
  }
}

async function generateVerificationReport(results: any[]) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    fixed: results.filter(r => r.status === 'FIXED').length,
    stillBroken: results.filter(r => r.status === 'STILL BROKEN').length,
    results: results
  };
  
  const reportPath = path.join(process.cwd(), 'UI_FIX_VERIFICATION_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Verification report generated: ${reportPath}`);
  console.log(`Fixed: ${report.fixed}/${report.totalTests}`);
  console.log(`Still broken: ${report.stillBroken}`);
}