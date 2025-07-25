# Current ErrorBoundary Usage Mapping

> Analysis Date: 2025-07-26
> Status: Complete
> Usage Files Analyzed: 14

## Overview

This document maps the current usage patterns of all 4 ErrorBoundary implementations across the AIRWAVE codebase, providing detailed context for migration planning and compatibility requirements.

## Usage Summary by Implementation

### 1. components/ErrorBoundary.tsx
**Primary Usage:** Application-level error boundary
**Import Count:** 3 direct imports + HOC usage

**Key Usage Locations:**
- `src/contexts/UnifiedProvider.tsx` - Application root error boundary
- `src/components/__tests__/ErrorBoundary.test.tsx` - Test coverage
- Direct imports in various components

**Usage Pattern:**
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

// Application-level wrapping
<ErrorBoundary>{children}</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={customFallback}>{children}</ErrorBoundary>
```

### 2. components/error/ErrorBoundary.tsx  
**Primary Usage:** Feature-specific error boundaries
**Import Count:** 8 imports including specialized components

**Key Usage Locations:**
- `src/pages/templates.tsx` - Feature-level error handling
- `src/components/workflow/WorkflowProvider.tsx` - Workflow error handling
- Multiple component imports for FeatureErrorBoundary

**Usage Patterns:**
```typescript
import { ErrorBoundary, FeatureErrorBoundary, useErrorHandler } from '@/components/error/ErrorBoundary';

// Feature-specific boundaries
<FeatureErrorBoundary feature="video-processing">
  {children}
</FeatureErrorBoundary>

// General error boundary with callbacks
<ErrorBoundary onError={handleError}>
  {children}
</ErrorBoundary>

// Hook usage in functional components
const handleError = useErrorHandler();
```

### 3. components/workflow/ErrorBoundary.tsx
**Primary Usage:** Workflow-specific error handling
**Import Count:** 2 imports + HOC pattern

**Key Usage Locations:**
- `src/components/workflow/steps/BriefUploadStep.tsx` - Step-level error boundary
- Workflow-related components requiring context-aware error handling

**Usage Pattern:**
```typescript
import { WorkflowErrorBoundary, withErrorBoundary } from '@/components/workflow/ErrorBoundary';

// Context-aware workflow errors
<WorkflowErrorBoundary context="brief-upload" showDetails={isDev}>
  {children}
</WorkflowErrorBoundary>

// HOC pattern for workflow components
const SafeComponent = withErrorBoundary(Component, 'workflow-context');
```

### 4. components/ui/ErrorBoundary/ErrorBoundary.tsx
**Primary Usage:** UI component error handling
**Import Count:** 1 direct import + test usage

**Key Usage Locations:**
- `src/__tests__/components/ui/ErrorBoundary/ErrorBoundary.test.tsx` - Test coverage
- Limited direct usage in UI components

**Usage Pattern:**
```typescript
import ErrorBoundary from '@/components/ui/ErrorBoundary/ErrorBoundary';

// Level-aware error boundary
<ErrorBoundary 
  level="section" 
  resetKeys={[userId, dataVersion]}
  resetOnPropsChange
>
  {children}
