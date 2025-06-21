# AIRWAVE UnifiedBriefWorkflow Remediation Plan - Complete Reference

## 🎯 **CRITICAL ISSUES IDENTIFIED**

### **Current State: UnifiedBriefWorkflow.tsx (1,234 lines)**
- ❌ **Monolithic Component**: 1,234 lines, unmaintainable
- ❌ **State Management Chaos**: 11+ useState hooks causing race conditions
- ❌ **Hardcoded Values**: `clientId: 'default-client'`, template IDs
- ❌ **No Cost Control**: Unlimited AI spending, no budget enforcement
- ❌ **Broken Asset Integration**: Placeholder buttons, no real functionality
- ❌ **Missing Video Templates**: Hardcoded strings, no Creatomate integration
- ❌ **Poor Error Handling**: Inconsistent patterns, no recovery
- ❌ **No Testing**: Zero test coverage, no validation
- ❌ **No Monitoring**: No performance tracking, no alerting

## 📋 **6-PHASE REMEDIATION PLAN (12 Weeks)**

### **Phase 1: Critical Architecture Fixes (Weeks 1-2)**
**Priority: CRITICAL**

#### **1.1 Component Decomposition**
- Split 1,234-line component into 7 focused components (<200 lines each)
- Create: `src/components/workflow/`
  - `WorkflowProvider.tsx` - State management
  - `WorkflowContainer.tsx` - Main container
  - `steps/BriefUploadStep.tsx`
  - `steps/MotivationSelectionStep.tsx`
  - `steps/CopyGenerationStep.tsx`
  - `steps/AssetSelectionStep.tsx`
  - `steps/TemplateSelectionStep.tsx`
  - `steps/MatrixBuildStep.tsx`
  - `steps/RenderStep.tsx`

#### **1.2 XState Machine Implementation**
- Replace 11+ useState with proper state machine
- Create: `src/lib/workflow/workflow-machine.ts`
- States: upload → review → motivations → copy → assets → template → matrix → render

#### **1.3 Client Context Integration**
- Fix hardcoded `clientId: 'default-client'`
- Create: `src/contexts/ClientContext.tsx`
- Proper UUID-based client management

### **Phase 2: Asset Integration & Generation (Weeks 3-4)**

#### **2.1 Asset Selection Implementation**
- Replace placeholder buttons with functional `AssetBrowser`
- Integrate existing `AIImageGenerator` component
- Create: `src/components/workflow/steps/AssetSelectionStep.tsx`

#### **2.2 AI Image Generation**
- Generate images based on brief content and motivations
- Create: `src/components/AIAssetGenerator.tsx`
- Integration with cost control system

#### **2.3 Real Creatomate Integration**
- Replace hardcoded template names with actual Creatomate API
- Create: `src/services/creatomate.ts`
- Template selection based on brief data

### **Phase 3: API Standardization & Error Handling (Weeks 5-6)**

#### **3.1 API v2 Universal Router**
- Create: `src/pages/api/v2/[...route].ts`
- Middleware pipeline: auth → rate-limit → validation → cost-tracking
- Endpoints: `/workflow/*`, `/ai/*`, `/assets/*`, `/monitoring/*`

#### **3.2 Comprehensive Error Handling**
- Create: `src/lib/api/middleware/error-handler.ts`
- Standardized error codes and responses
- Error boundaries for all workflow steps

#### **3.3 Input Validation & Sanitization**
- Zod schemas for all API inputs
- Create: `src/lib/validation/schemas.ts`
- DOMPurify for user input sanitization

### **Phase 4: Performance & Component Optimization (Weeks 7-8)**

#### **4.1 Lazy Loading & Code Splitting**
- Implement React.lazy() for all step components
- Suspense with skeleton loading states
- Bundle size optimization

#### **4.2 Performance Monitoring**
- Create: `src/lib/monitoring/performance-tracker.ts`
- StatsD + Sentry integration
- Real-time performance dashboards

#### **4.3 State Management Optimization**
- Optimized React context with useMemo
- Reduced re-renders and memory usage

