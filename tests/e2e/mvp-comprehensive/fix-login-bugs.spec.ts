import { test, expect } from '@playwright/test';

test.describe('Fix Login Page Bugs', () => {
  test('Fix password toggle and form validation', async ({ page }) => {
    console.log('🔧 FIXING LOGIN PAGE BUGS\n');
    
    // Go to login page
    await page.goto('http://localhost:3003/login');
    
    // Test 1: Check password visibility toggle
    console.log('1. Testing password visibility toggle...');
    const passwordInput = page.locator('[data-testid="password-input"] input');
    let toggleButton = page.locator('[data-testid="password-visibility-toggle"]');
    
    if (!await toggleButton.isVisible({ timeout: 2000 })) {
      console.log('❌ Password toggle not found - NEEDS FIX');
      console.log('   Fix: Add IconButton with Visibility/VisibilityOff icons');
      console.log('   Location: src/pages/login.tsx');
      
      // The fix has already been applied in previous code
      // Let's verify by checking for any icon button
      const anyIconButton = page.locator('.MuiIconButton-root');
      if (await anyIconButton.count() > 0) {
        console.log('✅ Found icon buttons, toggle might be implemented differently');
      }
    } else {
      console.log('✅ Password toggle exists');
      
      // Test functionality
      await passwordInput.fill('testpassword');
      const initialType = await passwordInput.getAttribute('type');
      await toggleButton.click();
      const afterType = await passwordInput.getAttribute('type');
      
      if (initialType !== afterType) {
        console.log('✅ Toggle functionality works');
      } else {
        console.log('❌ Toggle doesn\'t change input type');
      }
    }
    
    // Test 2: Form validation
    console.log('\n2. Testing form validation...');
    
    // Clear fields and submit
    await page.fill('[data-testid="email-input"] input', '');
    await page.fill('[data-testid="password-input"] input', '');
    await page.click('[data-testid="sign-in-button"]');
    
    // Wait for potential error messages
    await page.waitForTimeout(1000);
    
    // Check for error messages
    const errorMessages = await page.locator('.MuiFormHelperText-root, .Mui-error, text=/required|invalid/i').count();
    
    if (errorMessages === 0) {
      console.log('❌ No validation errors shown - NEEDS FIX');
      console.log('   Fix: Add form validation with error states');
      console.log('   Location: src/pages/login.tsx');
    } else {
      console.log(`✅ Found ${errorMessages} error messages`);
    }
    
    // Test 3: Invalid email format
    console.log('\n3. Testing email format validation...');
    await page.fill('[data-testid="email-input"] input', 'invalidemail');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForTimeout(1000);
    
    const emailFormatError = await page.locator('text=/invalid.*email|email.*format/i').isVisible();
    if (!emailFormatError) {
      console.log('❌ No email format validation - NEEDS FIX');
    } else {
      console.log('✅ Email format validation works');
    }
    
    // Test 4: Loading state
    console.log('\n4. Testing loading state...');
    await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
    await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
    
    // Set up promise to check for loading state
    const loadingPromise = page.waitForSelector('.MuiCircularProgress-root, [data-testid="loading"]', {
      timeout: 2000,
      state: 'visible'
    }).catch(() => null);
    
    // Click sign in
    await page.click('[data-testid="sign-in-button"]');
    
    // Check if loading appeared
    const loadingElement = await loadingPromise;
    
    if (!loadingElement) {
      console.log('❌ No loading state shown - NEEDS FIX');
      console.log('   Fix: Add CircularProgress to button during login');
    } else {
      console.log('✅ Loading state appears during login');
    }
    
    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    
    // Test 5: Remember me checkbox
    console.log('\n5. Testing remember me checkbox...');
    if (!page.url().includes('dashboard')) {
      await page.goto('http://localhost:3003/login');
    }
    
    const rememberCheckbox = page.locator('input[type="checkbox"][name="remember"], label:has-text("Remember me")');
    if (!await rememberCheckbox.isVisible()) {
      console.log('❌ Remember me checkbox not found - NEEDS FIX');
      console.log('   Fix: Add Checkbox component with "Remember me" label');
    } else {
      console.log('✅ Remember me checkbox exists');
    }
    
    // Test 6: Forgot password link
    console.log('\n6. Testing forgot password link...');
    const forgotLink = page.locator('a:has-text("Forgot password"), text=/forgot.*password/i');
    if (!await forgotLink.isVisible()) {
      console.log('❌ Forgot password link not found - NEEDS FIX');
      console.log('   Fix: Add Link component to forgot-password page');
    } else {
      console.log('✅ Forgot password link exists');
      
      // Test if it navigates
      await forgotLink.click();
      await page.waitForTimeout(1000);
      if (page.url().includes('forgot') || page.url().includes('reset')) {
        console.log('✅ Forgot password navigation works');
      } else {
        console.log('❌ Forgot password link doesn\'t navigate');
      }
    }
    
    // Summary
    console.log('\n=== LOGIN PAGE BUG SUMMARY ===');
    console.log('Issues to fix in src/pages/login.tsx:');
    console.log('1. Add password visibility toggle with IconButton');
    console.log('2. Add form validation with error messages');
    console.log('3. Add email format validation');
    console.log('4. Add loading state to submit button');
    console.log('5. Add remember me checkbox');
    console.log('6. Add forgot password link');
    
    console.log('\nNext step: Apply fixes to login.tsx and re-run this test');
  });
});