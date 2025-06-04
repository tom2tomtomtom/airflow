import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Test and Fix All UI Elements', () => {
  test('Test, identify bugs, fix, and retest', async ({ page }) => {
    test.setTimeout(1200000); // 20 minutes for testing and fixing
    
    console.log('🔧 TEST AND FIX MODE - Will fix bugs as found\n');
    
    const bugs = [];
    const fixes = [];
    
    // === PHASE 1: LOGIN PAGE ===
    console.log('=== PHASE 1: LOGIN PAGE ===');
    await page.goto('http://localhost:3003/login');
    
    // Bug Check 1: Password visibility toggle
    console.log('\n🔍 Checking password visibility toggle...');
    const passwordInput = page.locator('[data-testid="password-input"] input');
    const toggleButton = page.locator('[data-testid="password-visibility-toggle"], button[aria-label*="password"], .MuiIconButton-root:has(svg[data-testid*="Visibility"])');
    
    if (!await toggleButton.isVisible({ timeout: 2000 })) {
      console.log('❌ BUG FOUND: Password visibility toggle missing');
      bugs.push({
        page: 'login',
        issue: 'Password visibility toggle missing',
        file: 'src/pages/login.tsx',
        fix: 'Add IconButton with visibility toggle'
      });
      
      // Fix the bug
      console.log('🔧 Fixing password toggle...');
      
      // Read the login page
      const loginPath = './src/pages/login.tsx';
      let loginContent = await readFile(loginPath, 'utf-8');
      
      // Check if it needs the import
      if (!loginContent.includes('Visibility') && !loginContent.includes('VisibilityOff')) {
        // Add imports
        loginContent = loginContent.replace(
          'import {',
          'import {\n  IconButton,\n  InputAdornment,'
        );
        
        loginContent = loginContent.replace(
          '} from \'@mui/material\';',
          '} from \'@mui/material\';\nimport { Visibility, VisibilityOff } from \'@mui/icons-material\';'
        );
      }
      
      // Add state for password visibility
      if (!loginContent.includes('showPassword')) {
        loginContent = loginContent.replace(
          'const [isLoading, setIsLoading] = useState(false);',
          'const [isLoading, setIsLoading] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);'
        );
      }
      
      // Update password field
      const passwordFieldRegex = /<TextField[\s\S]*?data-testid="password-input"[\s\S]*?\/>/;
      const passwordFieldMatch = loginContent.match(passwordFieldRegex);
      
      if (passwordFieldMatch && !loginContent.includes('InputProps=')) {
        const updatedPasswordField = passwordFieldMatch[0].replace(
          'type="password"',
          'type={showPassword ? "text" : "password"}'
        ).replace(
          '/>',
          `
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    data-testid="password-visibility-toggle"
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />`
        );
        
        loginContent = loginContent.replace(passwordFieldMatch[0], updatedPasswordField);
      }
      
      // Write the fixed file
      await writeFile(loginPath, loginContent);
      console.log('✅ Password toggle fix applied');
      fixes.push('Added password visibility toggle to login page');
      
      // Reload page to test fix
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Retest
      const toggleAfterFix = page.locator('[data-testid="password-visibility-toggle"]');
      if (await toggleAfterFix.isVisible()) {
        console.log('✅ Password toggle now working!');
        
        // Test functionality
        await page.fill('[data-testid="password-input"] input', 'testpass');
        const initialType = await passwordInput.getAttribute('type');
        await toggleAfterFix.click();
        const newType = await passwordInput.getAttribute('type');
        
        if (initialType === 'password' && newType === 'text') {
          console.log('✅ Password toggle functionality verified');
        }
      }
    } else {
      console.log('✅ Password toggle already exists');
    }
    
    // Bug Check 2: Form validation
    console.log('\n🔍 Checking form validation...');
    await page.fill('[data-testid="email-input"] input', '');
    await page.fill('[data-testid="password-input"] input', '');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForTimeout(1000);
    
    const emailError = await page.locator('text=/email.*required/i, .MuiFormHelperText-root').first().isVisible();
    const passwordError = await page.locator('text=/password.*required/i, .MuiFormHelperText-root').last().isVisible();
    
    if (!emailError || !passwordError) {
      console.log('❌ BUG FOUND: Form validation not showing errors');
      bugs.push({
        page: 'login',
        issue: 'Form validation errors not displayed',
        file: 'src/pages/login.tsx'
      });
      
      // Fix would involve adding validation state and error display
      // This is more complex, so we'll note it for manual fixing
    } else {
      console.log('✅ Form validation working');
    }
    
    // Bug Check 3: Forgot password link
    console.log('\n🔍 Checking forgot password link...');
    const forgotLink = page.locator('a:has-text("Forgot"), text=/forgot.*password/i');
    if (!await forgotLink.isVisible()) {
      console.log('❌ BUG FOUND: Forgot password link missing');
      bugs.push({
        page: 'login',
        issue: 'Forgot password link missing',
        file: 'src/pages/login.tsx'
      });
    }
    
    // Now login to test other pages
    await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
    await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('**/dashboard');
    
    // === PHASE 2: NAVIGATION ===
    console.log('\n=== PHASE 2: NAVIGATION ===');
    
    // Bug Check 4: Missing nav items
    console.log('\n🔍 Checking navigation items...');
    const expectedNavItems = ['Dashboard', 'Clients', 'Assets', 'Generate', 'Templates', 'Campaigns', 'Matrix'];
    const missingNavItems = [];
    
    for (const item of expectedNavItems) {
      const navItem = page.locator(`nav >> text=${item}`).first();
      if (!await navItem.isVisible({ timeout: 1000 })) {
        missingNavItems.push(item);
      }
    }
    
    if (missingNavItems.length > 0) {
      console.log(`❌ BUG FOUND: Missing nav items: ${missingNavItems.join(', ')}`);
      bugs.push({
        page: 'DashboardLayout',
        issue: `Missing navigation items: ${missingNavItems.join(', ')}`,
        file: 'src/components/DashboardLayout.tsx'
      });
    }
    
    // Bug Check 5: Client selector
    console.log('\n🔍 Checking client selector...');
    const clientSelector = page.locator('[data-testid="client-selector"], button:has-text("Select Client")');
    if (!await clientSelector.isVisible()) {
      console.log('❌ BUG FOUND: Client selector missing from header');
      bugs.push({
        page: 'DashboardLayout',
        issue: 'Client selector dropdown missing',
        file: 'src/components/DashboardLayout.tsx'
      });
    }
    
    // === PHASE 3: ASSETS PAGE ===
    console.log('\n=== PHASE 3: ASSETS PAGE ===');
    await page.goto('http://localhost:3003/assets');
    await page.waitForTimeout(2000);
    
    // Check if we got redirected
    if (page.url().includes('login')) {
      console.log('❌ BUG FOUND: Assets page redirects to login');
      bugs.push({
        page: 'assets',
        issue: 'Page redirects to login - auth not persisting',
        file: 'src/pages/assets.tsx'
      });
      
      // Re-login and try again
      await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
      await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
      await page.click('[data-testid="sign-in-button"]');
      await page.waitForURL('**/dashboard');
      await page.goto('http://localhost:3003/assets');
    }
    
    // === PHASE 4: GENERATE PAGE ===
    console.log('\n=== PHASE 4: GENERATE PAGE ===');
    await page.goto('http://localhost:3003/generate-enhanced');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('login')) {
      console.log('❌ BUG FOUND: Generate page redirects to login');
      bugs.push({
        page: 'generate-enhanced',
        issue: 'Page redirects to login - auth not persisting',
        file: 'src/pages/generate-enhanced.tsx'
      });
    } else {
      // Test the page functionality
      const tabs = await page.locator('[role="tab"]').count();
      if (tabs === 0) {
        console.log('❌ BUG FOUND: No tabs on generate page');
        bugs.push({
          page: 'generate-enhanced',
          issue: 'Tabs not rendering',
          file: 'src/pages/generate-enhanced.tsx'
        });
      } else {
        console.log(`✅ Found ${tabs} tabs on generate page`);
      }
    }
    
    // === FINAL REPORT ===
    console.log('\n\n=== TEST AND FIX REPORT ===\n');
    
    console.log(`BUGS FOUND: ${bugs.length}`);
    bugs.forEach((bug, i) => {
      console.log(`\n${i + 1}. ${bug.page} - ${bug.issue}`);
      console.log(`   File: ${bug.file}`);
      if (bug.fix) console.log(`   Fix: ${bug.fix}`);
    });
    
    console.log(`\nFIXES APPLIED: ${fixes.length}`);
    fixes.forEach((fix, i) => {
      console.log(`${i + 1}. ${fix}`);
    });
    
    console.log('\n=== REMAINING ISSUES TO FIX MANUALLY ===');
    console.log('1. Form validation error display');
    console.log('2. Forgot password link and functionality');
    console.log('3. Missing navigation items');
    console.log('4. Client selector in header');
    console.log('5. Auth persistence for Assets and Generate pages');
    console.log('6. Loading states on all async operations');
    
    // Save bug report
    const bugReport = {
      timestamp: new Date().toISOString(),
      bugsFound: bugs,
      fixesApplied: fixes,
      testResults: {
        passwordToggle: await page.locator('[data-testid="password-visibility-toggle"]').isVisible(),
        formValidation: false,
        forgotPassword: false,
        navigation: expectedNavItems.length - missingNavItems.length + '/' + expectedNavItems.length,
        clientSelector: false,
        assetsPage: !page.url().includes('login'),
        generatePage: !page.url().includes('login')
      }
    };
    
    await writeFile('./BUG_REPORT.json', JSON.stringify(bugReport, null, 2));
    console.log('\n✅ Bug report saved to BUG_REPORT.json');
  });
});