# TypeScript Manual Fix Guide

This guide provides solutions for TypeScript errors that require manual intervention.

## Common Error Patterns and Solutions

### 1. Type 'undefined' is not assignable to type

**Error Example:**
```typescript
Type 'undefined' is not assignable to type 'string'
```

**Solutions:**
```typescript
// Option 1: Make the property optional
interface User {
  name?: string; // Add ? to make optional
}

// Option 2: Use union type
interface User {
  name: string | undefined;
}

// Option 3: Provide default value
const name = user.name || 'default';

// Option 4: Use nullish coalescing
const name = user.name ?? 'default';
```

### 2. Property does not exist on type

**Error Example:**
```typescript
Property 'customProperty' does not exist on type 'Window'
```

**Solutions:**
```typescript
// Option 1: Extend the interface
declare global {
  interface Window {
    customProperty: any;
  }
}

// Option 2: Use type assertion
(window as any).customProperty

// Option 3: Use bracket notation
window['customProperty']
```

### 3. Cannot find module

**Error Example:**
```typescript
Cannot find module '@/components/SomeComponent' or its corresponding type declarations
```

**Solutions:**
```typescript
// Option 1: Create type declaration file
// Create src/types/modules.d.ts
declare module '@/components/SomeComponent' {
  const component: React.FC<any>;
  export default component;
}

// Option 2: Fix import path
import SomeComponent from '../components/SomeComponent';

// Option 3: Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 4. Type inference issues with async functions

**Error Example:**
```typescript
Type 'Promise<unknown>' is not assignable to type 'Promise<User>'
```

**Solutions:**
```typescript
// Option 1: Explicit return type
async function getUser(): Promise<User> {
  const response = await fetch('/api/user');
  return response.json() as User;
}

// Option 2: Type the awaited value
async function getUser() {
  const response = await fetch('/api/user');
  const data: User = await response.json();
  return data;
}
```

### 5. React component type issues

**Error Example:**
```typescript
Type '{ children: Element; }' is not assignable to type 'IntrinsicAttributes'
```

**Solutions:**
```typescript
// Option 1: Define proper component props
interface Props {
  children: React.ReactNode;
}

const Component: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

// Option 2: Use PropsWithChildren
import { PropsWithChildren } from 'react';

const Component: React.FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};
```

### 6. Event handler type issues

**Error Example:**
```typescript
Parameter 'e' implicitly has an 'any' type
```

**Solutions:**
```typescript
// Option 1: Use specific event types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // handle click
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // handle change
};

// Option 2: Use generic handler type
const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
  e.preventDefault();
};
```

### 7. Union type refinement

**Error Example:**
```typescript
Property 'data' does not exist on type 'Error | Success'
```

**Solutions:**
```typescript
// Option 1: Type guards
function isSuccess(result: Error | Success): result is Success {
  return 'data' in result;
}

if (isSuccess(result)) {
  console.log(result.data); // TypeScript knows this is Success
}

// Option 2: Discriminated unions
interface Error {
  type: 'error';
  message: string;
}

interface Success {
  type: 'success';
  data: any;
}

if (result.type === 'success') {
  console.log(result.data); // TypeScript knows this is Success
}
```

### 8. Third-party library types

**Error Example:**
```typescript
Could not find a declaration file for module 'some-library'
```

**Solutions:**
```typescript
// Option 1: Install types package
npm install --save-dev @types/some-library

// Option 2: Create declaration file
// Create src/types/some-library.d.ts
declare module 'some-library' {
  export function someFunction(): void;
  export default class SomeClass {
    constructor(options?: any);
  }
}

// Option 3: Use require with type assertion
const someLibrary = require('some-library') as any;
```

## Specific AIrWAVE Fixes

### Fix Supabase Types

```typescript
// src/types/supabase.ts
import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];
```

### Fix API Response Types

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  status: number;
}

// Usage
const response: ApiResponse<User> = await fetchUser();
if (response.error) {
  console.error(response.error.message);
} else if (response.data) {
  console.log(response.data.name);
}
```

### Fix Component Props

```typescript
// src/components/Campaign/CampaignMatrix.tsx
interface CampaignMatrixProps {
  campaignId: string;
  assetMap: Record<string, Asset[]>;
  onUpdate?: (data: any) => void;
  readOnly?: boolean;
}

export const CampaignMatrix: React.FC<CampaignMatrixProps> = ({
  campaignId,
  assetMap,
  onUpdate,
  readOnly = false
}) => {
  // Component implementation
};
```

## TypeScript Configuration Best Practices

### Recommended tsconfig.json settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

## Quick Fixes Checklist

1. **Add 'any' type temporarily**
   ```typescript
   // Quick fix for development
   const someVariable: any = complexValue;
   ```

2. **Use type assertions**
   ```typescript
   const element = document.getElementById('id') as HTMLInputElement;
   ```

3. **Optional chaining**
   ```typescript
   const value = obj?.prop?.nestedProp;
   ```

4. **Nullish coalescing**
   ```typescript
   const value = possiblyNull ?? defaultValue;
   ```

5. **Non-null assertion (use sparingly)**
   ```typescript
   const value = possiblyNull!; // Tell TS it's not null
   ```

## Running Manual Fixes

After applying manual fixes:

1. Run type check:
   ```bash
   npm run type-check
   ```

2. Run linter:
   ```bash
   npm run lint
   ```

3. Build project:
   ```bash
   npm run build
   ```

## Need More Help?

If you encounter errors not covered here:

1. Check TypeScript documentation: https://www.typescriptlang.org/docs/
2. Search for the specific error code (e.g., "TS2339")
3. Consider using `// @ts-ignore` as a last resort (document why)
4. Ask for help with specific error messages and code context

Remember: The goal is to have zero TypeScript errors, but it's okay to use `any` types temporarily while you're fixing errors. You can always come back and add proper types later.
