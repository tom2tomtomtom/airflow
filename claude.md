# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AIRWAVE Project Guide for Claude

## 🎯 **PROJECT OVERVIEW**

AIRWAVE is a comprehensive AI-powered video marketing platform that enables users to create, manage, and deploy video campaigns. The platform integrates multiple AI services (OpenAI, Anthropic, ElevenLabs) with video generation (Creatomate), asset management, and campaign workflows.

## 🛠️ **ESSENTIAL DEVELOPMENT COMMANDS**

### **Basic Development**
```bash
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Code linting
npm run type-check             # TypeScript validation
```

### **Testing Commands**
```bash
npm test                       # Unit tests with Jest
npm run test:watch             # Unit tests in watch mode
npm run test:e2e               # End-to-end tests with Playwright
npm run test:e2e:headed        # E2E tests with browser UI
npm run test:e2e:ui            # Interactive Playwright UI
npm run test:comprehensive     # Full comprehensive test suite
npm run test:airwave           # Main AIRWAVE workflow tests
npm run test:auth              # Authentication flow tests
npm run test:campaigns         # Campaign management tests
```

### **Type Safety & Migration**
```bash
npm run type-check:phase1      # Phase 1 TypeScript migration check
npm run type-check:phase2      # Phase 2 TypeScript migration check  
npm run type-check:final       # Final strict mode check
npm run fix:typescript         # Auto-fix TypeScript errors
npm run migrate:types          # Run type migration scripts
```

### **Production & Quality**
```bash
npm run ci:check               # Full CI pipeline (lint + type + test + build)
npm run ci:quick               # Quick CI check (lint + type only)
npm run validate:production    # Production readiness validation
npm run production:checklist   # Complete production checklist
npm run audit:security         # Security audit
npm run perf:test              # Performance testing
```

### **Development Tools**
```bash
npm run workers                # Start background workers
npm run worker:render          # Start render worker only
npm run build:analyze          # Bundle analysis with ANALYZE=true
npm run fix:lint               # Auto-fix linting issues
npm run cleanup:repo           # Clean temporary files
```

### **Environment & Setup**
```bash
# Environment validation
npm run validate:env            # Validate current environment
npm run validate:env:production # Validate production env file

# Health checks
npm run health:check           # Application health check
npm run smoke:test             # Smoke tests
npm run smoke:test:prod        # Production smoke tests
```

⚠️ **Critical**: Always run `npm run validate:env` before starting development to ensure all required environment variables are configured.

### **Core Architecture**

- **Frontend**: Next.js 15.3.2 with TypeScript (strict mode), Material-UI v7, React Hook Form
- **Backend**: Next.js API routes with API v2 architecture (Pages Router)
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Caching**: Redis with BullMQ for job processing (conditional server-side imports)
- **AI Services**: OpenAI GPT-4, Anthropic Claude, ElevenLabs TTS
- **Video Generation**: Creatomate API integration
- **Monitoring**: Sentry, StatsD, custom APM system
- **Testing**: Jest (unit), Playwright (E2E), comprehensive test suites

### **Key Architectural Decisions**

- **Pages Router**: Uses Next.js Pages Router (not App Router) - important for SSR patterns
- **Conditional Redis**: Redis imports are conditional to prevent client-side bundling issues
- **Supabase SSR**: Custom server client implementation compatible with Pages Router
- **Material-UI v7**: Uses latest Grid component patterns (`size` prop instead of `item xs`)
- **TypeScript Strict**: Full strict mode enabled with 0 compilation errors

## 🏗️ **CRITICAL ARCHITECTURAL PATTERNS**

### **API v2 Architecture**

```typescript
// Universal router pattern with middleware pipeline
export const universalRouter = (handlers: RouteHandlers) => {
  return withAuth(
    withRateLimit('api')(
      withValidation(
        withCostTracking(async (req: NextApiRequest, res: NextApiResponse) => {
          // Route handling logic
        })
      )
    )
  );
};
```

### **Middleware Pipeline Order** ⚠️ **CRITICAL**

1. `withAuth` - Authentication validation
2. `withRateLimit` - Rate limiting enforcement
3. `withValidation` - Input validation with Zod
4. `withCostTracking` - AI cost monitoring
5. Handler execution

### **State Management Patterns**

- **XState**: Complex workflow state machines (UnifiedBriefWorkflow)
- **React Context**: User authentication, client selection
- **React Hook Form**: Form state with Zod validation
- **SWR**: Data fetching and caching

