import { test } from '@playwright/test';

/**
 * Campaign Matrix Testing
 * Tests campaign matrix creation and management functionality
 */

test.describe('Campaign Matrix Testing', () => {
  
  test('Test Campaign Matrix Page Access and Core Elements', async ({ page }) => {
    console.log('📊 Testing Campaign Matrix Page Access and Core Elements...');
    
    // Test multiple possible URLs for matrix/campaign functionality
    const matrixUrls = [
      'https://airwave-complete.netlify.app/matrix',
      'https://airwave-complete.netlify.app/campaign',
      'https://airwave-complete.netlify.app/campaigns'
    ];
    
    let accessibleUrl = null;
    
    for (const url of matrixUrls) {
      console.log(`🔍 Testing access to ${url}...`);
      
      await page.goto(url, { timeout: 30000, waitUntil: 'networkidle' });
      
      if (!page.url().includes('/login')) {
        accessibleUrl = url;
        console.log(`✅ Matrix page accessible at: ${url}`);
        break;
      } else {
        console.log(`🔒 ${url} requires authentication`);
      }
    }
    
    if (!accessibleUrl) {
      console.log('🔒 All matrix/campaign pages require authentication');
      
      // Take screenshot of login redirect
      await page.screenshot({ 
        path: 'test-results/matrix-page-login-redirect.png', 
        fullPage: true 
      });
      
      // Document comprehensive matrix testing plan
      console.log('📋 Campaign Matrix Testing Plan (requires authentication):');
      console.log('1. Matrix Creation Workflow');
      console.log('   - Create new campaign matrix');
      console.log('   - Import data from flow/strategy');
      console.log('   - Matrix templates and layouts');
      console.log('2. Matrix Management');
      console.log('   - Edit matrix cells and content');
      console.log('   - Add/remove campaigns');
      console.log('   - Organize by audience/platform');
      console.log('3. Data Integration');
      console.log('   - Flow brief data integration');
      console.log('   - Strategy alignment');
      console.log('   - Motivation-to-campaign mapping');
      console.log('4. Campaign Execution');
      console.log('   - Campaign preview and validation');
      console.log('   - Export to platforms (Meta, etc.)');
      console.log('   - Performance tracking setup');
      console.log('5. Collaboration Features');
      console.log('   - Client approval workflow');
      console.log('   - Comments and feedback');
      console.log('   - Version control');
      console.log('6. UI/UX Testing');
      console.log('   - Matrix visualization');
      console.log('   - Responsive design');
      console.log('   - Drag-and-drop functionality');
      console.log('   - Bulk operations');
      
      return;
    }
    
    // If we reach here, matrix page is accessible
    console.log('✅ Matrix page accessible - testing core elements');
    
    // Take screenshot of matrix page
    await page.screenshot({ 
      path: 'test-results/matrix-page-loaded.png', 
      fullPage: true 
    });
    
    // Test matrix page UI elements
    const matrixUI = {
      title: await page.title(),
      navigation: await page.locator('nav, .navbar, header nav').count(),
      matrixContainer: await page.locator('.matrix, .campaign-matrix, .grid, table').count(),
      createButton: await page.locator('button:has-text("Create"), button:has-text("New Campaign"), a:has-text("Add")').count(),
      campaignItems: await page.locator('.campaign, .campaign-item, .matrix-cell, td, .card').count(),
      filterControls: await page.locator('select, .filter, .dropdown, input[type="search"]').count(),
      exportButtons: await page.locator('button:has-text("Export"), button:has-text("Download")').count(),
      viewToggle: await page.locator('button:has-text("Grid"), button:has-text("List"), .view-toggle').count()
    };
    
    console.log('🔍 Campaign Matrix UI Elements:');
    Object.entries(matrixUI).forEach(([element, value]) => {
      console.log(`  ${element}: ${typeof value === 'string' ? value : value + ' elements'}`);
    });
    
    // Test matrix creation if available
    if (matrixUI.createButton > 0) {
      console.log('🎯 Testing matrix creation workflow...');
      
      const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign"), a:has-text("Add")').first();
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Check for matrix creation interface
      const creationInterface = {
        form: await page.locator('form, .creation-form, .matrix-form').count(),
        templateOptions: await page.locator('.template, .template-option, select[name*="template"]').count(),
        audienceFields: await page.locator('input[name*="audience"], select[name*="audience"]').count(),
        platformOptions: await page.locator('input[name*="platform"], .platform-option').count()
      };
      
      console.log('📋 Matrix Creation Interface:');
      Object.entries(creationInterface).forEach(([element, count]) => {
        console.log(`  ${element}: ${count} elements`);
      });
      
      // Take screenshot of creation interface
      await page.screenshot({ 
        path: 'test-results/matrix-creation-interface.png', 
        fullPage: true 
      });
    }
    
    // Test existing campaigns/matrix items
    if (matrixUI.campaignItems > 0) {
      console.log('📊 Testing existing matrix items...');
      
      const matrixItems = await page.locator('.campaign, .campaign-item, .matrix-cell, .card').all();
      console.log(`📈 Found ${matrixItems.length} matrix items`);
      
      if (matrixItems.length > 0) {
        // Test first matrix item
        const firstItem = matrixItems[0];
        const itemText = await firstItem.textContent();
        console.log(`📄 First matrix item: "${itemText?.substring(0, 100)}..."`);
        
        // Test item interaction
        await firstItem.click();
        await page.waitForTimeout(2000);
        
        console.log(`📍 After matrix item click: ${page.url()}`);
        
        // Take screenshot after item selection
        await page.screenshot({ 
          path: 'test-results/matrix-item-selected.png', 
          fullPage: true 
        });
      }
    }
    
    console.log('✅ Campaign matrix core elements testing completed');
  });

  test('Test Matrix Data Integration and Workflow', async ({ page }) => {
    console.log('🔄 Testing Matrix Data Integration and Workflow...');
    
    await page.goto('https://airwave-complete.netlify.app/matrix');
    
    if (page.url().includes('/login')) {
      console.log('🔒 Matrix requires authentication for workflow testing');
      
      // Test workflow integration plan
      console.log('🔄 Matrix Workflow Integration Plan:');
      console.log('1. Flow → Matrix Integration');
      console.log('   - Brief data import');
      console.log('   - Motivation mapping to campaigns');
      console.log('   - Copy variations organization');
      console.log('2. Strategy → Matrix Integration');
      console.log('   - Strategy alignment verification');
      console.log('   - Campaign strategy consistency');
      console.log('3. Matrix → Platform Integration');
      console.log('   - Meta platform export');
      console.log('   - Campaign setup automation');
      console.log('   - Performance tracking integration');
      
      return;
    }
    
    // Test data integration indicators
    console.log('📊 Testing data integration indicators...');
    
    const pageContent = await page.textContent('body');
    const integrationIndicators = {
      briefData: pageContent?.toLowerCase().includes('brief') || pageContent?.toLowerCase().includes('redbaez'),
      motivationData: pageContent?.toLowerCase().includes('motivation') || pageContent?.toLowerCase().includes('audience'),
      strategyData: pageContent?.toLowerCase().includes('strategy') || pageContent?.toLowerCase().includes('objective'),
      platformData: pageContent?.toLowerCase().includes('meta') || pageContent?.toLowerCase().includes('facebook'),
      copyData: pageContent?.toLowerCase().includes('copy') || pageContent?.toLowerCase().includes('headline')
    };
    
    console.log('🔍 Data Integration Indicators:');
    Object.entries(integrationIndicators).forEach(([indicator, found]) => {
      console.log(`  ${indicator}: ${found ? '✅ Found' : '❌ Not detected'}`);
    });
    
    // Test workflow navigation
    const workflowNavigation = {
      backToStrategy: await page.locator('a:has-text("Strategy"), button:has-text("Back")').count(),
      backToFlow: await page.locator('a:has-text("Flow"), .breadcrumb a').count(),
      toExecution: await page.locator('button:has-text("Execute"), button:has-text("Launch"), a:has-text("Deploy")').count(),
      toClients: await page.locator('a:has-text("Client"), button:has-text("Share")').count()
    };
    
    console.log('🧭 Workflow Navigation:');
    Object.entries(workflowNavigation).forEach(([nav, count]) => {
      console.log(`  ${nav}: ${count} elements`);
    });
    
    console.log('✅ Matrix workflow integration testing completed');
  });

  test('Test Matrix Responsive Design and Performance', async ({ page }) => {
    console.log('📱 Testing Matrix Responsive Design and Performance...');
    
    // Test different viewport sizes for matrix display
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 Testing Matrix on ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const startTime = Date.now();
      await page.goto('https://airwave-complete.netlify.app/matrix');
      const loadTime = Date.now() - startTime;
      
      console.log(`⏱️ ${viewport.name} load time: ${loadTime}ms`);
      
      if (page.url().includes('/login')) {
        console.log(`🔒 ${viewport.name}: Requires authentication`);
        
        // Test login page matrix context
        const loginContext = {
          formUsable: await page.locator('form').isVisible(),
          redirectPreserved: page.url().includes('matrix'),
          buttonsAccessible: await page.locator('button').count() > 0
        };
        
        console.log(`  Login context: ${JSON.stringify(loginContext)}`);
        
        // Take screenshot
        await page.screenshot({ 
          path: `test-results/matrix-login-${viewport.name.toLowerCase()}.png`, 
          fullPage: true 
        });
        
        continue;
      }
      
      // Test matrix responsiveness
      const matrixResponsive = {
        matrixVisible: await page.locator('.matrix, .campaign-matrix, .grid, table').isVisible(),
        scrollable: await page.evaluate(() => document.body.scrollHeight > window.innerHeight),
        horizontalScroll: await page.evaluate(() => document.body.scrollWidth > window.innerWidth),
        controlsAccessible: await page.locator('button, select, input').count() > 0
      };
      
      console.log(`  ${viewport.name} matrix responsive:`, matrixResponsive);
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/matrix-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Test matrix interaction on different screen sizes
      if (viewport.name === 'Mobile') {
        console.log('📱 Testing mobile matrix interactions...');
        
        const mobileInteractions = {
          touchFriendly: await page.locator('button, .clickable').count() > 0,
          swipeSupport: await page.locator('.swipeable, .carousel').count() > 0,
          mobileMenu: await page.locator('.mobile-menu, .hamburger').count() > 0
        };
        
        console.log('  Mobile interactions:', mobileInteractions);
      }
    }
    
    console.log('✅ Matrix responsive design testing completed');
  });

  test('Test Matrix Export and Platform Integration', async ({ page }) => {
    console.log('📤 Testing Matrix Export and Platform Integration...');
    
    await page.goto('https://airwave-complete.netlify.app/matrix');
    
    if (page.url().includes('/login')) {
      console.log('🔒 Matrix requires authentication for export testing');
      
      // Document export testing plan
      console.log('📤 Matrix Export Testing Plan:');
      console.log('1. Export Formats');
      console.log('   - CSV/Excel export');
      console.log('   - PDF campaign overview');
      console.log('   - JSON data export');
      console.log('2. Platform Integration');
      console.log('   - Meta Ads Manager export');
      console.log('   - Campaign setup automation');
      console.log('   - Asset package creation');
      console.log('3. Sharing Features');
      console.log('   - Client portal sharing');
      console.log('   - Team collaboration');
      console.log('   - Approval workflows');
      
      return;
    }
    
    // Test export functionality
    console.log('📊 Testing export functionality...');
    
    const exportFeatures = {
      exportButtons: await page.locator('button:has-text("Export"), button:has-text("Download")').count(),
      shareButtons: await page.locator('button:has-text("Share"), a:has-text("Share")').count(),
      formatOptions: await page.locator('select[name*="format"], .format-option').count(),
      platformIntegration: await page.locator('button:has-text("Meta"), button:has-text("Facebook"), .platform-export').count()
    };
    
    console.log('📤 Export Features:');
    Object.entries(exportFeatures).forEach(([feature, count]) => {
      console.log(`  ${feature}: ${count} elements`);
    });
    
    // Test export workflow if available
    if (exportFeatures.exportButtons > 0) {
      console.log('🎯 Testing export workflow...');
      
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();
      await exportButton.click();
      await page.waitForTimeout(2000);
      
      // Check for export options
      const exportOptions = {
        formatSelection: await page.locator('select, .format-option, input[type="radio"]').count(),
        downloadTrigger: await page.locator('button:has-text("Download"), a[download]').count(),
        previewOption: await page.locator('button:has-text("Preview"), .preview').count()
      };
      
      console.log('📋 Export Options:');
      Object.entries(exportOptions).forEach(([option, count]) => {
        console.log(`  ${option}: ${count} elements`);
      });
      
      // Take screenshot of export interface
      await page.screenshot({ 
        path: 'test-results/matrix-export-interface.png', 
        fullPage: true 
      });
    }
    
    // Test platform integration indicators
    const pageContent = await page.textContent('body');
    const platformIntegration = {
      metaIntegration: pageContent?.toLowerCase().includes('meta') || pageContent?.toLowerCase().includes('facebook'),
      apiConnections: pageContent?.toLowerCase().includes('api') || pageContent?.toLowerCase().includes('connect'),
      automationFeatures: pageContent?.toLowerCase().includes('automat') || pageContent?.toLowerCase().includes('sync')
    };
    
    console.log('🔗 Platform Integration:');
    Object.entries(platformIntegration).forEach(([integration, found]) => {
      console.log(`  ${integration}: ${found ? '✅ Found' : '❌ Not detected'}`);
    });
    
    console.log('✅ Matrix export and platform integration testing completed');
  });
});
