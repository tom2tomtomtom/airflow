# Technical Stack

> Last Updated: 2025-01-25
> Version: 1.0.0

## Core Technologies

### Application Framework

- **Framework:** Next.js
- **Version:** 14.2.5+
- **Language:** TypeScript 5.1.6

### Database

- **Primary:** PostgreSQL
- **Version:** Latest (via Supabase)
- **ORM:** Supabase Client SDK

## Frontend Stack

### JavaScript Framework

- **Framework:** React
- **Version:** 18.2.0
- **Build Tool:** Next.js built-in (Webpack)

### Import Strategy

- **Strategy:** ES Modules with Next.js optimization
- **Package Manager:** npm
- **Node Version:** 18+ LTS

### CSS Framework

- **Framework:** Tailwind CSS
- **Version:** 3.3.3+
- **Component Library:** Material-UI (MUI) 7.1.0+

### UI Components

- **Library:** Material-UI (@mui/material)
- **Version:** 7.1.0+
- **Additional:** Radix UI components for enhanced functionality

## Assets & Media

### Fonts

- **Provider:** Google Fonts (via Next.js optimization)
- **Loading Strategy:** Self-hosted for performance

### Icons

- **Library:** Material-UI Icons
- **Implementation:** React components
- **Additional:** Lucide React for additional icons

## AI & External Services

### AI Integration

- **OpenAI:** GPT-4 for content generation
- **Anthropic:** Claude for content analysis
- **ElevenLabs:** Voice generation services
- **DALL-E:** Image generation

### Video Generation

- **Provider:** Creatomate
- **Purpose:** Template-based video rendering
- **Integration:** REST API

### Email Services

- **Provider:** Resend
- **Purpose:** Transactional emails and notifications

## Infrastructure

### Application Hosting

- **Platform:** Vercel (Primary)
- **Alternative:** Netlify
- **Region:** Global CDN with optimal routing

### Database Hosting

- **Provider:** Supabase
- **Service:** Managed PostgreSQL with real-time capabilities
- **Backups:** Daily automated with point-in-time recovery

### Asset Storage

- **Provider:** Supabase Storage
- **CDN:** Built-in CDN with global distribution
- **Access:** Secure with Row Level Security (RLS)

### Authentication

- **Provider:** Supabase Auth
- **Method:** HTTP-only cookies for security
- **Features:** Multi-factor authentication, social login

## Development & Operations

### State Management

- **Primary:** React Context API
- **Complex State:** XState for workflow management
- **Caching:** TanStack Query (React Query) for server state

### Monitoring & Analytics

- **Error Tracking:** Sentry
- **Performance:** Web Vitals integration
- **Analytics:** Mixpanel for user behavior tracking
- **Logging:** Structured logging with Pino

### Security

- **CSRF Protection:** Built-in token validation
- **Rate Limiting:** Upstash Redis with rate-limiter-flexible
- **Input Validation:** Zod schemas
- **Content Security:** DOMPurify for sanitization

## Deployment

### CI/CD Pipeline

- **Platform:** GitHub Actions
- **Trigger:** Push to main/staging branches
- **Tests:** TypeScript validation, Jest unit tests, Playwright E2E

### Environments

- **Production:** main branch → Vercel
- **Staging:** staging branch → Preview deployments
- **Development:** Local with hot reload

### Build Optimization

- **Bundle Analysis:** @next/bundle-analyzer
- **Image Optimization:** Next.js built-in with Sharp
- **Code Splitting:** Automatic with dynamic imports
- **Compression:** Gzip and Brotli compression

## Dependencies Summary

### Production Dependencies (103 total)

- **Core:** Next.js, React, TypeScript
- **UI:** Material-UI, Tailwind CSS, Radix UI
- **Database:** Supabase client libraries
- **AI Services:** OpenAI, Anthropic SDKs
- **File Handling:** Sharp, Multer, ExcelJS
- **Security:** CSRF protection, rate limiting, encryption
- **Performance:** React Query, Redis caching

### Development Dependencies (28 total)

- **Testing:** Jest, Playwright, Testing Library
- **Code Quality:** ESLint, Prettier, TypeScript
- **Build Tools:** Bundle analyzer, Webpack plugins
- **Development:** Husky, lint-staged for git hooks

## Performance Considerations

### Bundle Optimization

- **Current Bundle Size:** 481KB (needs optimization)
- **Target:** <300KB for main bundle
- **Strategy:** Route-based code splitting, vendor separation

### Caching Strategy

- **Static Assets:** CDN caching with long TTL
- **API Responses:** Redis caching for expensive operations
- **Database:** Query optimization with proper indexing

### Memory Management

- **Build Memory:** Currently requires 8GB heap
- **Target:** <4GB for build processes
- **Runtime:** Optimized component rendering with memoization
