# Comprehensive TypeScript Cleanup Strategy for AIrWAVE

## Current State Analysis
After running `npm run type-check`, we have **276 TypeScript errors** across the project.

## Error Categories Breakdown

### 1. **Unused Imports & Variables (TS6133)** - ~60% of errors
- Most common issue across the codebase
- Affects maintainability and bundle size
- Easy to fix with automated tools

### 2. **Type Mismatches** - ~20% of errors
- Optional properties assigned to required ones
- String | undefined assigned to string
- Missing type annotations causing implicit any

### 3. **Missing/Incorrect Types** - ~10% of errors
- Implicit any types (TS7006)
- Missing type annotations on function parameters
- Incorrect property types

### 4. **API & Configuration Issues** - ~5% of errors
- SUPABASE_SERVICE_KEY vs SUPABASE_SERVICE_ROLE_KEY mismatch
- Missing properties in type definitions
- Incorrect module imports

### 5. **Other Issues** - ~5% of errors
- Unused @ts-expect-error directives
- Missing return statements
- Property access errors

## Phased Cleanup Strategy

### Phase 1: Automated Fixes (Current)
- [x] Fix initial reported errors
- [ ] Configure ESLint with TypeScript rules
- [ ] Run automated fixes for unused imports
- [ ] Clean up unused variables

### Phase 2: Type Safety Improvements
- [ ] Fix all implicit any types
- [ ] Add proper type annotations
- [ ] Fix optional vs required property mismatches
- [ ] Update interfaces and type definitions

### Phase 3: API & Configuration
- [ ] Fix environment variable naming
- [ ] Update Supabase configuration
- [ ] Fix module import paths
- [ ] Update API type definitions

### Phase 4: Complex Type Issues
- [ ] Fix union type assignments
- [ ] Add type guards where needed
- [ ] Fix generic type constraints
- [ ] Update component prop types

### Phase 5: Testing & Validation
- [ ] Add type tests
- [ ] Update existing tests
- [ ] Validate all API contracts
- [ ] Ensure build passes

## Files with Most Errors (Priority Order)

1. **Pages Directory** (~150 errors)
   - execute.tsx
   - matrix.tsx
   - generate-enhanced.tsx
   - campaigns/[id].tsx
   - sign-off.tsx

2. **API Routes** (~40 errors)
   - api/auth/login.ts
   - api/dalle.ts
   - Various API endpoints

3. **Components** (~30 errors)
   - generate/ subdirectory
   - TemplateCard.tsx
   - Various UI components

4. **Core Libraries** (~20 errors)
   - lib/supabase.ts
   - lib/auth.ts
   - middleware/validation.ts

5. **Contexts & Services** (~15 errors)
   - contexts/ClientContext.tsx
   - services/creatomate.ts

## Recommended Tools & Configuration

### 1. ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### 2. Auto-fix Scripts
```bash
# Add to package.json
"scripts": {
  "lint:fix": "eslint . --ext .ts,.tsx --fix",
  "type:strict": "tsc --noEmit --strict",
  "cleanup:imports": "eslint . --fix --rule 'no-unused-vars: off, @typescript-eslint/no-unused-vars: error'"
}
```

### 3. Pre-commit Hooks
```bash
# Using husky and lint-staged
npm install --save-dev husky lint-staged
```

## Implementation Plan

### Week 1: Foundation
- Set up ESLint with TypeScript
- Run automated fixes for unused imports
- Fix all TS6133 errors (unused variables)
- Create PR for Phase 1

### Week 2: Type Safety
- Fix all implicit any types
- Add missing type annotations
- Fix optional/required mismatches
- Create PR for Phase 2

### Week 3: API & Complex Types
- Fix configuration issues
- Update API types
- Fix complex type errors
- Create PR for Phase 3 & 4

### Week 4: Testing & Finalization
- Update tests
- Ensure all builds pass
- Document type patterns
- Create final PR

## Success Metrics
- ✅ 0 TypeScript errors
- ✅ Strict mode enabled
- ✅ 100% type coverage
- ✅ Automated type checking in CI/CD
- ✅ Developer documentation updated

## Best Practices Going Forward
1. Enable strict TypeScript mode
2. Require type annotations for all functions
3. Use type guards for runtime validation
4. Regular type audits
5. Type-driven development approach
