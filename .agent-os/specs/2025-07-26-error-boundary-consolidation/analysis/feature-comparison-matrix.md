# ErrorBoundary Feature Comparison Matrix

> Analysis Date: 2025-07-26
> Status: Complete
> Total Implementations: 4

## Overview

This document provides a detailed comparison of the 4 existing ErrorBoundary implementations found in the AIRWAVE codebase, identifying their unique features, common patterns, and areas for consolidation.

## Feature Matrix

| Feature | components/ErrorBoundary.tsx | components/error/ErrorBoundary.tsx | components/workflow/ErrorBoundary.tsx | components/ui/ErrorBoundary/ErrorBoundary.tsx |
|---------|------------------------------|-----------------------------------|-------------------------------------|---------------------------------------------|
| **Lines of Code** | 216 | 369 | 328 | 364 |
| **Error State Management** | ✅ (hasError, error, errorInfo, errorId) | ✅ (hasError, error, errorInfo, eventId) | ✅ (hasError, error, errorInfo, errorId) | ✅ (hasError, error, errorInfo, errorId, showDetails) |
| **Custom Fallback Support** | ✅ ReactNode | ✅ ComponentType<ErrorFallbackProps> | ✅ ReactNode | ✅ ComponentType<ErrorFallbackProps> |
| **Error ID Generation** | ✅ ERR_{timestamp}_{random} | ✅ err_{timestamp}_{random} | ✅ error_{timestamp}_{random} | ✅ error-{timestamp}-{random} |
| **Material-UI Integration** | ✅ Full (Paper, Container, Typography) | ✅ Full (Box, Typography, Button) | ✅ Full (Paper, Accordion, Alert) | ✅ Full (Paper, Collapse, Alert) |
| **Development Error Details** | ✅ Alert with pre-formatted text | ✅ Alert with styled pre blocks | ✅ Accordion with collapsible details | ✅ Collapsible with formatted pre |
| **Error Reporting** | ✅ errorReporter + Sentry | ✅ API endpoint + optional Sentry | ✅ Sanitized reporting (TODO) | ✅ Sentry integration |
| **Reset Functionality** | ✅ Manual (handleReset) | ✅ Manual (resetError) | ✅ Manual (handleRetry) | ✅ Manual + resetKeys + resetOnPropsChange |
| **Navigation Actions** | ✅ Try Again, Go Home | ✅ Try Again, Reload, Go Home, Report Error | ✅ Try Again, Go Home, Report Bug | ✅ Try Again, Go Home (page level only) |
| **HOC Pattern** | ✅ withErrorBoundary | ✅ withErrorBoundary | ✅ withErrorBoundary | ✅ withErrorBoundary |
| **Hook Support** | ❌ | ✅ useErrorHandler | ✅ useErrorHandler | ✅ useErrorHandler |
| **Specialized Components** | ❌ | ✅ FeatureErrorBoundary | ❌ | ❌ |
| **Context Awareness** | ❌ | ❌ | ✅ context prop | ❌ |
| **Error Sanitization** | ❌ | ❌ | ✅ Production sanitization | ❌ |
| **Level-based UI** | ❌ | ❌ | ❌ | ✅ page/section/component levels |
| **Props Change Reset** | ❌ | ❌ | ❌ | ✅ resetOnPropsChange |
| **Reset Keys** | ❌ | ❌ | ❌ | ✅ resetKeys array |
| **Isolation Support** | ❌ | ✅ isolate prop | ❌ | ✅ isolate prop |
| **Email Bug Reporting** | ❌ | ✅ Email client integration | ✅ Email client integration | ❌ |
| **Progressive Disclosure** | ❌ | ❌ | ✅ Accordion for details | ✅ Collapse for details |

## Unique Features by Implementation

### 1. components/ErrorBoundary.tsx (Basic General Purpose)
**Unique Features:**
- Uses `errorReporter` utility for consistent reporting
- Container-based layout with Paper wrapper
- Simple, clean UI focused on core functionality
- Direct Sentry integration with contexts and tags

**Usage Context:** General application error handling (UnifiedProvider)

### 2. components/error/ErrorBoundary.tsx (Feature-focused)
**Unique Features:**
- `FeatureErrorBoundary` specialized component
- `useErrorHandler` hook for functional components
- Multiple action buttons (Try Again, Reload, Go Home, Report Error)
- Feature-specific error reporting via API endpoint
- Custom fallback component support with full props

