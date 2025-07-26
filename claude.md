# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AIRWAVE Project Guide for Claude

## 🚨 **CRITICAL SAFETY NOTICE**

This codebase previously suffered catastrophic damage from automated "fix-all" scripts that created 6000+ TypeScript errors. The project owner is a non-technical founder relying on AI assistance.

### **MANDATORY SAFETY RULES**

1. **NEVER** suggest or implement automated fixes across multiple files
2. **ALWAYS** work on ONE file at a time
3. **EXPLAIN** changes before implementing
4. **TEST** after every single change
5. **COMMIT** frequently with clear messages
6. **ASK** for confirmation before any risky changes

### **For EVERY code change, you MUST provide:**

- Risk assessment (Low/Medium/High)
- Exact files that will be modified
- What could go wrong
- How to test the change
- How to rollback if needed

## 🎯 **PROJECT OVERVIEW**

AIRWAVE is a comprehensive AI-powered video marketing platform that enables users to create, manage, and deploy video campaigns. The platform integrates multiple AI services (OpenAI, Anthropic, ElevenLabs) with video generation (Creatomate), asset management, and campaign workflows.

## 🛡️ **SAFE DEVELOPMENT WORKFLOW**

### **🎯 CRITICAL: Repository Push Instructions**

**ALWAYS push changes to github.com/tom2tomtomtom/airflow**

```bash
# Push all proven quality changes to the airflow repository
git push airflow [branch-name]
```

The `airflow` remote is configured to point to github.com/tom2tomtomtom/airflow and should be used for all commits containing proven, tested changes.

### **1. Before ANY Change**

```bash
# Create safety branch
git checkout -b safe-[feature-name]
git push -u origin safe-[feature-name]

# Verify current state
npm run type-check
npm test
```

### **2. Making Changes Safely**

- Change ONE file
- Run `npm run dev` to verify it starts
- Run `npm run type-check` to check for errors
- Test the specific feature manually
- Commit immediately with descriptive message
- **Push proven quality changes to airflow repository**

### **3. Safe Commit and Push Workflow**

```bash
# Good commit messages
git commit -m "fix: Remove syntax error in Login component line 45"
git commit -m "feat: Add logout button to header navigation"
git commit -m "refactor: Simplify user profile data fetching"

# ALWAYS push proven changes to airflow repository
git push airflow [branch-name]

# Bad commit messages (too vague)
git commit -m "fixes"
git commit -m "updates"
```

## 🛠️ **ESSENTIAL DEVELOPMENT COMMANDS**

### **Health Check Commands** (Run these frequently!)

```bash
npm run dev                    # Does it start?
npm run type-check             # Any TypeScript errors?
npm test                       # Do tests pass?
npm run build                  # Does it build?
```

### **Basic Development**

```bash
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Code linting
```

### **Testing Commands**

```bash
npm test                       # Unit tests with Jest
npm run test:watch             # Unit tests in watch mode
npm run test:e2e               # End-to-end tests with Playwright
npm run test:e2e:headed        # E2E tests with browser UI
```

### **Emergency Commands**

```bash
# If something goes wrong
git status                     # See what changed
git diff                       # See exact changes
git checkout .                 # Discard all changes
git reset --hard HEAD~1        # Go back one commit
```

## 📋 **SAFE CODING PATTERNS**

### **Pattern 1: Single File Changes**

```typescript
// ❌ NEVER: "Update all components to use new pattern"
// ✅ ALWAYS: "Update LoginComponent.tsx to use new pattern"
```

### **Pattern 2: Incremental Fixes**

```typescript
// ❌ NEVER: Run script to fix all TypeScript errors
// ✅ ALWAYS: Fix TypeScript error in auth.ts line 42
```

### **Pattern 3: Test First**

```typescript
// Before changing any code:
// 1. Run the app and verify current behavior
// 2. Make the change
// 3. Run the app and verify it still works
// 4. Run tests to ensure nothing broke
```

## 🚫 **FORBIDDEN ACTIONS**

