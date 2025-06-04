import { test, expect } from '@playwright/test';

test.describe('AIrWAVE MVP Status Check', () => {
  test('Check all MVP features', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('🚀 AIrWAVE MVP Feature Status Check\n');
    
    const featureStatus: Record<string, string> = {};
    
    // Step 1: Authentication
    console.log('=== AUTHENTICATION ===');
    await page.goto('http://localhost:3003/login');
    
    // Check login form
    const emailInput = await page.locator('[data-testid="email-input"]').isVisible();
    const passwordInput = await page.locator('[data-testid="password-input"]').isVisible();
    const loginButton = await page.locator('[data-testid="sign-in-button"]').isVisible();
    
    featureStatus['Login Form'] = emailInput && passwordInput && loginButton ? '✅ WORKING' : '❌ BROKEN';
    
    // Perform login
    if (emailInput && passwordInput && loginButton) {
      await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
      await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
      await page.click('[data-testid="sign-in-button"]');
      
      try {
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        featureStatus['Login Process'] = '✅ WORKING';
      } catch {
        featureStatus['Login Process'] = '❌ BROKEN';
      }
    }
    
    // Check for password toggle
    const passwordToggle = await page.locator('[data-testid="password-visibility-toggle"]').isVisible().catch(() => false);
    featureStatus['Password Toggle'] = passwordToggle ? '✅ WORKING' : '❌ NOT IMPLEMENTED';
    
    // Check for forgot password link
    const forgotPassword = await page.locator('text=/forgot.*password/i').isVisible().catch(() => false);
    featureStatus['Forgot Password'] = forgotPassword ? '✅ PRESENT' : '❌ NOT IMPLEMENTED';
    
    // Step 2: Navigation & Layout
    console.log('\n=== NAVIGATION & LAYOUT ===');
    
    if (page.url().includes('dashboard')) {
      // Check logo
      const logo = await page.locator('text=AIrWAVE').first().isVisible();
      featureStatus['AIrWAVE Logo'] = logo ? '✅ PRESENT' : '❌ MISSING';
      
      // Check navigation items
      const navItems = ['Dashboard', 'Clients', 'Assets', 'Templates', 'Campaigns', 'Generate'];
      for (const item of navItems) {
        const navLink = await page.locator(`nav >> text=${item}`).isVisible().catch(() => false);
        featureStatus[`Nav: ${item}`] = navLink ? '✅ PRESENT' : '❌ MISSING';
      }
      
      // Check user menu
      const userMenu = await page.locator('.MuiAvatar-root').first().isVisible().catch(() => false);
      featureStatus['User Menu'] = userMenu ? '✅ PRESENT' : '❌ MISSING';
    }
    
    // Step 3: Dashboard Features
    console.log('\n=== DASHBOARD ===');
    
    const welcomeMessage = await page.locator('text=/welcome back/i').isVisible().catch(() => false);
    featureStatus['Welcome Message'] = welcomeMessage ? '✅ PRESENT' : '❌ MISSING';
    
    const quickActions = await page.locator('text=Quick Actions').isVisible().catch(() => false);
    featureStatus['Quick Actions'] = quickActions ? '✅ PRESENT' : '❌ MISSING';
    
    // Step 4: Client Management
    console.log('\n=== CLIENT MANAGEMENT ===');
    await page.goto('http://localhost:3003/clients');
    await page.waitForTimeout(2000);
    
    const clientsPage = page.url().includes('clients');
    featureStatus['Clients Page'] = clientsPage ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    
    const createClientButton = await page.locator('button:has-text("Create"), button:has-text("Add")').first().isVisible().catch(() => false);
    featureStatus['Create Client Button'] = createClientButton ? '✅ PRESENT' : '❌ MISSING';
    
    // Step 5: Assets
    console.log('\n=== ASSET MANAGEMENT ===');
    await page.goto('http://localhost:3003/assets');
    await page.waitForTimeout(2000);
    
    const assetsPage = page.url().includes('assets');
    featureStatus['Assets Page'] = assetsPage ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    
    const uploadButton = await page.locator('button:has-text("Upload"), button:has-text("Add")').first().isVisible().catch(() => false);
    featureStatus['Upload Button'] = uploadButton ? '✅ PRESENT' : '❌ MISSING';
    
    // Step 6: AI Generation
    console.log('\n=== AI GENERATION ===');
    await page.goto('http://localhost:3003/generate-enhanced');
    await page.waitForTimeout(2000);
    
    const generatePage = page.url().includes('generate');
    featureStatus['Generate Page'] = generatePage ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    
    // Check for tabs
    const tabs = await page.locator('[role="tab"]').count();
    featureStatus['Generation Tabs'] = tabs > 0 ? `✅ PRESENT (${tabs} tabs)` : '❌ MISSING';
    
    // Step 7: Campaigns
    console.log('\n=== CAMPAIGNS ===');
    await page.goto('http://localhost:3003/campaigns');
    await page.waitForTimeout(2000);
    
    const campaignsPage = page.url().includes('campaigns');
    featureStatus['Campaigns Page'] = campaignsPage ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    
    // Step 8: Templates
    console.log('\n=== TEMPLATES ===');
    await page.goto('http://localhost:3003/templates');
    await page.waitForTimeout(2000);
    
    const templatesPage = page.url().includes('templates');
    featureStatus['Templates Page'] = templatesPage ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    
    // Step 9: Matrix
    console.log('\n=== CONTENT MATRIX ===');
    await page.goto('http://localhost:3003/matrix');
    await page.waitForTimeout(2000);
    
    const matrixPage = page.url().includes('matrix');
    featureStatus['Matrix Page'] = matrixPage ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE';
    
    // Generate Report
    console.log('\n\n=== MVP FEATURE STATUS REPORT ===\n');
    
    let working = 0;
    let notWorking = 0;
    let notImplemented = 0;
    
    Object.entries(featureStatus).forEach(([feature, status]) => {
      console.log(`${feature}: ${status}`);
      
      if (status.includes('✅')) working++;
      else if (status.includes('❌ NOT IMPLEMENTED')) notImplemented++;
      else notWorking++;
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total Features Checked: ${Object.keys(featureStatus).length}`);
    console.log(`✅ Working: ${working}`);
    console.log(`❌ Broken: ${notWorking}`);
    console.log(`📝 Not Implemented: ${notImplemented}`);
    console.log(`Success Rate: ${Math.round(working / Object.keys(featureStatus).length * 100)}%`);
    
    // List of unfinished features based on requirements
    console.log('\n=== UNFINISHED MVP FEATURES ===');
    const unfinishedFeatures = [
      '1. Registration flow with all fields',
      '2. Password reset functionality',
      '3. Remember me checkbox',
      '4. Form validation on all forms',
      '5. Loading states during operations',
      '6. Client selector dropdown in header',
      '7. Recent clients section',
      '8. Notification system with badge',
      '9. Settings page',
      '10. Brief file upload (drag & drop)',
      '11. Real AI motivation generation (using mock data)',
      '12. Copy generation with real AI',
      '13. Image generation with DALL-E 3',
      '14. Video generation with Creatomate',
      '15. Voice generation with ElevenLabs',
      '16. Campaign matrix full functionality',
      '17. Asset bulk operations',
      '18. Template Creatomate sync',
      '19. Render queue with progress',
      '20. Export functionality',
      '21. Analytics dashboard',
      '22. Social media publishing',
      '23. Approval workflow',
      '24. Team member management'
    ];
    
    unfinishedFeatures.forEach(feature => console.log(feature));
    
    // Known bugs to fix
    console.log('\n=== BUGS TO FIX ===');
    const bugs = [
      '1. API authentication token retrieval (fixed but needs testing)',
      '2. Client contacts database schema (fixed but needs testing)',
      '3. Missing password visibility toggle',
      '4. No form validation errors shown',
      '5. No loading indicators during async operations',
      '6. Client selection not persistent',
      '7. Navigation to some pages may fail without login'
    ];
    
    bugs.forEach(bug => console.log(bug));
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('High Priority:');
    console.log('- Complete authentication flow (registration, password reset)');
    console.log('- Implement real AI integrations');
    console.log('- Fix remaining navigation issues');
    console.log('- Add form validation');
    console.log('\nMedium Priority:');
    console.log('- Implement file upload for assets and briefs');
    console.log('- Complete campaign matrix functionality');
    console.log('- Add notification system');
    console.log('- Implement rendering pipeline');
    console.log('\nLow Priority:');
    console.log('- Add loading states');
    console.log('- Implement settings page');
    console.log('- Add team collaboration features');
    console.log('- Complete analytics dashboard');
  });
});