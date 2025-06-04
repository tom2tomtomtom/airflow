import { test, expect, Page } from '@playwright/test';

// Comprehensive dummy data for testing
const testData = {
  user: {
    email: 'test.ui.user@airwave.test',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    company: 'Test Company Inc',
    phone: '+1-555-123-4567',
    address: '123 Test Street, Test City, TC 12345'
  },
  client: {
    name: 'Demo Client Corporation',
    industry: 'Technology',
    description: 'A comprehensive test client for UI/UX validation',
    website: 'https://democlient.test',
    contactName: 'John Demo',
    contactEmail: 'john@democlient.test',
    contactPhone: '+1-555-987-6543',
    brandGuidelines: 'Professional, modern, innovative brand voice',
    primaryColor: '#2196F3',
    secondaryColor: '#FF9800',
    budget: '50000',
    notes: 'This is a test client created for comprehensive UI testing'
  },
  campaign: {
    name: 'Comprehensive UI Test Campaign',
    description: 'Testing all campaign creation functionality',
    objectives: 'Increase brand awareness, drive traffic, generate leads',
    targetAudience: 'Tech professionals aged 25-45',
    budget: '25000',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    platforms: ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'],
    tags: ['ui-test', 'demo', 'comprehensive']
  },
  asset: {
    title: 'Test Asset for UI Validation',
    description: 'Comprehensive test asset with detailed metadata',
    tags: ['test', 'ui', 'validation', 'demo'],
    category: 'Image',
    usage: 'Social Media',
    notes: 'This asset is created for testing purposes only'
  },
  content: {
    headline: 'Revolutionary UI Testing Solution',
    subheadline: 'Comprehensive validation for modern applications',
    bodyText: 'This is a detailed body text that demonstrates the text input capabilities of the application. It includes multiple sentences to test text area functionality.',
    callToAction: 'Start Testing Now',
    keywords: ['ui testing', 'validation', 'comprehensive', 'demo'],
    tone: 'Professional and engaging',
    voice: 'Authoritative yet approachable'
  }
};

