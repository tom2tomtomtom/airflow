# AIrWAVE Comprehensive Testing Suite

This directory contains a comprehensive testing strategy for AIrWAVE that combines functional and UX validation. The tests ensure that features both **work correctly** and **feel good to use**.

## 🎯 Testing Philosophy

Our integrated testing approach validates:
- ✅ **Functionality**: Features work as expected
- ✅ **User Experience**: Features feel smooth and intuitive
- ✅ **Performance**: Features remain fast under realistic conditions
- ✅ **Accessibility**: Features work for all users
- ✅ **Cross-device**: Features work consistently across browsers and devices

## 📁 Directory Structure

```
tests/
├── e2e/                          # End-to-end integrated tests
│   ├── auth-flow-integrated.spec.ts
│   ├── asset-management-integrated.spec.ts
│   ├── campaign-matrix-integrated.spec.ts
│   ├── rendering-pipeline-integrated.spec.ts
│   ├── client-portal-integrated.spec.ts
│   └── airwave-comprehensive.spec.ts  # NEW: Complete workflow tests
├── pages/                        # Page Object Models
│   ├── auth-page.ts
│   ├── dashboard-page.ts
│   ├── assets-page.ts
│   ├── campaigns-page.ts
│   └── matrix-page.ts
├── helpers/                      # Testing utilities
│   └── test-utils.ts             # NEW: Comprehensive test helpers
├── utils/                        # Testing utilities
│   ├── auth-helper.ts
│   ├── file-helper.ts
│   ├── api-mock-helper.ts
│   ├── test-database.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
├── fixtures/                     # Test data and mocks
│   ├── test-assets.json
│   ├── api-mocks.json
│   └── test-campaigns.json
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all comprehensive tests
npm run test:comprehensive

# Run specific test suites
npm run test:auth         # Authentication flow tests
npm run test:assets       # Asset management tests
npm run test:campaigns    # Campaign and matrix tests
npm run test:rendering    # Rendering pipeline tests
npm run test:portal       # Client portal tests
npm run test:airwave      # NEW: Complete AIRWAVE workflow tests

# Run tests with different configurations
npm run test:mobile       # Mobile-specific tests
npm run test:performance  # Performance tests
npm run test:visual       # Visual regression tests
npm run test:accessibility # Accessibility tests

# Debug mode (headed browser)
npm run test:debug

# Generate test report
npm run test:report
```

## 🧪 Test Categories

### 1. Authentication Flow Tests
**File**: `e2e/auth-flow-integrated.spec.ts`

**Functional Testing**:
- Login/logout functionality
- User registration
- Password reset flows
- Session management
- MFA workflows

**UX Testing**:
- Login feels smooth and responsive
- Error messages are helpful and clear
- Loading states provide good feedback
- Mobile login is touch-friendly
- Keyboard navigation works seamlessly

### 2. Asset Management Tests
**File**: `e2e/asset-management-integrated.spec.ts`

**Functional Testing**:
- File upload (single and bulk)
- Asset search and filtering
- Asset organization and tagging
- File type validation
- Storage integration

**UX Testing**:
- Drag-and-drop feels intuitive
- Upload progress is clear and meaningful
- Search provides instant feedback
- Bulk operations are efficient
- Mobile upload is accessible

### 3. Campaign Matrix Tests
**File**: `e2e/campaign-matrix-integrated.spec.ts`

**Functional Testing**:
- Matrix creation and editing
- Asset assignment to matrix cells
- Combination generation
- Lock/unlock mechanisms
- Export functionality

**UX Testing**:
- Drag-and-drop feels responsive
- Visual feedback is immediate
- Complex workflows remain learnable
- Performance doesn't degrade with large matrices
- Mobile interactions work well

### 4. Rendering Pipeline Tests
**File**: `e2e/rendering-pipeline-integrated.spec.ts`

**Functional Testing**:
- Video render initiation
- Real-time progress tracking
- Webhook handling
- Error recovery
- Output file management

**UX Testing**:
- Progress updates feel real-time
- Users understand what's happening
- Errors provide clear guidance
- Long operations don't feel stuck
- Completion is satisfying

### 5. Client Portal Tests
**File**: `e2e/client-portal-integrated.spec.ts`

**Functional Testing**:
- Token-based access
- Asset review workflows
- Approval/rejection processes
- Feedback submission
- Email notifications

**UX Testing**:
- Portal is intuitive for non-technical users
- Review process feels smooth
- Feedback forms are accessible
- Mobile portal works well
- Navigation is clear

### 6. AIRWAVE Comprehensive Workflow Tests
**File**: `e2e/airwave-comprehensive.spec.ts`

**Complete End-to-End Testing**:
- Homepage and navigation validation
- Full authentication flow with real credentials
- Dashboard overview and navigation
- Client management (create, edit, delete)
- Asset management and upload workflows
- Campaign creation with multi-step builder
- AIRWAVE flow: Brief → Motivations → Copy → Video
- Video generation with Creatomate API integration
- API documentation validation
- Error handling and edge cases
- Performance and accessibility testing
- Cross-browser and mobile testing