1. **Global find/replace** across multiple files
2. **Automated fix scripts** without manual review
3. **Bulk file updates** without testing each one
4. **Complex regex replacements** without examples
5. **Major refactoring** without incremental steps
6. **Dependency updates** without checking breaking changes

## ✅ **RECOMMENDED PRACTICES**

### **When Fixing Errors**

1. Show the error message
2. Explain what's causing it
3. Show the minimal fix
4. Explain how to test it
5. Suggest a safe commit message

### **When Adding Features**

1. Start with the simplest implementation
2. Test it works in isolation
3. Integrate one component at a time
4. Add tests for the new feature
5. Document how to use it

### **When Refactoring**

1. Refactor ONE function/component at a time
2. Ensure tests pass after each change
3. Keep the old code commented until verified
4. Make behavior-preserving changes only

## 📁 **PROJECT STRUCTURE**

```
src/
├── components/          # React components
├── pages/              # Next.js pages and API routes
│   ├── api/           # Backend API endpoints
│   └── *.tsx          # Frontend pages
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Core libraries and utilities
├── services/           # External service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and themes
```

## 🔍 **DEBUGGING GUIDELINES**

### **When Something Breaks**

1. **Don't panic** - Git can save you
2. **Check git status** - What files changed?
3. **Run health checks** - Which command fails?
4. **Isolate the problem** - Recent changes?
5. **Rollback if needed** - Git reset is your friend

### **Common Issues**

- **"Failed to compile"** - Check `npm run type-check`
- **"Tests failing"** - Run specific test file
- **"Page not loading"** - Check browser console
- **"API error"** - Check network tab and server logs

## 💾 **GIT SAFETY RULES**

### **Daily Workflow**

```bash
# Start of day
git pull origin main
git checkout -b work-[date]

# During work
git add [specific-file]
git commit -m "type: Specific description"

# Push proven quality changes to airflow repository
git push airflow work-[date]

# End of day - also push to origin for backup
git push origin work-[date]
```

### **Branch Naming**

- `fix/specific-issue` - For bug fixes
- `feat/feature-name` - For new features
- `safe/experiment` - For trying things
- `work/YYYY-MM-DD` - For daily work

## 🎯 **RESPONDING TO USER REQUESTS**

### **Template Response Format**

```markdown
## 📋 Change Assessment

- **Risk Level**: [Low/Medium/High]
- **Files Affected**: [Exact list]
- **Potential Issues**: [What could go wrong]

## 🔍 Current State

[Show current code]

## 🛠️ Proposed Change

[Show exact change]

## ✅ Testing Steps

1. Run `npm run dev` - should start
2. Run `npm run type-check` - no new errors
3. Test [specific feature] manually

## 💾 Safe Implementation

1. Make change to [filename]
2. Save and test
3. Commit: `git commit -m "type: description"`
4. Push to airflow: `git push airflow [branch-name]`

Would you like me to explain this further before you implement it?
```

## 📊 **PROJECT HEALTH METRICS**

Track these metrics to ensure project health:

| Metric            | Target | Command                  |
| ----------------- | ------ | ------------------------ |
| TypeScript Errors | 0      | `npm run type-check`     |
| Test Coverage     | >60%   | `npm test -- --coverage` |
| Build Success     | ✅     | `npm run build`          |
| Lint Issues       | 0      | `npm run lint`           |

## 🆘 **EMERGENCY PROCEDURES**

### **If TypeScript won't compile:**

1. Check recent git commits
2. Revert last change
3. Fix ONE error at a time

### **If tests are failing:**

1. Run failing test individually
2. Check test output carefully
3. Fix the code, not the test

### **If the app won't start:**

1. Check console for errors
2. Verify .env.local exists
3. Run `npm install`
4. Clear .next folder

## 📚 **LEARNING RESOURCES**

For the non-technical founder:

- **Git Basics**: Branches are safe spaces to try things
- **TypeScript**: Red squiggles = problems to fix
- **Testing**: Green = good, Red = broken
- **npm**: Package manager for JavaScript