### **Phase 5: Quality & Testing Infrastructure (Weeks 9-10)**

#### **5.1 Comprehensive Testing Suite**
- Integration tests with MSW mocking
- Create: `__tests__/integration/workflow.test.tsx`
- Unit tests for cost controllers
- 80% test coverage target

#### **5.2 Quality Gates**
- GitHub Actions workflow validation
- Pre-commit hooks for security scanning
- Bundle size monitoring

### **Phase 6: Documentation & Process Integration (Weeks 11-12)**

#### **6.1 API Documentation**
- Complete API v2 documentation
- Create: `docs/API_V2_GUIDE.md`
- SDK examples and migration guides

#### **6.2 Development Guidelines**
- Component architecture standards
- Performance requirements
- Error handling patterns

## 🔧 **KEY COMPONENTS IMPLEMENTED**

### **1. AI Cost Control System**
```typescript
// src/lib/ai/cost-control-system.ts
export class AICostController {
  async checkBudget(service, model, tokens, userId): Promise<{
    allowed: boolean;
    fallbackModel?: string;
    budgetRemaining: number;
  }>;
}
```

### **2. API v2 Architecture**
```typescript
// src/pages/api/v2/[...route].ts
const router = createRouter({ version: 'v2' });
router.use(errorHandler, authenticate, rateLimit);
router.post('/workflow/upload-brief', withMiddleware([validateInput, costTracking], handler));
```

### **3. Performance Monitoring**
```typescript
// src/lib/monitoring/performance-tracker.ts
export class PerformanceTracker {
  startOperation(name: string): OperationTimer;
  getMetrics(operation?: string): AggregatedMetrics;
}
```

### **4. Component Architecture**
```typescript
// src/components/workflow/WorkflowProvider.tsx
export function WorkflowProvider({ children }) {
  const service = useInterpret(() => createWorkflowMachine(user?.id));
  // XState machine with React context
}
```

## 📊 **SUCCESS METRICS**

### **Phase Completion Criteria**
| Phase | Success Criteria | Validation Method |
|-------|------------------|-------------------|
| Phase 1 | Component split (<500 lines each) | Bundle analyzer |
| Phase 2 | Asset generation functional | Integration tests |
| Phase 3 | API v2 operational | Endpoint testing |
| Phase 4 | Performance optimized | Lighthouse >90 |
| Phase 5 | 80% test coverage | Coverage reports |
| Phase 6 | Documentation complete | Team onboarding |

### **Production Readiness Targets**
- **Performance**: <2s page load, <500ms API response
- **Reliability**: 99.9% uptime, comprehensive error handling
- **Security**: No hardcoded secrets, input validation
- **Cost Control**: Budget enforcement, real-time tracking
- **Maintainability**: Component architecture, documentation

## 🚀 **NEXT STEPS FOR IMPLEMENTATION**

### **To Resume Work:**
1. **Review Current State**: Check existing UnifiedBriefWorkflow.tsx
2. **Choose Phase**: Start with Phase 1 (Critical Architecture Fixes)
3. **Set Up Environment**: Ensure dev environment ready
4. **Begin Implementation**: Follow phase-specific tasks
5. **Validate Progress**: Use success criteria for each phase

### **Key Files to Reference:**
- `src/components/UnifiedBriefWorkflow.tsx` (current monolith)
- `src/lib/ai/cost-control-system.ts` (cost control)
- `scripts/emergency-security-fix.ts` (security audit)
- This document for complete plan overview

### **Implementation Priority:**
1. **Phase 1** - Critical (fixes fundamental architecture)
2. **Phase 3** - High (API standardization)
3. **Phase 2** - High (asset integration)
4. **Phase 4** - Medium (performance)
5. **Phase 5** - Medium (testing)
6. **Phase 6** - Low (documentation)

---

**Status**: Plan Complete, Ready for Implementation
**Total Effort**: 12 weeks, 6 phases
**Expected Outcome**: Production-ready workflow system
