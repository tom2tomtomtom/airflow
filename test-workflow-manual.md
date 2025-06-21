# Manual UI Testing Workflow

## Current Status
- ✅ **Authentication**: Working (tomh@redbaez.com)
- ✅ **Flow Page**: Loading successfully
- ✅ **API Endpoints**: Responding correctly
- ✅ **CSRF Protection**: Fixed and working
- ✅ **403 Error**: RESOLVED

## Test Environment
- **URL**: http://localhost:3000/flow
- **Test File**: `/Users/thomasdowuona-hyde/Downloads/RedBaez Project Brief Template_  28_10_24 (2).docx`
- **Browser**: Open and ready for testing

## Phase 1: Brief Upload and Processing Testing

### Step 1: Verify Workflow Modal is Open
- [x] Navigate to http://localhost:3000/flow
- [x] Confirm page loads successfully
- [ ] **MANUAL TEST**: Verify workflow modal is visible
- [ ] **MANUAL TEST**: Check for drag-and-drop area
- [ ] **MANUAL TEST**: Verify UI elements are properly styled (Material-UI)

### Step 2: Test Brief Upload
- [ ] **MANUAL TEST**: Drag RedBaez brief file to upload area
- [ ] **MANUAL TEST**: Verify file is accepted and upload starts
- [ ] **MANUAL TEST**: Monitor for any 403 errors (should be fixed)
- [ ] **MANUAL TEST**: Verify upload progress indicator

### Step 3: Test Brief Processing
- [ ] **MANUAL TEST**: Verify brief processing starts automatically
- [ ] **MANUAL TEST**: Check processing status indicators
- [ ] **MANUAL TEST**: Verify brief content is parsed and displayed
- [ ] **MANUAL TEST**: Check that parsed content uses Material-UI styling

### Step 4: Test Brief Review
- [ ] **MANUAL TEST**: Verify brief content is displayed correctly
- [ ] **MANUAL TEST**: Check that content is readable and well-formatted
- [ ] **MANUAL TEST**: Test brief confirmation/approval functionality
- [ ] **MANUAL TEST**: Proceed to next phase

## Phase 2: Motivations Generation and Selection Testing

### Step 1: Generate Motivations
- [ ] **MANUAL TEST**: Click "Generate Motivations" button
- [ ] **MANUAL TEST**: Verify API call is made successfully
- [ ] **MANUAL TEST**: Check that motivations are generated

### Step 2: Verify Motivation Quality
- [ ] **MANUAL TEST**: Verify motivations are specific to brief content
- [ ] **MANUAL TEST**: Ensure motivations are NOT generic
- [ ] **MANUAL TEST**: Check that motivations relate to RedBaez brief content

### Step 3: Test Motivation Selection
- [ ] **MANUAL TEST**: Select multiple motivations
- [ ] **MANUAL TEST**: Verify selection state updates correctly
- [ ] **MANUAL TEST**: Proceed to copy generation

## Phase 3: Copy Generation Testing

### Step 1: Generate Copy
- [ ] **MANUAL TEST**: Trigger copy generation
- [ ] **MANUAL TEST**: Verify API call is successful
- [ ] **MANUAL TEST**: Check that copy is generated

### Step 2: Verify Copy Quality
- [ ] **MANUAL TEST**: Verify copy relates to brief content
- [ ] **MANUAL TEST**: Verify copy relates to selected motivations
- [ ] **MANUAL TEST**: Check that copy is grouped with 3 options per motivation

### Step 3: Test Copy Selection
- [ ] **MANUAL TEST**: Select preferred copy variations
- [ ] **MANUAL TEST**: Verify copy is stored in assets library

## Phase 4: Asset Management Integration Testing

### Step 1: Access Asset Library
- [ ] **MANUAL TEST**: Navigate to asset management
- [ ] **MANUAL TEST**: Verify stored copy assets are visible
- [ ] **MANUAL TEST**: Test asset organization

### Step 2: Upload Additional Assets
- [ ] **MANUAL TEST**: Upload additional assets (images, videos)
- [ ] **MANUAL TEST**: Verify asset upload functionality
- [ ] **MANUAL TEST**: Test asset categorization

### Step 3: Asset Selection
- [ ] **MANUAL TEST**: Select assets for workflow
- [ ] **MANUAL TEST**: Verify asset selection confirmation

## Phase 5: Template Selection and Configuration Testing

### Step 1: Browse Templates
- [ ] **MANUAL TEST**: Access template library
- [ ] **MANUAL TEST**: Browse available templates
- [ ] **MANUAL TEST**: Verify template options are displayed

### Step 2: Template Selection
- [ ] **MANUAL TEST**: Select appropriate template
- [ ] **MANUAL TEST**: Configure template settings
- [ ] **MANUAL TEST**: Verify template integrates with assets

## Phase 6: Matrix Setup and Content Planning Testing

### Step 1: Access Content Matrix
- [ ] **MANUAL TEST**: Navigate to content matrix
- [ ] **MANUAL TEST**: Verify matrix interface loads

### Step 2: Content Organization
- [ ] **MANUAL TEST**: Pull selected assets into matrix
- [ ] **MANUAL TEST**: Organize content structure
- [ ] **MANUAL TEST**: Set up content relationships

## Phase 7: Final Execution and Rendering Testing

### Step 1: Execution Preparation
- [ ] **MANUAL TEST**: Validate all inputs
- [ ] **MANUAL TEST**: Prepare for rendering

### Step 2: Final Execution
- [ ] **MANUAL TEST**: Execute complete workflow
- [ ] **MANUAL TEST**: Monitor rendering process
- [ ] **MANUAL TEST**: Verify final output

## Issues to Watch For

### Critical Issues
1. **403 Errors**: Should be resolved with CSRF fix
2. **Authentication Problems**: Monitor for session issues
3. **API Failures**: Watch for any endpoint failures

### UI Issues
1. **Styling Inconsistencies**: Material-UI vs Tailwind conflicts
2. **Missing Navigation**: Create Client page not linked
3. **Responsive Design**: Test on different screen sizes

### Workflow Issues
1. **Generic Motivations**: Ensure motivations are specific to brief
2. **Copy Quality**: Verify copy relates to both brief and motivations
3. **Asset Integration**: Test asset upload and selection

## Testing Notes
- Monitor terminal output for any errors
- Check browser console for JavaScript errors
- Verify all API calls complete successfully
- Test each phase thoroughly before proceeding
- Document any issues found for immediate fixing

## Next Steps After Testing
1. Document all found issues
2. Prioritize critical bugs
3. Fix issues systematically
4. Re-test fixed functionality
5. Continue with remaining phases