Remember: **Small changes, tested thoroughly, committed frequently** is the path to success!

## 🚀 Enhanced Agent OS Documentation (v2.0)

### Three-Layer Context System

- **System Overview:** @.agent-os/product/context-system.md
- **Layer Architecture:** Standards → Project → Specs for maximum consistency

### Layer 1: Global Standards

- **Tech Stack Defaults:** @~/.agent-os/standards/tech-stack.md
- **Code Style Rules:** @~/.agent-os/standards/code-style.md
- **Development Best Practices:** @~/.agent-os/standards/best-practices.md

### Layer 2: Project Context

- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Layer 3: Active Specifications

- **Current Specs:** @.agent-os/specs/
- **Spec Creation:** Use `@~/.agent-os/instructions/create-spec.md`
- **Task Execution:** Use `@~/.agent-os/instructions/execute-tasks.md`

### Enhanced Features

- **XML-Structured Workflows:** Clear step tracking and error handling
- **Cross-Reference System:** `@` prefix for all file references
- **Workflow Composition:** Instructions can reference and compose each other
- **Context Inheritance:** Clear priority rules for conflicting directives

## Current Project Status (Enhanced Analysis - 2025-07-26)

### ✅ **Phase 0 Complete**: Core Platform Implemented

- Comprehensive AI-powered video marketing platform operational
- Video Studio successfully refactored from monolithic to modular architecture
- Full authentication, database, and security framework in place
- AI integrations (OpenAI, DALL-E, Anthropic, ElevenLabs) fully operational
- Background job system (BullMQ) and real-time WebSocket infrastructure ready
- Performance monitoring (Sentry, Web Vitals) operational

### ⚠️ **Phase 1 Active**: Code Quality & Performance - **CRITICAL BLOCKERS IDENTIFIED**

**Current Priority:** Production readiness assessment completed - immediate action required

**🚨 Production Blockers (Must Fix Before Deployment):**

- **Production Readiness Score:** 42/100 (Not deployment ready)
- **TypeScript Errors:** 305+ compilation errors preventing build
- **Console Statements:** 768+ debug statements for production cleanup
- **Security Vulnerabilities:** 6 moderate severity issues requiring patches
- **Dev Server:** ✅ **FIXED** - Critical MUI import issue resolved

**📊 Performance Metrics Needing Improvement:**

- **Health Score:** 42/100 → Target: 80+
- **Bundle Size:** 481KB → Target: <300KB
- **Test Coverage:** 16.8% → Target: 80%+
- **Build Memory:** 8GB heap requirement → Target: <4GB

## Workflow Instructions

When asked to work on this codebase:

1. **First**, check @.agent-os/product/roadmap.md for current Phase 1 priorities
2. **Focus on systematic technical debt reduction** using Agent OS methodology
3. **For new features**: Use @~/.agent-os/instructions/create-spec.md
4. **For task execution**: Use @~/.agent-os/instructions/execute-tasks.md
5. **Always test incrementally** and commit frequently with clear messages

### Phase 1 Priority Tasks (In Order)

1. **TypeScript Strict Mode**: Fix 305 suppressed errors
2. **ErrorBoundary Consolidation**: Merge 4 implementations into unified system
3. **Bundle Optimization**: Reduce size and improve code splitting
4. **Test Coverage**: Increase from 16.8% to 80%+
5. **Service Layer Extraction**: Separate business logic from UI components

## Important Notes

- **SAFETY FIRST**: This codebase previously suffered from automated "fix-all" scripts
- **ONE FILE AT A TIME**: Never implement changes across multiple files simultaneously
- **TEST EVERYTHING**: Run health checks after every change
- **COMMIT FREQUENTLY**: Use clear, descriptive commit messages
- Product-specific files in `.agent-os/product/` override any global standards
- Always push proven quality changes to `airflow` repository

---

Last Updated: June 2025
After recovering from 6000+ TypeScript errors caused by automated fixes
