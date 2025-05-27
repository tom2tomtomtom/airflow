# Complete TypeScript Error Fix Guide for AIrWAVE

This guide provides a comprehensive solution to fix all TypeScript errors in the AIrWAVE project.

## Current State
- **Initial errors**: 276
- **After Phase 3**: ~110 remaining
- **Error categories**:
  - Unused declarations: 207 (75%)
  - Type mismatches: 18
  - Implicit any types: 17
  - Missing properties: 10
  - Other errors: 24

## Quick Fix Instructions

### Step 1: Run the Complete Fix Script

```bash
# Make the script executable
chmod +x fix-typescript-complete.sh

# Run the complete fix
./fix-typescript-complete.sh
```

This script will:
1. Install dependencies
2. Run automated TypeScript fixes
3. Count remaining errors
4. Run ESLint auto-fixes
5. Generate an error report
6. Create a stricter TypeScript config for future migration

### Step 2: Run Individual Fix Commands

If you prefer to run fixes step by step:

```bash
# 1. Fix all TypeScript errors automatically
npm run fix:typescript:all

# 2. Count remaining errors
npm run count:errors

# 3. Run ESLint fixes
npx eslint . --fix --ext .ts,.tsx

# 4. Check for remaining errors
npm run type-check
```

## What the Automated Fixes Do

### 1. **Unused Import Removal**
- Automatically removes all unused imports from files
- Cleans up empty import statements
- Preserves used imports

### 2. **Common Pattern Fixes**
- Adds `NextApiRequest` and `NextApiResponse` types to API handlers
- Fixes `SUPABASE_SERVICE_KEY` typo to `SUPABASE_SERVICE_ROLE_KEY`
- Adds `any` type to `useState(null)` calls
- Prefixes unused parameters with underscore (e.g., `event` → `_event`)
- Adds error handling with `getErrorMessage` utility
- Fixes optional property types for `exactOptionalPropertyTypes`

### 3. **Type Safety Improvements**
- Adds type annotations to map/filter callbacks
- Fixes `Client | undefined` to `Client | null`
- Adds proper type guards for budget properties
- Imports missing types (Campaign, etc.)

## Manual Fixes Required

After running the automated fixes, some errors may require manual intervention:

### 1. **Complex Type Mismatches**
```typescript
// Before
const value: string | undefined = getData();
const result: string = value; // Error!

// After - Add type guard
const value: string | undefined = getData();
const result: string = value ?? ''; // Or throw error if undefined
```

### 2. **Missing Properties**
```typescript
// Before
campaign.schedule.start_date // Error if schedule doesn't exist

// After - Add optional chaining
campaign.schedule?.start_date
```

### 3. **Implicit Any in Complex Callbacks**
```typescript
// Before
data.map(item => item.value) // Error if item type unknown

// After - Add explicit type
data.map((item: YourItemType) => item.value)
```

## Gradual Migration to Strict TypeScript

### Phase 1: Current (Permissive)
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

### Phase 2: Intermediate
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Phase 3: Strict (Goal)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Common Error Patterns & Solutions

### 1. **TS6133: Unused Declarations**
```typescript
// Solution: Remove or prefix with underscore
import { unused } from 'module'; // Remove this
const handleClick = (event) => { // Change to (_event)
```

### 2. **TS2322: Type Mismatch**
```typescript
// Solution: Add type guards or type assertions
if (typeof value === 'string') {
  const str: string = value; // Now safe
}
```

### 3. **TS7006: Implicit Any**
```typescript
// Solution: Add explicit types
const items = data.map((item: ItemType) => item.name);
```

### 4. **TS2339: Missing Property**
```typescript
// Solution: Use optional chaining or type guards
const value = obj?.property?.subProperty;
```

## Best Practices Going Forward

1. **Enable Pre-commit Hooks**
   ```bash
   npm install --save-dev husky lint-staged
   npx husky init
   echo "npm run type-check" > .husky/pre-commit
   ```

2. **Use Strict Types for New Code**
   - Always define interfaces for objects
   - Avoid `any` type unless absolutely necessary
   - Use union types instead of loose typing

3. **Regular Type Checking**
   - Run `npm run type-check` before commits
   - Fix errors immediately rather than accumulating

4. **Gradual Strictness**
   - Enable one strict option at a time
   - Fix all errors before enabling the next

## Troubleshooting

### If automated fixes don't work:
1. Check file permissions
2. Ensure all dependencies are installed
3. Clear TypeScript cache: `rm -rf node_modules/.cache`
4. Restart TypeScript service in your IDE

### For specific error types:
- **Import errors**: Check path aliases in tsconfig.json
- **Type definition errors**: Install @types packages
- **Module errors**: Check moduleResolution in tsconfig.json

## Next Steps

1. Run the complete fix script
2. Manually fix any remaining complex errors
3. Enable stricter TypeScript settings gradually
4. Add type checking to CI/CD pipeline
5. Document any project-specific type patterns

## Success Metrics

- ✅ Zero TypeScript errors
- ✅ All files pass type checking
- ✅ ESLint configured for TypeScript
- ✅ Pre-commit hooks prevent new errors
- ✅ Team follows TypeScript best practices

Remember: The goal is not just to fix errors but to improve code quality and maintainability through better type safety.
