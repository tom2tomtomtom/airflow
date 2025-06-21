# 🚨 EMERGENCY CREDENTIAL ROTATION GUIDE

## CRITICAL SECURITY ISSUE IDENTIFIED

**Exposed Credentials**: Supabase production URL and anon key were committed to the repository.

### IMMEDIATE ACTIONS REQUIRED

#### 1. Rotate Supabase Credentials (URGENT)
```bash
# 1. Log into Supabase Dashboard
# 2. Go to Settings > API
# 3. Reset the anon key immediately
# 4. Update RLS policies if needed
# 5. Update environment variables in deployment platform
```

#### 2. Remove from Git History
```bash
# Remove sensitive files from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production.vercel .env.test .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remove from remote
git push origin --force --all
git push origin --force --tags
```

#### 3. Update Deployment Environment Variables

**Netlify:**
```bash
# Set in Netlify Dashboard > Site Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your-new-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
JWT_SECRET=your-secure-32-char-secret
```

**Vercel:**
```bash
# Set in Vercel Dashboard > Project Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your-new-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
JWT_SECRET=your-secure-32-char-secret
```

#### 4. Verify Security
- [ ] Credentials rotated in Supabase
- [ ] Environment variables updated in deployment platform
- [ ] Sensitive files removed from Git history
- [ ] .gitignore updated to prevent future exposure
- [ ] Application tested with new credentials

### PREVENTION MEASURES
1. Never commit .env files with real credentials
2. Use .env.example files for templates
3. Set up pre-commit hooks to check for secrets
4. Regular security audits of repository

### STATUS
- [x] Credentials sanitized in repository files
- [x] .gitignore updated
- [ ] Supabase credentials rotated (USER ACTION REQUIRED)
- [ ] Deployment environment variables updated (USER ACTION REQUIRED)
- [ ] Git history cleaned (USER ACTION REQUIRED)
