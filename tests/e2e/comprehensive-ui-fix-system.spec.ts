import { test, expect, Page, BrowserContext } from '@playwright/test';
import { UIBugDetectorAndFixer } from './ui-bug-detector-and-fixer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test.user@example.com';
const TEST_PASSWORD = 'Test123!@#';

// Comprehensive UI test cases
interface UITestCase {
  name: string;
  page: string;
  requiresAuth: boolean;
  tests: Array<{
    description: string;
    test: (page: Page) => Promise<void>;
  }>;
}

const uiTestCases: UITestCase[] = [
  {
    name: 'Login Page UI',
    page: '/login',
    requiresAuth: false,
    tests: [
      {
        description: 'Password visibility toggle works',
        test: async (page) => {
          const passwordInput = page.locator('[data-testid="password-input"] input');
          const toggleButton = page.locator('[data-testid="password-input"] button').last();
          
          // Check initial state
          await expect(passwordInput).toHaveAttribute('type', 'password');
          
          // Click toggle
          await toggleButton.click();
          await expect(passwordInput).toHaveAttribute('type', 'text');
          
          // Click again
          await toggleButton.click();
          await expect(passwordInput).toHaveAttribute('type', 'password');
        }
      },
      {
        description: 'Form validation shows errors',
        test: async (page) => {
          // Try to submit empty form
          await page.click('[data-testid="sign-in-button"]');
          
          // Should show error
          await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
        }
      },
      {
        description: 'Login form accepts input',
        test: async (page) => {
          await page.fill('[data-testid="email-input"]', TEST_EMAIL);
          await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
          
          await expect(page.locator('[data-testid="email-input"]')).toHaveValue(TEST_EMAIL);
          await expect(page.locator('[data-testid="password-input"]')).toHaveValue(TEST_PASSWORD);
        }
      }
    ]
  },
  {
    name: 'Dashboard UI',
    page: '/dashboard',
    requiresAuth: true,
    tests: [
      {
        description: 'Sidebar navigation is visible',
        test: async (page) => {
          await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();
        }
      },
      {
        description: 'User menu is accessible',
        test: async (page) => {
          const userMenu = page.locator('[data-testid="user-menu"]');
          await expect(userMenu).toBeVisible();
          
          // Click to open dropdown
          await userMenu.click();
          await expect(page.locator('text=Logout')).toBeVisible();
        }
      },
      {
        description: 'Navigation links work',
        test: async (page) => {
          // Test navigation to different pages
          const navLinks = [
            { text: 'Assets', url: '/assets' },
            { text: 'Generate', url: '/generate' },
            { text: 'Campaigns', url: '/campaigns' }
          ];
          
          for (const link of navLinks) {
            const navLink = page.locator(`[data-testid="sidebar-nav"] >> text=${link.text}`);
            if (await navLink.isVisible()) {
              await navLink.click();
              await expect(page).toHaveURL(new RegExp(link.url));
              await page.goBack();
            }
          }
        }
      }
    ]
  },
  {
    name: 'Assets Page UI',
    page: '/assets',
    requiresAuth: true,
    tests: [
      {
        description: 'Upload button is visible and clickable',
        test: async (page) => {
          const uploadButton = page.locator('[data-testid="upload-button"]');
          await expect(uploadButton).toBeVisible();
          
          // Click should open upload modal
          await uploadButton.click();
          await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
        }
      },
      {
        description: 'Asset grid displays properly',
        test: async (page) => {
          await expect(page.locator('[data-testid="asset-grid"]')).toBeVisible();
        }
      }
    ]
  },
  {
    name: 'Generate Page UI',
    page: '/generate',
    requiresAuth: true,
    tests: [
      {
        description: 'Generation tabs are visible',
        test: async (page) => {
          await expect(page.locator('[data-testid="generation-tabs"]')).toBeVisible();
          
          // Check individual tabs
          const tabs = ['Copy', 'Image', 'Voice'];
          for (const tab of tabs) {
            await expect(page.locator(`text=${tab}`)).toBeVisible();
          }
        }
      },
      {
        description: 'Generate button is functional',
        test: async (page) => {
          const generateButton = page.locator('[data-testid="generate-button"]');
          await expect(generateButton).toBeVisible();
          
          // Should be disabled without input
          await expect(generateButton).toBeDisabled();
          
          // Add some input
          const promptInput = page.locator('[data-testid="prompt-input"]');
          if (await promptInput.isVisible()) {
            await promptInput.fill('Test prompt');
            await expect(generateButton).toBeEnabled();
          }
        }
      }
    ]
  }
];

