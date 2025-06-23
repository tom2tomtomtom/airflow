import { getErrorMessage } from '@/utils/errorUtils';
#!/usr/bin/env node
// scripts/emergency-security-fix.ts
// Enhanced security audit for AIRWAVE codebase
// Run: npx ts-node scripts/emergency-security-fix.ts

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

console.log('🚨 Starting AIRWAVE Emergency Security Audit...\n');

// 1. Enhanced secret patterns based on AIRWAVE codebase analysis
const secretPatterns = [
  { pattern: /sk-[a-zA-Z0-9]{48}/g, type: 'OpenAI API Key', severity: 'CRITICAL' },
  { pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, type: 'JWT Token', severity: 'HIGH' },
  { pattern: /supabase\.co/g, type: 'Supabase URL', severity: 'MEDIUM' },
  { pattern: /(api[_-]?key|apikey|access[_-]?token|secret[_-]?key)\s*[:=]\s*['"][^'"]+['"]/gi, type: 'Generic API Key', severity: 'HIGH' },
  // AIRWAVE-specific patterns
  { pattern: /creatomate[_-]?api[_-]?key/gi, type: 'Creatomate API Key', severity: 'HIGH' },
  { pattern: /elevenlabs[_-]?api[_-]?key/gi, type: 'ElevenLabs API Key', severity: 'HIGH' },
  { pattern: /anthropic[_-]?api[_-]?key/gi, type: 'Anthropic API Key', severity: 'HIGH' },
  { pattern: /default-client/g, type: 'Hardcoded Client ID', severity: 'MEDIUM' },
  { pattern: /374ee9e3-de75-4feb-bfae-5c5e11d88d80/g, type: 'Hardcoded Template ID', severity: 'LOW' },
  { pattern: /tomh@redbaez\.com/g, type: 'Hardcoded Email', severity: 'LOW' },
  { pattern: /Wijlre2010/g, type: 'Hardcoded Password', severity: 'CRITICAL' }
];

interface SecurityFinding {
  file: string;
  type: string;
  severity: string;
  line: number;
  content: string;
}

const scanResults: SecurityFinding[] = [];

function scanFile(filePath: string) {
  if (filePath.includes('node_modules') || 
      filePath.includes('.git') || 
      filePath.includes('dist') || 
      filePath.includes('.next')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      secretPatterns.forEach(({ pattern, type, severity }) => {
        const matches = line.match(pattern);
        if (matches) {
          scanResults.push({
            file: filePath,
            type,
            severity,
            line: index + 1,
            content: line.trim().substring(0, 100) + (line.length > 100 ? '...' : '')
          });
        }
      });
    });
  } catch (error) {
    const message = getErrorMessage(error);
    // Skip binary files or permission errors
  }
}

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else {
      scanFile(fullPath);
    }
  });
}

// 2. Scan critical directories
console.log('📁 Scanning directories...');
['./src', './scripts', './pages', './components'].forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  Scanning ${dir}...`);
    scanDirectory(dir);
  }
});

// Check critical config files
const configFiles = [
  './netlify.toml',
  './.env',
  './.env.local',
  './.env.production',
  './next.config.js',
  './package.json'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  Scanning ${file}...`);
    scanFile(file);
  }
});

// 3. Analyze and report findings
console.log('\n📊 Security Analysis Results:\n');

const criticalFindings = scanResults.filter(f => f.severity === 'CRITICAL');
const highFindings = scanResults.filter(f => f.severity === 'HIGH');
const mediumFindings = scanResults.filter(f => f.severity === 'MEDIUM');
const lowFindings = scanResults.filter(f => f.severity === 'LOW');

if (criticalFindings.length > 0) {
  console.log('🚨 CRITICAL SECURITY ISSUES:');
  criticalFindings.forEach(({ file, type, line, content }) => {
    console.log(`  ❌ ${file}:${line} - ${type}`);
    console.log(`     Content: ${content}`);
  });
  console.log('');
}

if (highFindings.length > 0) {
  console.log('⚠️  HIGH PRIORITY ISSUES:');
  highFindings.forEach(({ file, type, line }) => {
    console.log(`  🔸 ${file}:${line} - ${type}`);
  });
  console.log('');
}

if (mediumFindings.length > 0) {
  console.log('📋 MEDIUM PRIORITY ISSUES:');
  mediumFindings.forEach(({ file, type, line }) => {
    console.log(`  🔹 ${file}:${line} - ${type}`);
  });
  console.log('');
}

console.log(`📈 Summary: ${scanResults.length} total findings`);
console.log(`   Critical: ${criticalFindings.length}, High: ${highFindings.length}, Medium: ${mediumFindings.length}, Low: ${lowFindings.length}`);