test.describe('🎭 Comprehensive UI/UX Full Application Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('🏠 Homepage - Test all elements and navigation', async ({ page }) => {
    console.log('🔍 Testing Homepage elements...');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-homepage-initial.png', fullPage: true });
    
    // Test navigation menu items
    const navItems = [
      'Dashboard', 'Clients', 'Assets', 'Templates', 'Campaigns', 
      'Matrix', 'Execute', 'Approvals', 'Analytics'
    ];
    
    for (const item of navItems) {
      const navLink = page.locator(`a:has-text("${item}"), button:has-text("${item}")`).first();
      if (await navLink.isVisible()) {
        console.log(`✅ Navigation item found: ${item}`);
        await navLink.hover();
        await page.waitForTimeout(500);
      }
    }
    
    // Test any visible buttons on homepage
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} visible buttons on homepage`);
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const buttonText = await button.textContent();
      console.log(`Testing button: ${buttonText}`);
      await button.hover();
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: 'test-results/01-homepage-after-interactions.png', fullPage: true });
  });

  test('🔐 Authentication Flow - Login/Signup Forms', async ({ page }) => {
    console.log('🔍 Testing Authentication forms...');
    
    // Try to find login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-login-page.png', fullPage: true });
    
    // Test all input fields on login page
    const emailInput = page.locator('input[type="email"], input[name="email"], #email').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password').first();
    
    if (await emailInput.isVisible()) {
      console.log('✅ Testing email input...');
      await emailInput.click();
      await emailInput.fill(testData.user.email);
      await page.waitForTimeout(500);
    }
    
    if (await passwordInput.isVisible()) {
      console.log('✅ Testing password input...');
      await passwordInput.click();
      await passwordInput.fill(testData.user.password);
      await page.waitForTimeout(500);
    }
    
    // Test login button
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]').first();
    if (await loginButton.isVisible()) {
      console.log('✅ Found login button');
      await loginButton.hover();
    }
    
    await page.screenshot({ path: 'test-results/02-login-filled.png', fullPage: true });
    
    // Try signup page if it exists
    try {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/02-signup-page.png', fullPage: true });
      
      // Fill signup form if it exists
      const signupFields = [
        { selector: 'input[name="firstName"], input[name="first_name"], #firstName', value: testData.user.firstName },
        { selector: 'input[name="lastName"], input[name="last_name"], #lastName', value: testData.user.lastName },
        { selector: 'input[name="email"], input[type="email"], #email', value: testData.user.email },
        { selector: 'input[name="password"], input[type="password"], #password', value: testData.user.password },
        { selector: 'input[name="company"], #company', value: testData.user.company },
        { selector: 'input[name="phone"], input[type="tel"], #phone', value: testData.user.phone }
      ];
      
      for (const field of signupFields) {
        const input = page.locator(field.selector).first();
        if (await input.isVisible()) {
          console.log(`✅ Testing signup field: ${field.selector}`);
          await input.click();
          await input.fill(field.value);
          await page.waitForTimeout(300);
        }
      }
      
      await page.screenshot({ path: 'test-results/02-signup-filled.png', fullPage: true });
    } catch (error) {
      console.log('⚠️ Signup page not accessible');
    }
  });

  test('📊 Dashboard - Test all dashboard elements', async ({ page }) => {
    console.log('🔍 Testing Dashboard...');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/03-dashboard-initial.png', fullPage: true });
    
    // Test all visible cards and metrics
    const cards = page.locator('[role="button"], .card, .metric-card, .dashboard-card').locator('visible=true');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} dashboard cards/metrics`);
    
    for (let i = 0; i < Math.min(cardCount, 15); i++) {
      const card = cards.nth(i);
      await card.hover();
      await page.waitForTimeout(200);
    }
    
    // Test any dashboard buttons
    const dashboardButtons = page.locator('button:visible');
    const buttonCount = await dashboardButtons.count();
    console.log(`Found ${buttonCount} buttons on dashboard`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) {
      const button = dashboardButtons.nth(i);
      const buttonText = await button.textContent();
      if (buttonText && !buttonText.includes('×') && !buttonText.includes('Close')) {
        console.log(`Testing dashboard button: ${buttonText}`);
        await button.hover();
        await page.waitForTimeout(200);
      }
    }
    
    await page.screenshot({ path: 'test-results/03-dashboard-interactions.png', fullPage: true });
  });

  test('👥 Clients - Test client management interface', async ({ page }) => {
    console.log('🔍 Testing Clients page...');
    
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/04-clients-initial.png', fullPage: true });
    
    // Test "Add Client" or "Create Client" button
    const addClientButton = page.locator('button:has-text("Add Client"), button:has-text("Create Client"), button:has-text("New Client")').first();
    if (await addClientButton.isVisible()) {
      console.log('✅ Found Add Client button');
      await addClientButton.hover();
      await addClientButton.click();
      await page.waitForTimeout(1000);
      
      // Test client creation form
      const clientFields = [
        { selector: 'input[name="name"], #clientName, input[placeholder*="name" i]', value: testData.client.name },
        { selector: 'input[name="industry"], #industry', value: testData.client.industry },
        { selector: 'textarea[name="description"], #description', value: testData.client.description },
        { selector: 'input[name="website"], #website, input[type="url"]', value: testData.client.website },
        { selector: 'input[name="contactName"], #contactName', value: testData.client.contactName },
        { selector: 'input[name="contactEmail"], #contactEmail, input[type="email"]', value: testData.client.contactEmail },
        { selector: 'input[name="contactPhone"], #contactPhone, input[type="tel"]', value: testData.client.contactPhone },
        { selector: 'textarea[name="brandGuidelines"], #brandGuidelines', value: testData.client.brandGuidelines },
        { selector: 'input[name="budget"], #budget, input[type="number"]', value: testData.client.budget },
        { selector: 'textarea[name="notes"], #notes', value: testData.client.notes }
      ];
      
      for (const field of clientFields) {
        const input = page.locator(field.selector).first();
        if (await input.isVisible()) {
          console.log(`✅ Testing client field: ${field.selector}`);
          await input.click();
          await input.fill(field.value);
          await page.waitForTimeout(300);
        }
      }
      
      // Test color picker if it exists
      const colorInputs = page.locator('input[type="color"], .color-picker input').locator('visible=true');
      const colorCount = await colorInputs.count();
      for (let i = 0; i < colorCount; i++) {
        const colorInput = colorInputs.nth(i);
        await colorInput.click();
        await colorInput.fill(i === 0 ? testData.client.primaryColor : testData.client.secondaryColor);
        await page.waitForTimeout(300);
      }
      
      await page.screenshot({ path: 'test-results/04-clients-form-filled.png', fullPage: true });
      
      // Test form submission buttons
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Submit")').first();
      if (await saveButton.isVisible()) {
        await saveButton.hover();
        console.log('✅ Found Save button for client form');
      }
    }
    
    await page.screenshot({ path: 'test-results/04-clients-final.png', fullPage: true });
  });

  test('🎨 Assets - Test asset management and upload', async ({ page }) => {
    console.log('🔍 Testing Assets page...');
    
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/05-assets-initial.png', fullPage: true });
    
    // Test asset filters and search
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], #search').first();
    if (await searchInput.isVisible()) {
      console.log('✅ Testing asset search...');
      await searchInput.click();
      await searchInput.fill('test asset search query');
      await page.waitForTimeout(500);
    }
    
    // Test filter buttons
    const filterButtons = page.locator('button:has-text("Filter"), button:has-text("Category"), button:has-text("Type")');
    const filterCount = await filterButtons.count();
    for (let i = 0; i < filterCount; i++) {
      const filterButton = filterButtons.nth(i);
      if (await filterButton.isVisible()) {
        console.log(`✅ Testing filter button: ${await filterButton.textContent()}`);
        await filterButton.hover();
        await page.waitForTimeout(300);
      }
    }
    
    // Test upload button
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Asset"), input[type="file"]').first();
    if (await uploadButton.isVisible()) {
      console.log('✅ Found upload button');
      await uploadButton.hover();
      
      // If it's a file input, we can't actually upload without a file
      const tagName = await uploadButton.evaluate(el => el.tagName.toLowerCase());
      if (tagName !== 'input') {
        await uploadButton.click();
        await page.waitForTimeout(1000);
        
        // Test asset form fields if modal opens
        const assetFields = [
          { selector: 'input[name="title"], #assetTitle', value: testData.asset.title },
          { selector: 'textarea[name="description"], #assetDescription', value: testData.asset.description },
          { selector: 'input[name="tags"], #tags', value: testData.asset.tags.join(', ') },
          { selector: 'select[name="category"], #category', value: testData.asset.category },
          { selector: 'textarea[name="notes"], #assetNotes', value: testData.asset.notes }
        ];
        
        for (const field of assetFields) {
          const input = page.locator(field.selector).first();
          if (await input.isVisible()) {
            console.log(`✅ Testing asset field: ${field.selector}`);
            if (field.selector.includes('select')) {
              await input.selectOption(field.value);
            } else {
              await input.click();
              await input.fill(field.value);
            }
            await page.waitForTimeout(300);
          }
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/05-assets-interactions.png', fullPage: true });
  });

  test('📋 Templates - Test template management', async ({ page }) => {
    console.log('🔍 Testing Templates page...');
    
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/06-templates-initial.png', fullPage: true });
    
    // Test template cards interaction
    const templateCards = page.locator('.template-card, .card, [data-testid*="template"]').locator('visible=true');
    const cardCount = await templateCards.count();
    console.log(`Found ${cardCount} template cards`);
    
    for (let i = 0; i < Math.min(cardCount, 10); i++) {
      const card = templateCards.nth(i);
      await card.hover();
      await page.waitForTimeout(300);
    }
    
    // Test template action buttons
    const actionButtons = page.locator('button:has-text("Use Template"), button:has-text("Preview"), button:has-text("Edit")');
    const actionCount = await actionButtons.count();
    for (let i = 0; i < Math.min(actionCount, 5); i++) {
      const button = actionButtons.nth(i);
      if (await button.isVisible()) {
        console.log(`✅ Testing template action: ${await button.textContent()}`);
        await button.hover();
        await page.waitForTimeout(300);
      }
    }
    
    await page.screenshot({ path: 'test-results/06-templates-interactions.png', fullPage: true });
  });

  test('🚀 Campaigns - Test campaign creation and management', async ({ page }) => {
    console.log('🔍 Testing Campaigns page...');
    
    await page.goto('/campaigns');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/07-campaigns-initial.png', fullPage: true });
    
    // Test campaign creation
    const createCampaignButton = page.locator('button:has-text("Create Campaign"), button:has-text("New Campaign"), button:has-text("Add Campaign")').first();
    if (await createCampaignButton.isVisible()) {
      console.log('✅ Found Create Campaign button');
      await createCampaignButton.hover();
      await createCampaignButton.click();
      await page.waitForTimeout(1000);
      
      // Test campaign form fields
      const campaignFields = [
        { selector: 'input[name="name"], input[name="campaignName"], #campaignName', value: testData.campaign.name },
        { selector: 'textarea[name="description"], #campaignDescription', value: testData.campaign.description },
        { selector: 'textarea[name="objectives"], #objectives', value: testData.campaign.objectives },
        { selector: 'textarea[name="targetAudience"], #targetAudience', value: testData.campaign.targetAudience },
        { selector: 'input[name="budget"], #budget, input[type="number"]', value: testData.campaign.budget },
        { selector: 'input[name="startDate"], input[type="date"]', value: testData.campaign.startDate },
        { selector: 'input[name="endDate"]', value: testData.campaign.endDate }
      ];
      
      for (const field of campaignFields) {
        const input = page.locator(field.selector).first();
        if (await input.isVisible()) {
          console.log(`✅ Testing campaign field: ${field.selector}`);
          await input.click();
          await input.fill(field.value);
          await page.waitForTimeout(300);
        }
      }
      
      // Test platform checkboxes/selections
      for (const platform of testData.campaign.platforms) {
        const platformCheckbox = page.locator(`input[type="checkbox"][value="${platform}"], label:has-text("${platform}")").first();
        if (await platformCheckbox.isVisible()) {
          console.log(`✅ Testing platform selection: ${platform}`);
          await platformCheckbox.check();
          await page.waitForTimeout(200);
        }
      }
      
      await page.screenshot({ path: 'test-results/07-campaigns-form-filled.png', fullPage: true });
    }
    
    await page.screenshot({ path: 'test-results/07-campaigns-final.png', fullPage: true });
  });

  test('🎯 Content Generation - Test AI content creation', async ({ page }) => {
    console.log('🔍 Testing Content Generation...');
    
    // Try multiple possible content generation routes
    const contentRoutes = ['/generate', '/content', '/ai-tools', '/strategic-content'];
    
    for (const route of contentRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const pageContent = await page.content();
        if (pageContent.includes('generate') || pageContent.includes('content') || pageContent.includes('AI')) {
          console.log(`✅ Found content generation page: ${route}`);
          await page.screenshot({ path: `test-results/08-content-${route.replace('/', '')}-initial.png`, fullPage: true });
          
          // Test content generation form fields
          const contentFields = [
            { selector: 'input[name="headline"], #headline', value: testData.content.headline },
            { selector: 'input[name="subheadline"], #subheadline', value: testData.content.subheadline },
            { selector: 'textarea[name="bodyText"], textarea[name="body"], #bodyText', value: testData.content.bodyText },
            { selector: 'input[name="callToAction"], input[name="cta"], #cta', value: testData.content.callToAction },
            { selector: 'input[name="tone"], #tone', value: testData.content.tone },
            { selector: 'input[name="voice"], #voice', value: testData.content.voice }
          ];
          
          for (const field of contentFields) {
            const input = page.locator(field.selector).first();
            if (await input.isVisible()) {
              console.log(`✅ Testing content field: ${field.selector}`);
              await input.click();
              await input.fill(field.value);
              await page.waitForTimeout(300);
            }
          }
          
          // Test generation buttons
          const generateButtons = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("AI Generate")');
          const genButtonCount = await generateButtons.count();
          for (let i = 0; i < genButtonCount; i++) {
            const button = generateButtons.nth(i);
            if (await button.isVisible()) {
              console.log(`✅ Testing generate button: ${await button.textContent()}`);
              await button.hover();
              await page.waitForTimeout(300);
            }
          }
          
          await page.screenshot({ path: `test-results/08-content-${route.replace('/', '')}-filled.png`, fullPage: true });
          break;
        }
      } catch (error) {
        console.log(`⚠️ Content route not accessible: ${route}`);
      }
    }
  });

  test('📈 Analytics - Test analytics dashboard', async ({ page }) => {
    console.log('🔍 Testing Analytics page...');
    
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/09-analytics-initial.png', fullPage: true });
    
    // Test analytics filters and date pickers
    const dateInputs = page.locator('input[type="date"], .date-picker input').locator('visible=true');
    const dateCount = await dateInputs.count();
    for (let i = 0; i < dateCount; i++) {
      const dateInput = dateInputs.nth(i);
      console.log(`✅ Testing date input ${i + 1}`);
      await dateInput.click();
      await dateInput.fill('2024-06-01');
      await page.waitForTimeout(300);
    }
    
    // Test analytics metric cards
    const metricCards = page.locator('.metric, .stat, .analytics-card, [data-testid*="metric"]').locator('visible=true');
    const metricCount = await metricCards.count();
    console.log(`Found ${metricCount} analytics metrics`);
    
    for (let i = 0; i < Math.min(metricCount, 15); i++) {
      const metric = metricCards.nth(i);
      await metric.hover();
      await page.waitForTimeout(200);
    }
    
    // Test export buttons
    const exportButtons = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("PDF")');
    const exportCount = await exportButtons.count();
    for (let i = 0; i < exportCount; i++) {
      const button = exportButtons.nth(i);
      if (await button.isVisible()) {
        console.log(`✅ Testing export button: ${await button.textContent()}`);
        await button.hover();
        await page.waitForTimeout(300);
      }
    }
    
    await page.screenshot({ path: 'test-results/09-analytics-interactions.png', fullPage: true });
  });

  test('⚙️ Settings & Profile - Test user preferences', async ({ page }) => {
    console.log('🔍 Testing Settings and Profile...');
    
    // Try to find settings/profile pages
    const settingsRoutes = ['/settings', '/profile', '/account', '/preferences'];
    
    for (const route of settingsRoutes) {
      try {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        console.log(`✅ Testing settings page: ${route}`);
        await page.screenshot({ path: `test-results/10-settings-${route.replace('/', '')}.png`, fullPage: true });
        
        // Test common settings fields
        const settingsFields = [
          { selector: 'input[name="firstName"], input[name="first_name"]', value: testData.user.firstName },
          { selector: 'input[name="lastName"], input[name="last_name"]', value: testData.user.lastName },
          { selector: 'input[name="email"], input[type="email"]', value: testData.user.email },
          { selector: 'input[name="phone"], input[type="tel"]', value: testData.user.phone },
          { selector: 'input[name="company"]', value: testData.user.company },
          { selector: 'textarea[name="bio"], textarea[name="description"]', value: 'Test user bio for UI testing' }
        ];
        
        for (const field of settingsFields) {
          const input = page.locator(field.selector).first();
          if (await input.isVisible()) {
            console.log(`✅ Testing settings field: ${field.selector}`);
            await input.click();
            await input.clear();
            await input.fill(field.value);
            await page.waitForTimeout(300);
          }
        }
        
        // Test toggle switches and checkboxes
        const toggles = page.locator('input[type="checkbox"], .toggle, .switch').locator('visible=true');
        const toggleCount = await toggles.count();
        for (let i = 0; i < Math.min(toggleCount, 10); i++) {
          const toggle = toggles.nth(i);
          console.log(`✅ Testing toggle ${i + 1}`);
          await toggle.click();
          await page.waitForTimeout(300);
        }
        
        await page.screenshot({ path: `test-results/10-settings-${route.replace('/', '')}-filled.png`, fullPage: true });
        break;
      } catch (error) {
        console.log(`⚠️ Settings route not accessible: ${route}`);
      }
    }
  });

  test('🔍 Search and Navigation - Test global search and navigation', async ({ page }) => {
    console.log('🔍 Testing Global Search and Navigation...');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test global search if it exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], #globalSearch, .search-input').first();
    if (await searchInput.isVisible()) {
      console.log('✅ Testing global search...');
      await searchInput.click();
      await searchInput.fill('comprehensive ui test search query');
      await page.waitForTimeout(1000);
      
      // Check if search results appear
      const searchResults = page.locator('.search-results, .search-dropdown, .autocomplete').first();
      if (await searchResults.isVisible()) {
        console.log('✅ Search results appeared');
      }
    }
    
    // Test navigation breadcrumbs
    const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb" i]').locator('visible=true');
    const breadcrumbCount = await breadcrumbs.count();
    for (let i = 0; i < breadcrumbCount; i++) {
      const breadcrumb = breadcrumbs.nth(i);
      console.log(`✅ Testing breadcrumb ${i + 1}`);
      await breadcrumb.hover();
      await page.waitForTimeout(200);
    }
    
    // Test user menu/dropdown
    const userMenuTrigger = page.locator('.user-menu, .profile-menu, button[aria-label*="user" i], button[aria-label*="profile" i]').first();
    if (await userMenuTrigger.isVisible()) {
      console.log('✅ Testing user menu...');
      await userMenuTrigger.click();
      await page.waitForTimeout(500);
      
      const menuItems = page.locator('.menu-item, .dropdown-item').locator('visible=true');
      const itemCount = await menuItems.count();
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const item = menuItems.nth(i);
        console.log(`✅ Testing menu item ${i + 1}: ${await item.textContent()}`);
        await item.hover();
        await page.waitForTimeout(200);
      }
    }
    
    await page.screenshot({ path: 'test-results/11-navigation-search-test.png', fullPage: true });
  });

  test('📱 Responsive Design - Test mobile and tablet views', async ({ page, browserName }) => {
    console.log('🔍 Testing Responsive Design...');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/12-mobile-dashboard.png', fullPage: true });
    
    // Test mobile navigation (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], .hamburger, .menu-toggle').first();
    if (await mobileMenuButton.isVisible()) {
      console.log('✅ Testing mobile menu...');
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/12-mobile-menu-open.png', fullPage: true });
    }
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/campaigns');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/12-tablet-campaigns.png', fullPage: true });
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('🎨 Theme and Accessibility - Test dark mode and accessibility features', async ({ page }) => {
    console.log('🔍 Testing Theme and Accessibility...');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test theme toggle if it exists
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], .theme-toggle, .dark-mode-toggle').first();
    if (await themeToggle.isVisible()) {
      console.log('✅ Testing theme toggle...');
      await themeToggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/13-dark-theme.png', fullPage: true });
      
      // Toggle back to light theme
      await themeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    // Test keyboard navigation
    console.log('✅ Testing keyboard navigation...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: 'test-results/13-keyboard-navigation.png', fullPage: true });
    
    // Check for accessibility features
    const skipLinks = page.locator('a[href="#main"], .skip-link').locator('visible=true');
    if (await skipLinks.count() > 0) {
      console.log('✅ Skip links found for accessibility');
    }
    
    // Test focus indicators
    const focusableElements = page.locator('button, input, select, textarea, a[href]').locator('visible=true');
    const focusCount = await focusableElements.count();
    console.log(`Found ${focusCount} focusable elements`);
  });

});

test.describe('📋 Form Validation and Error Handling', () => {
  test('❌ Test form validation and error states', async ({ page }) => {
    console.log('🔍 Testing Form Validation...');
    
    // Test various forms with invalid data
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    const addClientButton = page.locator('button:has-text("Add Client"), button:has-text("Create Client")').first();
    if (await addClientButton.isVisible()) {
      await addClientButton.click();
      await page.waitForTimeout(1000);
      
      // Try to submit empty form
      const submitButton = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        console.log('✅ Testing empty form submission...');
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation errors
        const errorMessages = page.locator('.error, .invalid, [role="alert"], .field-error').locator('visible=true');
        const errorCount = await errorMessages.count();
        console.log(`Found ${errorCount} validation errors`);
        
        await page.screenshot({ path: 'test-results/14-form-validation-errors.png', fullPage: true });
      }
      
      // Test invalid email format
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailInput.isVisible()) {
        console.log('✅ Testing invalid email...');
        await emailInput.fill('invalid-email-format');
        await emailInput.blur();
        await page.waitForTimeout(500);
      }
      
      // Test invalid phone format
      const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
      if (await phoneInput.isVisible()) {
        console.log('✅ Testing invalid phone...');
        await phoneInput.fill('invalid-phone');
        await phoneInput.blur();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ path: 'test-results/14-form-validation-invalid-data.png', fullPage: true });
    }
  });
});

// Export test results summary
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ 
      path: `test-results/FAILED-${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`, 
      fullPage: true 
    });
  }
});