## 🛡️ **SECURITY REQUIREMENTS**

### **Authentication & Authorization**

```typescript
// Always use withAuth middleware for protected routes
export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  // Access user via req.user (populated by middleware)
  const userId = req.user?.id;
});

// Role-based access control
const hasPermission = (user: User, resource: string, action: string) => {
  // Check user.role against resource permissions
};
```

### **Input Validation** ⚠️ **MANDATORY**

```typescript
import { z } from 'zod';

// Always validate inputs with Zod schemas
const CreateClientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  // ... other fields
});

// Use in API handlers
const validatedData = CreateClientSchema.parse(req.body);
```

### **Rate Limiting Configuration**

```typescript
// Different limits for different endpoint types
const rateLimits = {
  auth: 5, // Authentication endpoints
  api: 100, // Standard API endpoints
  ai: 20, // AI-powered endpoints
  upload: 10, // File upload endpoints
};
```

## 💰 **AI COST CONTROL SYSTEM**

### **Budget Enforcement** ⚠️ **CRITICAL**

```typescript
// Monthly budgets (USD)
const AI_BUDGETS = {
  openai: 1000,
  anthropic: 500,
  elevenlabs: 300,
};

// Always check budget before AI operations
const canProceed = await aiCostController.checkBudget('openai', estimatedCost);
if (!canProceed) {
  throw new Error('Monthly AI budget exceeded');
}
```

### **Usage Tracking Pattern**

```typescript
// Track all AI operations
await aiCostController.trackUsage({
  provider: 'openai',
  model: 'gpt-4',
  tokens: response.usage.total_tokens,
  cost: calculateCost(response.usage),
  userId: req.user.id,
  operation: 'generate-motivations',
});
```

## 📊 **DATABASE PATTERNS**

### **Supabase Operations**

```typescript
// Always use proper error handling
const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId);

if (error) {
  throw new DatabaseError('Failed to fetch clients', error);
}
```

### **Table Relationships**

- `users` → `clients` (one-to-many)
- `clients` → `campaigns` (one-to-many)
- `campaigns` → `videos` (one-to-many)
- `users` → `assets` (one-to-many)

## 🔄 **WORKFLOW SYSTEM**

### **UnifiedBriefWorkflow State Machine**

```typescript
// Current states and transitions
const workflowStates = {
  idle: ['uploadBrief'],
  uploadBrief: ['parseContent', 'error'],
  parseContent: ['generateMotivations', 'error'],
  generateMotivations: ['selectMotivations', 'error'],
  selectMotivations: ['generateCopy', 'error'],
  generateCopy: ['selectAssets', 'error'],
  // ... additional states
};
```

### **Workflow Context Structure**

```typescript
interface WorkflowContext {
  briefData?: BriefData;
  motivations?: Motivation[];
  selectedMotivations?: string[];
  generatedCopy?: CopyVariation[];
  selectedAssets?: Asset[];
  // ... other workflow data
}
```

## 🧪 **TESTING PATTERNS**

### **Test Structure** ⚠️ **FOLLOW EXACTLY**

```typescript
// API endpoint tests
describe('API Endpoint', () => {
  beforeEach(() => {
    // Mock Supabase, Redis, AI services
    mockSupabase();
    mockRedis();
    mockAIServices();
  });

  it('should handle valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: validData,
      headers: { authorization: 'Bearer valid-token' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });
});
```

### **Security Test Patterns**

```typescript
// Always test authentication
it('should reject unauthenticated requests', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    // No authorization header
  });

  await handler(req, res);
  expect(res._getStatusCode()).toBe(401);
});
```

## 📁 **FILE STRUCTURE CONVENTIONS**

### **API Routes**

```
src/pages/api/
├── v2/                    # API v2 (current)
│   ├── clients/
│   ├── videos/
│   ├── campaigns/
│   └── [...route].ts      # Universal router
└── auth/                  # Authentication endpoints
```

### **Components**

```
src/components/
├── forms/                 # Form components
├── layout/               # Layout components
├── workflow/             # Workflow-specific components
└── ui/                   # Reusable UI components
```

### **Libraries**

```
src/lib/
├── ai/                   # AI service integrations
├── database/             # Database operations
├── monitoring/           # APM and monitoring
├── validation/           # Zod schemas
└── workflow/             # XState machines
```

## ⚠️ **CRITICAL DO'S AND DON'TS**

### **DO's**