**Real-World Integration**:
- Uses actual login credentials: `tomh@redbaez.com`
- Integrates with real Creatomate template
- Tests complete user workflows end-to-end
- Validates data persistence across pages
- Tests responsive design on multiple devices

**Test Configuration**:
```typescript
// Real Creatomate template integration
const TEST_CONFIG = {
  email: 'tomh@redbaez.com',
  password: 'Wijlre2010',
  creatomateTemplate: {
    templateId: '374ee9e3-de75-4feb-bfae-5c5e11d88d80',
    apiKey: '5ab32660fef044e5b135a646a78cff8ec7e2503b79e201bad7e566f4b24ec111f2fa7e01a824eaa77904c1783e083efa'
  }
};
```

**Running AIRWAVE Tests**:
```bash
# Run all AIRWAVE workflow tests
npm run test:airwave

# Run with browser UI (recommended)
npm run test:airwave:ui

# Run in headed mode (see browser)
npm run test:airwave:headed

# Debug mode (step-by-step)
npm run test:airwave:debug
```

## 🛠 Testing Utilities

### AuthHelper
Manages authentication flows and user sessions:
```typescript
const authHelper = new AuthHelper(page);
await authHelper.loginAs('admin');
await authHelper.switchToRole('client');
```

### FileHelper
Handles file upload testing:
```typescript
const fileHelper = new FileHelper(page);
const testFile = fileHelper.getFileByType('image', 'large');
await fileHelper.uploadFileByDragDrop(testFile, '[data-testid="dropzone"]');
```

### APIMockHelper
Mocks external API responses:
```typescript
const apiMockHelper = new APIMockHelper(page);
await apiMockHelper.setupDefaultMocks();
await apiMockHelper.applyScenario('networkError');
```

### TestDatabase
Manages test data setup and cleanup:
```typescript
const testDb = new TestDatabase();
await testDb.seedTestData();
const testClient = await testDb.getTestClient(1);
```

## 📊 Test Configuration

### Browser Matrix
Tests run across multiple browsers and devices:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome on Android, Safari on iOS
- **Tablet**: iPad Pro simulation

### Test Environments
- **Local Development**: `http://localhost:3000`
- **Staging**: Configured via `PLAYWRIGHT_TEST_BASE_URL`
- **Production**: Read-only tests only

### Performance Thresholds
- Page load time: < 3 seconds
- Search response: < 500ms
- Upload feedback: < 200ms
- Navigation: < 1 second

## 🎨 Visual Testing

Visual regression tests ensure UI consistency:
```bash
# Generate baseline screenshots
npm run test:visual:update

# Run visual regression tests
npm run test:visual
```

## ♿ Accessibility Testing

Accessibility tests ensure inclusive design:
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Touch target sizing
- ARIA labels and semantic markup

## 📈 Performance Testing

Performance tests validate speed under realistic conditions:
- Large asset libraries (1000+ items)
- Complex campaign matrices
- Concurrent user operations
- Network delay simulation
- Mobile device constraints

## 🔧 Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npx playwright test auth-flow-integrated.spec.ts

# Run specific test case
npx playwright test -g "login feels smooth"

# Run with debug mode
npx playwright test --debug auth-flow-integrated.spec.ts
```

### Test Artifacts
Failed tests generate:
- Screenshots
- Video recordings
- Network traces
- Console logs

### Common Issues

**Authentication Failures**:
```bash
# Clear auth state
rm -rf .auth/
npm run test:setup
```

**File Upload Issues**:
```bash
# Clear test files
rm -rf tests/fixtures/files/
```

**API Mock Problems**:
```bash
# Verify mock configuration
cat tests/fixtures/api-mocks.json
```

## 📋 Test Maintenance

### Adding New Tests
1. Create test file in appropriate directory
2. Use existing page objects when possible
3. Follow naming convention: `feature-integrated.spec.ts`
4. Include both functional and UX validation
5. Add mobile and accessibility considerations

### Updating Page Objects
1. Keep selectors in page objects, not tests
2. Use `data-testid` attributes for stability
3. Include helper methods for common workflows
4. Document expected behavior

### Mock Management
1. Keep mocks realistic and up-to-date
2. Use scenarios for different test conditions
3. Update mocks when APIs change
4. Test both success and failure cases

## 🚦 Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/test.yml
name: Comprehensive Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:comprehensive
```

### Test Reports
- HTML reports: `test-results/html-report/`
- JUnit XML: `test-results/junit.xml`
- JSON results: `test-results/results.json`

## 📞 Support

For testing issues or questions:
1. Check this README first
2. Review test artifacts in `test-results/`
3. Check existing test patterns
4. Create GitHub issue with test details

## 🎯 Success Metrics

Our comprehensive testing ensures:
- **95%+ test coverage** for critical user workflows
- **< 2% flaky test rate** for reliable CI/CD
- **Cross-browser compatibility** across all supported devices
- **Performance requirements met** under realistic load
- **Accessibility compliance** for inclusive design

This testing strategy gives us confidence that AIrWAVE not only works correctly but provides an excellent user experience across all scenarios.