// Main test suite
test.describe('Comprehensive UI Testing and Fixing System', () => {
  let context: BrowserContext;
  let authCookies: any[] = [];

  test.beforeAll(async ({ browser }) => {
    // Create a persistent context
    context = await browser.newContext();
    
    // Login once and save cookies
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email-input"]', TEST_EMAIL);
    await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
    await page.click('[data-testid="sign-in-button"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Save cookies
    authCookies = await context.cookies();
    await page.close();
  });

  test('Phase 1: Detect UI issues in source code', async () => {
    console.log('🔍 Phase 1: Detecting UI issues in source code...\n');
    
    const detector = new UIBugDetectorAndFixer(process.cwd());
    const issues = await detector.scanProject();
    await detector.generateReport();
    
    console.log(`\nFound ${issues.length} issues in source code`);
    
    // Log critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
    if (criticalIssues.length > 0) {
      console.log('\n⚠️  Critical/High severity issues:');
      criticalIssues.forEach(issue => {
        console.log(`  - ${issue.file}:${issue.line} - ${issue.issue}`);
      });
    }
  });

  test('Phase 2: Test UI functionality', async () => {
    console.log('\n🧪 Phase 2: Testing UI functionality...\n');
    
    const testResults: any[] = [];
    
    for (const testCase of uiTestCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      const page = await context.newPage();
      
      // Restore auth cookies if needed
      if (testCase.requiresAuth) {
        await context.addCookies(authCookies);
      }
      
      await page.goto(`${BASE_URL}${testCase.page}`);
      await page.waitForLoadState('networkidle');
      
      for (const uiTest of testCase.tests) {
        console.log(`  - ${uiTest.description}`);
        
        try {
          await uiTest.test(page);
          console.log(`    ✅ PASSED`);
          testResults.push({
            page: testCase.page,
            test: uiTest.description,
            status: 'PASSED'
          });
        } catch (error) {
          console.log(`    ❌ FAILED: ${error.message}`);
          testResults.push({
            page: testCase.page,
            test: uiTest.description,
            status: 'FAILED',
            error: error.message
          });
          
          // Take screenshot on failure
          await page.screenshot({
            path: `test-failure-${testCase.name.replace(/\s+/g, '-')}-${Date.now()}.png`
          });
        }
      }
      
      await page.close();
    }
    
    // Save test results
    await fs.writeFile(
      'UI_FUNCTIONALITY_TEST_RESULTS.json',
      JSON.stringify({ timestamp: new Date().toISOString(), results: testResults }, null, 2)
    );
  });

  test('Phase 3: Apply automatic fixes', async () => {
    console.log('\n🔧 Phase 3: Applying automatic fixes...\n');
    
    const detector = new UIBugDetectorAndFixer(process.cwd());
    await detector.scanProject();
    await detector.applyAutoFixes();
    
    console.log('\n✅ Automatic fixes applied');
  });

  test('Phase 4: Generate manual fix guide', async () => {
    console.log('\n📝 Phase 4: Generating manual fix guide...\n');
    
    const report = JSON.parse(await fs.readFile('UI_ISSUE_DETECTION_REPORT.json', 'utf-8'));
    const testResults = JSON.parse(await fs.readFile('UI_FUNCTIONALITY_TEST_RESULTS.json', 'utf-8'));
    
    const manualFixes: any[] = [];
    
    // Analyze test failures and suggest fixes
    const failedTests = testResults.results.filter(r => r.status === 'FAILED');
    
    for (const failure of failedTests) {
      if (failure.error.includes('password-toggle')) {
        manualFixes.push({
          page: failure.page,
          issue: 'Password toggle button not found',
          fix: {
            file: 'src/pages/login.tsx',
            change: 'Add data-testid="password-toggle-button" to the IconButton that toggles password visibility',
            code: `<IconButton
  onClick={() => setShowPassword(!showPassword)}
  edge="end"
  data-testid="password-toggle-button"
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? <VisibilityOff /> : <Visibility />}
</IconButton>`
          }
        });
      }
      
      if (failure.error.includes('upload-button')) {
        manualFixes.push({
          page: failure.page,
          issue: 'Upload button not found',
          fix: {
            file: 'src/pages/assets.tsx',
            change: 'Add upload button with proper test ID',
            code: `<Button
  variant="contained"
  startIcon={<CloudUploadIcon />}
  onClick={handleUploadClick}
  data-testid="upload-button"
>
  Upload Assets
</Button>`
          }
        });
      }
      
      if (failure.error.includes('sidebar-nav')) {
        manualFixes.push({
          page: failure.page,
          issue: 'Sidebar navigation not found',
          fix: {
            file: 'src/components/DashboardLayout.tsx',
            change: 'Add test ID to sidebar navigation',
            code: `<Box
  component="nav"
  data-testid="sidebar-nav"
  sx={{ /* existing styles */ }}
>
  {/* navigation content */}
</Box>`
          }
        });
      }
    }
    
    // Generate comprehensive fix guide
    const fixGuide = {
      timestamp: new Date().toISOString(),
      automaticFixesApplied: report.issues.filter(i => i.autoFixable).length,
      manualFixesRequired: manualFixes.length,
      fixes: manualFixes,
      instructions: [
        '1. Review each manual fix below',
        '2. Open the specified file',
        '3. Apply the suggested change',
        '4. Run the tests again to verify',
        '5. Commit changes once all tests pass'
      ]
    };
    
    await fs.writeFile('UI_FIX_GUIDE.json', JSON.stringify(fixGuide, null, 2));
    
    // Also create a markdown version for easier reading
    let markdown = '# UI Fix Guide\n\n';
    markdown += `Generated: ${fixGuide.timestamp}\n\n`;
    markdown += `## Summary\n`;
    markdown += `- Automatic fixes applied: ${fixGuide.automaticFixesApplied}\n`;
    markdown += `- Manual fixes required: ${fixGuide.manualFixesRequired}\n\n`;
    markdown += `## Manual Fixes Required\n\n`;
    
    for (const fix of manualFixes) {
      markdown += `### ${fix.issue}\n`;
      markdown += `**Page:** ${fix.page}\n`;
      markdown += `**File:** \`${fix.fix.file}\`\n`;
      markdown += `**Change:** ${fix.fix.change}\n`;
      markdown += `**Code:**\n\`\`\`tsx\n${fix.fix.code}\n\`\`\`\n\n`;
    }
    
    markdown += `## Instructions\n\n`;
    fixGuide.instructions.forEach(instruction => {
      markdown += `${instruction}\n`;
    });
    
    await fs.writeFile('UI_FIX_GUIDE.md', markdown);
    
    console.log('✅ Fix guide generated: UI_FIX_GUIDE.md');
  });

  test('Phase 5: Verify fixes', async () => {
    console.log('\n✅ Phase 5: Verifying fixes...\n');
    
    // Re-run the UI functionality tests
    const verificationResults: any[] = [];
    
    for (const testCase of uiTestCases) {
      const page = await context.newPage();
      
      if (testCase.requiresAuth) {
        await context.addCookies(authCookies);
      }
      
      await page.goto(`${BASE_URL}${testCase.page}`);
      await page.waitForLoadState('networkidle');
      
      for (const uiTest of testCase.tests) {
        try {
          await uiTest.test(page);
          verificationResults.push({
            page: testCase.page,
            test: uiTest.description,
            status: 'FIXED'
          });
        } catch (error) {
          verificationResults.push({
            page: testCase.page,
            test: uiTest.description,
            status: 'STILL FAILING',
            error: error.message
          });
        }
      }
      
      await page.close();
    }
    
    // Generate verification report
    const stillFailing = verificationResults.filter(r => r.status === 'STILL FAILING').length;
    const fixed = verificationResults.filter(r => r.status === 'FIXED').length;
    
    const verificationReport = {
      timestamp: new Date().toISOString(),
      totalTests: verificationResults.length,
      fixed,
      stillFailing,
      results: verificationResults
    };
    
    await fs.writeFile('UI_VERIFICATION_REPORT.json', JSON.stringify(verificationReport, null, 2));
    
    console.log(`\n📊 Verification Results:`);
    console.log(`  - Fixed: ${fixed}/${verificationResults.length}`);
    console.log(`  - Still failing: ${stillFailing}`);
    
    if (stillFailing === 0) {
      console.log('\n🎉 All UI issues have been fixed!');
    } else {
      console.log('\n⚠️  Some issues still need manual attention. Check UI_VERIFICATION_REPORT.json');
    }
  });

  test.afterAll(async () => {
    await context.close();
  });
});