✅ Always use TypeScript with strict mode
✅ Validate all inputs with Zod schemas
✅ Use middleware pipeline for API routes
✅ Track AI usage and costs
✅ Write tests for new functionality
✅ Follow existing naming conventions
✅ Use proper error handling patterns

### **DON'Ts**

❌ Never bypass authentication middleware
❌ Never make AI calls without cost checking
❌ Never use `any` type in TypeScript
❌ Never skip input validation
❌ Never commit secrets or API keys
❌ Never break existing test patterns
❌ Never modify core middleware without testing

## 🚀 **DEPLOYMENT CONSIDERATIONS**

### **Environment Variables** ⚠️ **REQUIRED**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=

# Redis
REDIS_URL=

# Monitoring
SENTRY_DSN=
```

### **Performance Requirements**

- Page load: <2 seconds
- API response: <500ms
- AI operations: <30 seconds
- File uploads: <10MB limit

## 📈 **CURRENT PROJECT STATUS**

### **Completed** ✅

- API v2 architecture with universal router
- Comprehensive security testing framework (94 tests)
- Redis infrastructure testing (28 tests)
- Database layer testing (50 tests)
- TypeScript strict mode (0 errors)
- AI cost control system

### **In Progress** 🔄

- Security implementation (25/94 tests failing due to missing implementations)
- Test coverage improvement (currently 14.2%, target 60%+)

### **Next Priorities** 📋

1. Implement missing security utilities and middleware
2. Add business logic testing (XState workflows, AI integration)
3. Add API endpoint testing for core CRUD operations
4. Add integration testing for complete user workflows

## 🔧 **COMMON PATTERNS TO FOLLOW**

### **Error Handling**

```typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error, context });
  return { success: false, error: error.message };
}
```

### **API Response Format**

```typescript
// Success response
return res.status(200).json({
  success: true,
  data: result,
  meta: { timestamp: new Date().toISOString() },
});

// Error response
return res.status(400).json({
  success: false,
  error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
});
```

## 🎨 **UI/UX PATTERNS**

### **Material-UI Theme Configuration**

```typescript
// Use consistent theme throughout
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### **Form Patterns with React Hook Form**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: zodResolver(validationSchema),
  defaultValues: initialData,
});
```

### **Loading States**

```typescript
// Consistent loading patterns
const [isLoading, setIsLoading] = useState(false);

// Use Material-UI components
<Button
  loading={isLoading}
  disabled={isLoading}
  startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

## 🔌 **EXTERNAL SERVICE INTEGRATIONS**

### **Creatomate Video Generation**

```typescript
// Template-based video generation
const generateVideo = async (templateId: string, modifications: any) => {
  const response = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      modifications,
    }),
  });

  return response.json();
};
```

### **AI Service Integration Patterns**

```typescript
// OpenAI integration with cost tracking
const generateContent = async (prompt: string, userId: string) => {
  // Pre-flight cost check
  const estimatedCost = estimateOpenAICost(prompt);
  await aiCostController.checkBudget('openai', estimatedCost);

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  });

  // Track actual usage
  await aiCostController.trackUsage({
    provider: 'openai',
    model: 'gpt-4',
    tokens: response.usage.total_tokens,
    cost: calculateActualCost(response.usage),
    userId,
    operation: 'content-generation',
  });

  return response.choices[0].message.content;
};
```

## 📝 **WORKFLOW IMPLEMENTATION DETAILS**

### **Brief Processing Pipeline**

```typescript
// Step 1: File upload and parsing
const processBrief = async (file: File) => {
  // Validate file type and size
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Extract text content
  const content = await extractTextFromFile(file);

  // Parse with AI
  const briefData = await parseContentWithAI(content);

  return briefData;
};

// Step 2: Motivation generation
const generateMotivations = async (briefData: BriefData) => {
  const prompt = buildMotivationPrompt(briefData);
  const motivations = await generateWithAI(prompt);

  return motivations.map(m => ({
    id: generateUUID(),
    title: m.title,
    description: m.description,
    score: m.relevanceScore,
    selected: false,
  }));
};
```

### **Asset Management System**

```typescript
// Asset upload with validation
const uploadAsset = async (file: File, metadata: AssetMetadata) => {
  // Security validation
  await validateFileUpload(file);

  // Upload to storage
  const url = await uploadToStorage(file);

  // Save to database
  const asset = await supabase
    .from('assets')
    .insert({
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      metadata,
      user_id: metadata.userId,
    })
    .select()
    .single();

  return asset.data;
};
```