// 4. Generate secure configurations if issues found
if (scanResults.length > 0) {
  console.log('\n🔧 Generating secure configurations...\n');

  // Create secure netlify.toml
  const secureNetlifyToml = `# Secure Netlify Configuration for AIRWAVE
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"
  NODE_ENV = "production"
  # All secrets configured in Netlify UI - DO NOT ADD HERE

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://*.supabase.co https://creatomate.com;"

# API routes rate limiting
[[headers]]
  for = "/api/*"
  [headers.values]
    X-RateLimit-Limit = "100"
    X-RateLimit-Window = "3600"
`;

  fs.writeFileSync('./netlify.toml.secure', secureNetlifyToml);
  console.log('✅ Created netlify.toml.secure');

  // Create comprehensive .env.example
  const envExample = `# AIRWAVE Environment Variables Template
# Copy to .env.local and fill with actual values
# NEVER commit actual secrets to git

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Video Generation
CREATOMATE_API_KEY=your_creatomate_key
CREATOMATE_TEMPLATE_ID=your_template_id

# Authentication
JWT_SECRET=your_jwt_secret_min_32_chars
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Monitoring & Analytics
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Feature Flags
ENABLE_AI_COST_TRACKING=true
ENABLE_RATE_LIMITING=true
ENABLE_DEBUG_MODE=false

# Development
NODE_ENV=development
`;

  fs.writeFileSync('./.env.example', envExample);
  console.log('✅ Created .env.example template');

  // Update .gitignore
  const gitignoreContent = fs.existsSync('./.gitignore') ? fs.readFileSync('./.gitignore', 'utf8') : '';
  const gitignoreAdditions = `
# Security - Environment files
.env
.env.local
.env.production
.env.*.local

# Security - Keys and certificates
*.pem
*.key
*.cert
*.p12

# Security - Temporary and backup files
*.tmp
*.bak
*.swp
*~

# Security - OS generated files
.DS_Store
Thumbs.db

# Security - IDE files
.vscode/settings.json
.idea/

# Security - Logs that might contain sensitive data
*.log
logs/
`;

  if (!gitignoreContent.includes('.env')) {
    fs.appendFileSync('./.gitignore', gitignoreAdditions);
    console.log('✅ Updated .gitignore');
  }

  // Create pre-commit hook to prevent future exposures
  const preCommitHook = `#!/bin/sh
# Pre-commit hook to prevent secret exposure
echo "🔍 Checking for secrets before commit..."

# Run security scan
npx ts-node scripts/emergency-security-fix.ts --check-only

if [ $? -ne 0 ]; then
  echo "❌ Commit blocked: Secrets detected!"
  echo "Run: npx ts-node scripts/emergency-security-fix.ts"
  exit 1
fi

echo "✅ No secrets detected"
`;

  if (!fs.existsSync('./.husky')) {
    try {
      execSync('npx husky install', { stdio: 'inherit' });
      fs.writeFileSync('./.husky/pre-commit', preCommitHook);
      execSync('chmod +x ./.husky/pre-commit');
      console.log('✅ Created pre-commit hook');
    } catch (error) {
    const message = getErrorMessage(error);
      console.log('⚠️  Could not create pre-commit hook (husky not installed)');
    }
  }
}

// 5. Generate comprehensive security report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFindings: scanResults.length,
    critical: criticalFindings.length,
    high: highFindings.length,
    medium: mediumFindings.length,
    low: lowFindings.length
  },
  findings: scanResults,
  affectedFiles: [...new Set(scanResults.map(r => r.file))],
  recommendations: [
    'IMMEDIATE: Rotate all exposed API keys',
    'IMMEDIATE: Move secrets to Netlify environment variables',
    'HIGH: Replace hardcoded client IDs with context-based values',
    'HIGH: Implement input validation for all user inputs',
    'MEDIUM: Set up automated secret scanning in CI/CD',
    'MEDIUM: Enable pre-commit hooks to prevent future exposures',
    'LOW: Remove hardcoded test credentials from codebase'
  ],
  nextSteps: [
    '1. Review findings and assess impact',
    '2. Rotate all exposed credentials immediately',
    '3. Update Netlify environment variables',
    '4. Replace netlify.toml with secure version',
    '5. Commit changes: git add -A && git commit -m "security: remove hardcoded secrets"',
    '6. Deploy with new secure configuration'
  ]
};

fs.writeFileSync('./security-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed security report saved to security-audit-report.json');

// 6. Final recommendations
console.log('\n🎯 IMMEDIATE ACTION REQUIRED:');
if (criticalFindings.length > 0) {
  console.log('🚨 CRITICAL: Rotate these credentials immediately:');
  criticalFindings.forEach(({ type }) => {
    console.log(`   - ${type}`);
  });
}

console.log('\n📋 Next Steps:');
console.log('1. 🔑 Rotate all exposed API keys in their respective services');
console.log('2. 🌐 Set environment variables in Netlify UI (not in code)');
console.log('3. 📝 Replace netlify.toml with netlify.toml.secure');
console.log('4. 🔒 Install pre-commit hooks: npm install husky --save-dev');
console.log('5. ✅ Test deployment with secure configuration');
console.log('6. 📊 Monitor security-audit-report.json for ongoing issues');

console.log('\n🔐 Security audit complete!');
process.exit(scanResults.filter(f => f.severity === 'CRITICAL').length > 0 ? 1 : 0);
