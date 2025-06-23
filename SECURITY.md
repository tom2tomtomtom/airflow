# AIRWAVE Security Guidelines

## 🔐 Security Best Practices

### 1. **Never Commit Secrets**
- All API keys, passwords, and sensitive data must be stored in environment variables
- Use `.env.local` for local development (never commit this file)
- Use `.env.example` files to document required variables without values

### 2. **Pre-commit Secret Scanning**
We have implemented automatic secret scanning that runs before every commit:
```bash
# The pre-commit hook automatically runs:
node scripts/check-secrets.js
```

If secrets are detected, the commit will be blocked. Review and fix before committing.

### 3. **Test Credentials**
Never hardcode real credentials in test files. Instead:

```javascript
// ❌ BAD - Never do this
const email = 'real@email.com';
const password = 'realPassword123';

// ✅ GOOD - Use environment variables
const email = process.env.TEST_USER_EMAIL || 'test@example.com';
const password = process.env.TEST_USER_PASSWORD || 'test-password-123';
```

### 4. **Environment Variables**

#### Required Security Variables:
```bash
# Authentication
JWT_SECRET=<32+ character random string>
NEXTAUTH_SECRET=<32+ character random string>

# API Keys (use environment-specific keys)
CREATOMATE_API_KEY=<your-api-key>
OPENAI_API_KEY=<your-api-key>
ANTHROPIC_API_KEY=<your-api-key>
ELEVENLABS_API_KEY=<your-api-key>

# Supabase
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

#### Test Environment:
Create `.env.test.local` for test-specific credentials:
```bash
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=secure-test-password-123
TEST_CREATOMATE_API_KEY=test-api-key
```

### 5. **API Key Rotation**
If any API key is exposed:
1. **Immediately** rotate the key in the provider's dashboard
2. Update the key in your environment variables
3. Deploy the change to all environments
4. Review logs for any unauthorized usage

### 6. **Security Headers**
The application implements security headers automatically:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Permissions-Policy
- Strict-Transport-Security (HSTS) in production

### 7. **Input Validation**
All user inputs are validated and sanitized:
- SQL injection protection
- XSS prevention
- CSRF protection
- Rate limiting

### 8. **Dependency Security**
Regularly check for vulnerabilities:
```bash
npm audit
npm audit fix
```

### 9. **Reporting Security Issues**
If you discover a security vulnerability:
1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@airwave.com
3. Include detailed steps to reproduce
4. Allow 48 hours for initial response

## 🚨 Emergency Response

### If Credentials Are Exposed:
1. **Rotate all affected keys immediately**
2. Check logs for unauthorized access
3. Update all environment variables
4. Run security audit: `npm run audit:security`
5. Notify the security team

### Security Checklist for Deployment:
- [ ] No hardcoded credentials in code
- [ ] All environment variables set
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Latest dependencies (no vulnerabilities)
- [ ] HTTPS enforced
- [ ] Logs don't contain sensitive data