</ErrorBoundary>
```

## Detailed Usage Analysis

### Application Architecture Integration

#### UnifiedProvider Integration
**File:** `src/contexts/UnifiedProvider.tsx`
**Lines:** 41
**Implementation:** components/ErrorBoundary.tsx

```typescript
function UIProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = getThemeConfig(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <LoadingProvider>
          <NotificationProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </NotificationProvider>
        </LoadingProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
```

**Analysis:** This is the root-level error boundary that catches all unhandled errors in the application. It uses the basic ErrorBoundary implementation with default Material-UI styling.

#### Video Studio Integration
**File:** `src/pages/video-studio.tsx`
**Lines:** 25
**Implementation:** Custom VideoStudioSectionBoundary

```typescript
import { VideoStudioSectionBoundary } from '@/components/video-studio/ErrorBoundary';

// Used for section-level error handling in video studio
<VideoStudioSectionBoundary>
  <VideoTemplateSelector />
</VideoStudioSectionBoundary>
```

**Analysis:** Uses a specialized error boundary for video studio sections, indicating need for context-specific error handling.

### Workflow Integration Patterns

#### WorkflowProvider Integration
**File:** `src/components/workflow/WorkflowProvider.tsx`
**Implementation:** components/error/ErrorBoundary.tsx

**Usage Pattern:**
```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary 
  onError={(error, errorInfo) => {
    // Custom workflow error handling
    logWorkflowError(error, currentStep, workflowId);
  }}
>
  <WorkflowSteps />
</ErrorBoundary>
```

**Analysis:** Integrates with workflow state management for context-aware error reporting and recovery.

#### Step-Level Error Boundaries
**File:** `src/components/workflow/steps/BriefUploadStep.tsx`
**Implementation:** components/workflow/ErrorBoundary.tsx

**Usage Pattern:**
```typescript
import { WorkflowErrorBoundary } from '@/components/workflow/ErrorBoundary';

<WorkflowErrorBoundary 
  context="brief-upload"
  showDetails={process.env.NODE_ENV === 'development'}
>
  <FileUploadComponent />
</WorkflowErrorBoundary>
```

**Analysis:** Step-specific error boundaries with context information for better error reporting and user guidance.

### Feature-Level Integration

#### Templates Page Integration
**File:** `src/pages/templates.tsx`
**Implementation:** components/error/ErrorBoundary.tsx

**Usage Pattern:**
```typescript
import { FeatureErrorBoundary } from '@/components/error/ErrorBoundary';

<FeatureErrorBoundary feature="template-library">
  <TemplateGrid />
</FeatureErrorBoundary>
```

**Analysis:** Feature-specific error boundaries that provide targeted error messages and recovery options.

## Integration Dependencies

### External Service Integration

#### Error Reporting Services
All implementations integrate with:
1. **Sentry** - For production error tracking
2. **Logger Service** - For structured logging
3. **errorReporter Utility** - For custom error reporting pipeline

#### UI Framework Dependencies
All implementations use:
1. **Material-UI Components** - Paper, Typography, Button, Alert, etc.
2. **Material-UI Icons** - Error icons, action icons
3. **Material-UI Theming** - Consistent styling across error UIs

### State Management Integration

#### Context Integration
- **ThemeContext** - For theme-aware error UI styling
- **NotificationContext** - For error notifications
- **WorkflowContext** - For workflow-specific error handling
- **ClientContext** - For client-specific error reporting

#### Hook Integration
- **useErrorHandler** - Custom hook for programmatic error handling
- **useThemeMode** - For theme-aware error UI
- **useNotification** - For error notifications

## Migration Impact Analysis

### High-Impact Changes
1. **UnifiedProvider** - Core application error boundary, affects all users
2. **Video Studio** - High-traffic feature with specialized error handling
3. **Workflow Steps** - Critical user workflows with context-specific error handling

### Medium-Impact Changes
1. **Templates Page** - Feature-specific error boundary
2. **WorkflowProvider** - Workflow-level error handling

### Low-Impact Changes
1. **Test Files** - Require test updates but no user impact
2. **Utility Imports** - Internal code organization changes

## Compatibility Requirements

### API Compatibility
Must maintain compatibility for:

1. **Basic ErrorBoundary Props**
   ```typescript
   interface BasicProps {
     children: ReactNode;
     fallback?: ReactNode;
   }
   ```

2. **FeatureErrorBoundary Props**
   ```typescript
   interface FeatureProps {
     children: ReactNode;
     feature: string;
   }
   ```

3. **WorkflowErrorBoundary Props**
   ```typescript
   interface WorkflowProps {
     children: ReactNode;
     context?: string;
     showDetails?: boolean;
     onError?: (error: Error, errorInfo: ErrorInfo) => void;
   }
   ```

4. **UI ErrorBoundary Props**
   ```typescript
   interface UIProps {
     children: ReactNode;
     level?: 'page' | 'section' | 'component';
     resetKeys?: Array<string | number>;
     resetOnPropsChange?: boolean;
   }
   ```

### HOC Pattern Compatibility
All implementations provide `withErrorBoundary` HOC:
```typescript
const SafeComponent = withErrorBoundary(Component, options);
```

### Hook Pattern Compatibility
Multiple implementations provide `useErrorHandler` hook:
```typescript
const handleError = useErrorHandler();
```

## Migration Strategy Recommendations

### Phase 1: Create Unified Component
1. Implement unified ErrorBoundary with all features
2. Support all existing prop interfaces through configuration
3. Maintain backward compatibility for all usage patterns

### Phase 2: Update High-Impact Usages
1. Update UnifiedProvider to use new ErrorBoundary
2. Update Video Studio error boundaries
3. Update Workflow error boundaries
4. Test thoroughly at each step

### Phase 3: Update Remaining Usages
1. Update Templates page and other feature boundaries
2. Update test files
3. Update any remaining imports

### Phase 4: Cleanup
1. Remove old ErrorBoundary files
2. Update import references
3. Verify no remaining usage of old implementations

## Testing Requirements

### Integration Testing
Must verify:
1. **Application-level error catching** - UnifiedProvider integration
2. **Feature-level error handling** - Feature boundaries work correctly
3. **Workflow-level context preservation** - Workflow context maintained
4. **UI-level responsiveness** - Level-aware styling works

### Compatibility Testing
Must verify:
1. **Existing error scenarios** - All current error handling still works
2. **Custom fallback components** - Custom UI components still render
3. **Error reporting integration** - Sentry, logger, errorReporter still work
4. **HOC pattern** - withErrorBoundary still works correctly
5. **Hook pattern** - useErrorHandler still works correctly

### Performance Testing
Must verify:
1. **Bundle size reduction** - Confirming ~600-700 line reduction
2. **Runtime performance** - No performance degradation
3. **Error reporting performance** - Error reporting doesn't slow down app

## Success Criteria

### Functional Success
- [ ] All existing error scenarios handled correctly
- [ ] All integration points work without changes
- [ ] No regression in error handling capability
- [ ] Improved consistency across error boundaries

### Performance Success
- [ ] Bundle size reduced by 600-700 lines
- [ ] No performance degradation
- [ ] Error reporting performance maintained or improved

### Maintainability Success
- [ ] Single source of truth for error boundary logic
- [ ] Consistent API across all use cases
- [ ] Simplified testing and debugging
- [ ] Easier to add new features and configurations

This usage mapping provides the foundation for safe migration planning and ensures no functionality is lost during the consolidation process.