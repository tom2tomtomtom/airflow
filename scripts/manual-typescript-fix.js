#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Manual TypeScript syntax error fixes...');

// Specific fixes for known malformed patterns
const fixes = [
  {
    file: 'src/pages/api/approval-workflow.ts',
    original: `export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    try {
    
    res.status(405).json({ success: false, message: 'Method not allowed' 
  }
    return handleApiError(error, res);
  });
  }`,
    fixed: `export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }`
  },
  {
    file: 'src/pages/api/auth/csrf-token.ts',
    original: `export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    try {
    
    res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed'  
  }
    return handleApiError(error, res);
  }
    });
  }`,
    fixed: `export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' }
    });
  }`
  }
];

let totalFixed = 0;

fixes.forEach(fix => {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(fix.original.split('\n')[0])) {
      content = content.replace(fix.original, fix.fixed);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${fix.file}`);
      totalFixed++;
    } else {
      console.log(`ℹ️  Pattern not found in ${fix.file}`);
    }
  } else {
    console.log(`⚠️  File not found: ${fix.file}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} files manually`);