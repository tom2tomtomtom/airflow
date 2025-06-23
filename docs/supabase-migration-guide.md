# Supabase Integration Migration Guide

## Overview

The AIRFLOW application's Supabase integration has been refactored to address multiple issues including security concerns, duplicate client instances, and inconsistent error handling. This guide documents the changes and provides migration instructions.

## Key Changes

### 1. Consolidated Client Management

**Before:**
- Multiple Supabase client implementations across different files
- Risk of multiple GoTrueClient warnings
- Inconsistent configuration

**After:**
- Single source of truth in `/src/lib/supabase/` module
- Proper singleton pattern preventing duplicate instances
- Centralized configuration validation

### 2. Import Path Changes

Update your imports from:
```typescript
// Old imports
import { supabase } from '@/lib/supabase';
import { createSupabaseBrowserClient } from '@/utils/supabase-browser';
import { updateSession } from '@/utils/supabase-middleware';
```

To:
```typescript
// New imports
import { getSupabaseBrowserClient, createServerSupabaseClient } from '@/lib/supabase';
import { updateSession } from '@/lib/supabase/middleware';
```

### 3. Client Usage Patterns

#### Browser/Client-Side
```typescript
// Old
const supabase = createBrowserClient(url, key);

// New
import { getSupabaseBrowserClient } from '@/lib/supabase';
const supabase = getSupabaseBrowserClient();
```

#### Server-Side (API Routes)
```typescript
// Old
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey);

// New
import { getAdminSupabaseClient } from '@/lib/supabase';
const supabase = getAdminSupabaseClient();
```

#### Server Components
```typescript
// Old
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// New
import { createServerSupabaseClient } from '@/lib/supabase';
const supabase = await createServerSupabaseClient();
```

### 4. Security Improvements

- **Service Role Key Protection**: The service role key is now only accessible server-side
- **Environment Validation**: All environment variables are validated before use
- **No Hardcoded Defaults**: Removed all hardcoded fallback values

### 5. Error Handling

Use the new error handling utilities:

```typescript
import { handleSupabaseError, getErrorMessage, isAuthError } from '@/lib/supabase/errors';

try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
} catch (error) {
  // Automatic error classification and logging
  await handleSupabaseError(error, {
    operation: 'fetchData',
    table: 'table',
    userId: user?.id
  });
}
```

### 6. Helper Functions

New helper functions for common patterns:

```typescript
import { withRetry, queryWithCache, paginatedQuery } from '@/lib/supabase/helpers';

// Automatic retry for transient failures
const data = await withRetry(() => 
  supabase.from('table').select()
);

// Query with caching
const cachedData = await queryWithCache(
  'cache-key',
  () => supabase.from('table').select(),
  { ttl: 300 }
);

// Paginated queries
const result = await paginatedQuery(supabase, 'table', {
  page: 1,
  pageSize: 20,
  orderBy: 'created_at'
});
```

## Migration Steps

1. **Update imports** in all files using Supabase
2. **Replace client initialization** with the new pattern
3. **Update error handling** to use the new utilities
4. **Test authentication flows** thoroughly
5. **Verify API routes** are using proper server-side clients

## Configuration

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

## Benefits

- **Better Performance**: Singleton pattern prevents multiple client instances
- **Enhanced Security**: Service role key protection and validation
- **Improved DX**: Consistent API and better error messages
- **Type Safety**: Full TypeScript support with database types
- **Monitoring**: Built-in logging for all operations

## Troubleshooting

### "Multiple GoTrueClient instances" warning
- Ensure you're using the singleton client getters
- Call `resetSupabaseBrowserClient()` if needed during logout

### "Service role key detected in browser" error
- Only use `getAdminSupabaseClient()` in API routes or server-side code
- Use `getSupabaseBrowserClient()` for client-side operations

### Session refresh issues
- The middleware automatically handles session refresh
- Ensure middleware.ts uses the new `updateSession` function

## Future Improvements

- Native transaction support when available in Supabase JS SDK
- Enhanced RLS helpers for complex permissions
- Performance monitoring dashboard
- Automated migration tools