## 🔍 **MONITORING AND DEBUGGING**

### **APM Integration**

```typescript
// Performance tracking
import { PerformanceTracker } from '@/lib/monitoring/performance';

const tracker = PerformanceTracker.getInstance();

// Track operation performance
const operation = tracker.startOperation('api.clients.create');
try {
  const result = await createClient(data);
  operation.success();
  return result;
} catch (error) {
  operation.error(error);
  throw error;
}
```

### **Logging Patterns**

```typescript
import { logger } from '@/lib/monitoring/logger';

// Structured logging
logger.info('Client created', {
  clientId: client.id,
  userId: req.user.id,
  timestamp: new Date().toISOString(),
});

logger.error('Database operation failed', {
  operation: 'client.create',
  error: error.message,
  stack: error.stack,
  context: { userId, requestId },
});
```

## 🧩 **COMPONENT ARCHITECTURE**

### **Workflow Components**

```typescript
// Step-based workflow components
interface WorkflowStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const BriefUploadStep: React.FC<WorkflowStepProps> = ({ data, onNext, isLoading }) => {
  // Component implementation
};
```

### **Data Fetching Patterns**

```typescript
import useSWR from 'swr';

// SWR for data fetching
const useClients = (userId: string) => {
  const { data, error, mutate } = useSWR(
    userId ? `/api/v2/clients?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    clients: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};
```

## 🔐 **SECURITY IMPLEMENTATION CHECKLIST**

### **Required Security Utilities** ⚠️ **MISSING - HIGH PRIORITY**

```typescript
// @/utils/validation.ts - NEEDS IMPLEMENTATION
export const validateEmail = (email: string): boolean => {
  // Implement email validation with security checks
};

export const validatePassword = (password: string): ValidationResult => {
  // Implement password strength validation
};

export const validateUUID = (uuid: string): boolean => {
  // Implement UUID format validation
};

export const validateFileUpload = (file: File): ValidationResult => {
  // Implement file upload security validation
};

export const detectMaliciousPatterns = (input: string): boolean => {
  // Implement malicious pattern detection
};
```

### **Required Security Middleware** ⚠️ **MISSING - HIGH PRIORITY**

```typescript
// @/middleware/withSecurityHeaders.ts - NEEDS IMPLEMENTATION
export const withSecurityHeaders = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set security headers (CSP, HSTS, etc.)
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // ... other security headers

    return handler(req, res);
  };
};

// @/middleware/withCsrfProtection.ts - NEEDS IMPLEMENTATION
export const withCsrfProtection = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Implement CSRF token validation
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      // Validate CSRF token
    }

    return handler(req, res);
  };
};
```

## 📊 **PRODUCTION READINESS METRICS**

### **Current Status** (as of latest assessment)

- **Test Coverage**: 14.2% (Target: 60%+)
- **Security Tests**: 69/94 passing (73.4%)
- **TypeScript Errors**: 0 (Target: 0) ✅
- **Build Status**: ✅ Compiles successfully with strict mode
- **Infrastructure Tests**: 78/78 passing ✅
- **Redis Client Issues**: ✅ Fixed (conditional server-side imports)
- **Supabase SSR Issues**: ✅ Fixed (Pages Router compatibility)
- **Performance**: Load tests failing (needs optimization)

### **Critical Path to Production**

1. **Security Implementation** (1-2 days)

   - Implement missing validation utilities
   - Add security middleware
   - Get security tests to 90%+ pass rate

2. **Test Coverage Boost** (3-5 days)

   - Add API endpoint tests
   - Add business logic tests
   - Add component tests

3. **Performance Optimization** (2-3 days)

   - Fix load test failures
   - Optimize database queries
   - Implement proper caching

4. **Integration Testing** (3-5 days)
   - End-to-end workflow testing
   - External service integration testing
   - Error handling validation

This guide should be your primary reference when working on AIRWAVE. Always prioritize security, cost control, and maintaining the existing architectural patterns.

## 🚨 **EMERGENCY CONTACTS & ESCALATION**

### **Critical System Failures**

- AI Budget Exceeded: Check `AICostController.emergencyShutdown()`
- Database Connection Lost: Verify Supabase connection strings
- Redis Unavailable: Check Redis connection and fallback to in-memory cache
- Security Breach: Immediately disable affected endpoints and review logs

### **Code Review Requirements**

- All security-related changes require thorough review
- AI cost tracking changes must be validated
- Database schema changes need migration scripts
- Performance-critical code needs benchmarking