**Usage Context:** Feature-level error boundaries with specialized handling

### 3. components/workflow/ErrorBoundary.tsx (Workflow-specific)
**Unique Features:**
- Production error message sanitization for security
- Context-aware error handling with context prop
- Accordion-based progressive disclosure of technical details
- Bug reporting via email with structured error information
- Sensitive pattern detection and sanitization

**Usage Context:** Workflow and multi-step process error handling

### 4. components/ui/ErrorBoundary/ErrorBoundary.tsx (Level-aware)
**Unique Features:**
- Level-based UI rendering (page, section, component)
- resetKeys array for automatic error boundary reset
- resetOnPropsChange for prop-based resets
- Level-aware styling and action availability
- Collapsible technical details with formatted pre blocks

**Usage Context:** UI component error handling with contextual presentation

## Common Patterns Identified

### Error State Structure (All Implementations)
```typescript
interface CommonState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string; // Various formats but all present
}
```

### Error Reporting Integration (All Implementations)
- All integrate with external error reporting services
- All provide development vs production behavior differences
- All generate unique error IDs for tracking
- All include contextual information in error reports

### Material-UI Usage (All Implementations)
- Paper/Box containers for error UI
- Typography for headings and messages
- Button components for actions
- Alert/Accordion components for details
- Icons for visual feedback

### Reset Mechanisms (All Implementations)
- Manual reset via button click
- State reset to initial values
- New error ID generation on reset

## Integration Analysis

### Current Usage Patterns

1. **Application Level:** `components/ErrorBoundary.tsx` used in `UnifiedProvider` for top-level error catching
2. **Feature Level:** `components/error/ErrorBoundary.tsx` used for feature-specific boundaries
3. **Workflow Level:** `components/workflow/ErrorBoundary.tsx` used in workflow contexts
4. **Component Level:** `components/ui/ErrorBoundary/ErrorBoundary.tsx` used for UI component errors

### Import Analysis
- **14 files** import ErrorBoundary components
- **Primary usage:** Video studio, templates, workflow contexts
- **HOC pattern** widely used across implementations
- **Hook pattern** available in 3 of 4 implementations

## Consolidation Opportunities

### 1. Unified Error State Management
All implementations use similar state structures that can be consolidated into a single, comprehensive state interface.

### 2. Consistent Error ID Generation
Standardize on a single error ID format across all implementations.

### 3. Unified Error Reporting Pipeline
Consolidate the various error reporting approaches (errorReporter, API endpoints, Sentry) into a single, configurable pipeline.

### 4. Combined UI Capabilities
Merge the best UI features from all implementations:
- Level-aware rendering from ui/ErrorBoundary
- Progressive disclosure from workflow/ErrorBoundary
- Multiple action buttons from error/ErrorBoundary
- Clean styling from components/ErrorBoundary

### 5. Comprehensive Reset Mechanisms
Combine all reset approaches:
- Manual reset (all implementations)
- resetKeys (ui/ErrorBoundary)
- resetOnPropsChange (ui/ErrorBoundary)
- Context-based reset triggers

### 6. Enhanced Context Awareness
Extend context awareness to support:
- Feature context (error/ErrorBoundary)
- Workflow context (workflow/ErrorBoundary)
- UI level context (ui/ErrorBoundary)

## Estimated Bundle Size Impact

### Current Total
- components/ErrorBoundary.tsx: 216 lines
- components/error/ErrorBoundary.tsx: 369 lines
- components/workflow/ErrorBoundary.tsx: 328 lines
- components/ui/ErrorBoundary/ErrorBoundary.tsx: 364 lines
- **Total:** 1,277 lines

### Projected Unified Implementation
- Unified ErrorBoundary component: ~450-500 lines
- Reduced duplicate patterns and shared utilities
- **Estimated Reduction:** ~600-700 lines (47-55% reduction)

## Recommendations for Consolidation

1. **Create UnifiedErrorBoundary** that combines the best features from all implementations
2. **Implement level-aware UI** with configurable presentation based on context
3. **Standardize error reporting** through a single, configurable pipeline
4. **Maintain backward compatibility** through configuration options
5. **Preserve specialized functionality** through props and configuration
6. **Implement comprehensive testing** to ensure no functionality is lost during consolidation

This analysis provides the foundation for implementing a single, unified ErrorBoundary component that incorporates the best features from all existing implementations while reducing code duplication and maintenance overhead.