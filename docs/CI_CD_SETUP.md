# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the AIRWAVE project.

## 🏗️ Pipeline Overview

Our CI/CD pipeline consists of multiple workflows designed to ensure code quality, security, and reliable deployments:

### 1. Main CI/CD Pipeline (`ci.yml`)
**Triggers**: Push to `main` or `develop`, Pull Requests
**Purpose**: Complete build, test, and deployment pipeline

**Jobs**:
- **🔍 Lint Code**: ESLint with zero warnings policy
- **🔧 TypeScript Check**: Strict type checking
- **🧪 Run Tests**: Unit tests with coverage reporting
- **🔒 Security Audit**: Dependency vulnerability scanning
- **🏗️ Build Application**: Production build verification
- **🚀 Deployment Check**: Validates deployment readiness

### 2. Pull Request Checks (`pr-checks.yml`)
**Triggers**: Pull Request events (opened, synchronized, reopened)
**Purpose**: Fast feedback for pull requests

**Features**:
- Skips draft PRs automatically
- Quick lint and TypeScript checks
- Comprehensive test suite
- Build verification
- Security scanning
- Merge conflict detection

### 3. Dependency Updates (`dependency-updates.yml`)
**Triggers**: Weekly schedule (Mondays 9 AM UTC) + Manual
**Purpose**: Automated dependency maintenance

**Features**:
- Weekly dependency updates
- Automated testing of updates
- Pull request creation for updates
- Security vulnerability detection
- Automatic issue creation for security alerts

## 🔧 Quality Gates

### Code Quality Standards
- **Zero ESLint warnings** - All code must pass linting
- **TypeScript strict mode** - Type safety enforced
- **100% test pass rate** - All tests must pass
- **Successful build** - Application must build without errors

### Security Requirements
- **No high/critical vulnerabilities** - Dependencies must be secure
- **No secrets in code** - Automated secret detection
- **Environment validation** - Proper configuration checks

### Performance Standards
- **Build time < 2 minutes** - Fast feedback loops
- **Test execution < 1 minute** - Quick test feedback

## 🚀 Deployment Process

### Automatic Deployment (Netlify)
1. **Push to main** triggers automatic deployment
2. **Build verification** ensures deployment readiness
3. **Netlify builds** and deploys automatically
4. **Live site** updated at https://airwave-complete.netlify.app

### Manual Deployment
```bash
# Build locally
npm run build

# Deploy to Netlify (if CLI configured)
netlify deploy --prod
```

## 📊 Monitoring and Alerts

### GitHub Actions Notifications
- **Failed builds** notify via GitHub
- **Security vulnerabilities** create issues automatically
- **Dependency updates** create pull requests weekly

### Status Badges
Add these to your README for visibility:
```markdown
![CI/CD](https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/tom2tomtomtom/AIRWAVE_0525_CODEX/workflows/Dependency%20Updates/badge.svg)
```

## 🛠️ Local Development Workflow

### Before Committing
```bash
# Run quality checks locally
npm run lint
npm run type-check
npm test
npm run build

# Fix any issues
npm run lint -- --fix
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Validate environment
npm run validate:env

# Install dependencies
npm ci
```

## 🔍 Troubleshooting

### Common CI/CD Issues

#### Build Failures
1. **TypeScript errors**: Run `npm run type-check` locally
2. **Test failures**: Run `npm test` locally
3. **Lint errors**: Run `npm run lint -- --fix`

#### Deployment Issues
1. **Environment variables**: Check Netlify dashboard
2. **Build configuration**: Verify `netlify.toml`
3. **Dependencies**: Ensure `package-lock.json` is committed

#### Security Alerts
1. **Audit failures**: Run `npm audit fix`
2. **Vulnerability issues**: Update affected packages
3. **Secret detection**: Remove any hardcoded secrets

### Getting Help

1. **Check workflow logs** in GitHub Actions tab
2. **Review error messages** for specific guidance
3. **Run commands locally** to reproduce issues
4. **Check documentation** for configuration details

## 📈 Metrics and Reporting

### Build Metrics
- **Build success rate**: Target 95%+
- **Average build time**: Target < 2 minutes
- **Test coverage**: Target 80%+

### Security Metrics
- **Vulnerability count**: Target 0 high/critical
- **Dependency freshness**: Weekly updates
- **Security response time**: < 24 hours

### Performance Metrics
- **Deployment frequency**: Multiple per day
- **Lead time**: < 1 hour from commit to production
- **Recovery time**: < 30 minutes

## 🔄 Continuous Improvement

### Weekly Reviews
- Review failed builds and fix root causes
- Update dependencies and security patches
- Optimize build times and test performance

### Monthly Assessments
- Analyze pipeline metrics and trends
- Update quality gates and standards
- Review and improve documentation

### Quarterly Updates
- Upgrade CI/CD tools and actions
- Implement new quality checks
- Review and update security policies

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify Deployment Guide](https://docs.netlify.com/)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
