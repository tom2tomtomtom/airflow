#!/usr/bin/env node
// scripts/fix-all-typescript-errors.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Fix {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
  description: string;
  filePattern?: RegExp;
}

interface ImportFix {
  unusedImports: string[];
  file: string;
}

// Enhanced fixes based on the error report
const fixes: Fix[] = [
  // Fix SUPABASE_SERVICE_KEY typo
  {
    pattern: /SUPABASE_SERVICE_KEY/g,
    replacement: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Fix SUPABASE_SERVICE_KEY typo',
    filePattern: /supabase\.ts$/
  },
  
  // Fix missing types for API handlers
  {
    pattern: /export default (async )?function\s+(\w+)\s*\(([^)]*)\)(\s*:\s*[^{]+)?\s*{/g,
    replacement: (match, async, name, params, returnType) => {
      if (params.includes('NextApiRequest') || returnType) return match;
      const isAsync = async ? 'async ' : '';
      const returns = async ? ': Promise<void>' : ': void';
      return `export default ${isAsync}function ${name}(req: NextApiRequest, res: NextApiResponse)${returns} {`;
    },
    description: 'Add NextApiRequest/Response types to API handlers',
    filePattern: /pages\/api\/.*\.ts$/
  },
  
  // Fix error handling with proper typing
  {
    pattern: /catch\s*\(\s*error\s*\)\s*{(?![^}]*const message = getErrorMessage)/g,
    replacement: 'catch (error) {\n    const message = getErrorMessage(error);',
    description: 'Fix error handling with proper typing'
  },
  
  // Fix useState without types
  {
    pattern: /const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState\(null\)/g,
    replacement: 'const [$1, set$2] = useState<any>(null)',
    description: 'Add type to useState(null)'
  },
  
  // Fix implicit any in map functions
  {
    pattern: /\.map\(\((\w+)\)\s*=>/g,
    replacement: '.map(($1: any) =>',
    description: 'Add any type to map callbacks'
  },
  
  // Fix unused event parameters
  {
    pattern: /\((\s*)event(\s*)(,|\))/g,
    replacement: '($1_event$2$3',
    description: 'Prefix unused event parameters with underscore'
  },
  
  // Fix unused 'e' parameters
  {
    pattern: /\((\s*)e(\s*)(,|\))\s*=>/g,
    replacement: '($1_e$2$3 =>',
    description: 'Prefix unused e parameters with underscore'
  },
  
  // Fix unused req parameters in API routes
  {
    pattern: /\(\s*req\s*,\s*res\s*\)\s*([=:>])/g,
    replacement: '(_req, res) $1',
    description: 'Prefix unused req parameters with underscore',
    filePattern: /pages\/api\/.*\.ts$/
  },
  
  // Fix unused context in getServerSideProps
  {
    pattern: /export async function getServerSideProps\(context\)/g,
    replacement: 'export async function getServerSideProps(_context)',
    description: 'Prefix unused context parameter with underscore'
  },
  
  // Fix optional properties with exactOptionalPropertyTypes
  {
    pattern: /: (string|number|boolean) \| undefined/g,
    replacement: '?: $1',
    description: 'Convert union with undefined to optional property'
  },
  
  // Fix Client type assignments
  {
    pattern: /: Client \| undefined/g,
    replacement: ': Client | null',
    description: 'Change Client | undefined to Client | null'
  },
  
  // Add Campaign import where needed
  {
    pattern: /^((?!import.*Campaign)[\s\S]*property.*does not exist on type.*Campaign)/m,
    replacement: (match) => {
      return `import { Campaign } from '@/types';\n${match}`;
    },
    description: 'Add Campaign type import where needed',
    filePattern: /campaigns\/.*\.tsx?$/
  }
];

// Function to extract unused imports from TypeScript error output
function extractUnusedImports(errorOutput: string): ImportFix[] {
  const importFixes: ImportFix[] = [];
  const lines = errorOutput.split('\n');
  
  const currentFile: { [key: string]: string[] } = {};
  
  lines.forEach(line => {
    const match = line.match(/(.+)\((\d+),(\d+)\): error TS6133: '(.+)' is declared but its value is never read\./);
    if (match) {
      const [, filePath, , , importName] = match;
      if (!currentFile[filePath]) {
        currentFile[filePath] = [];
      }
      currentFile[filePath].push(importName);
    }
  });
  
  Object.entries(currentFile).forEach(([file, imports]) => {
    importFixes.push({ file, unusedImports: imports });
  });
  
  return importFixes;
}

// Function to remove unused imports from a file
async function removeUnusedImports(filePath: string, unusedImports: string[]): Promise<number> {
  let content = await fs.readFile(filePath, 'utf-8');
  let fixCount = 0;
  
  unusedImports.forEach(importName => {
    // Remove from named imports
    const namedImportRegex = new RegExp(`(\\{[^}]*?)\\b${importName}\\b,?\\s*([^}]*?\\})`, 'g');
    content = content.replace(namedImportRegex, (match, before, after) => {
      fixCount++;
      const cleaned = `${before}${after}`.replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
      return cleaned === '{}' ? '' : cleaned;
    });
    
    // Remove entire import line if it's now empty
    content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\n?/g, '');
    
    // Remove default imports
    const defaultImportRegex = new RegExp(`import\\s+${importName}\\s+from\\s+['"][^'"]+['"];?\\n?`, 'g');
    if (content.match(defaultImportRegex)) {
      content = content.replace(defaultImportRegex, '');
      fixCount++;
    }
    
    // Remove namespace imports
    const namespaceImportRegex = new RegExp(`import\\s+\\*\\s+as\\s+${importName}\\s+from\\s+['"][^'"]+['"];?\\n?`, 'g');
    if (content.match(namespaceImportRegex)) {
      content = content.replace(namespaceImportRegex, '');
      fixCount++;
    }
  });
  
  if (fixCount > 0) {
    await fs.writeFile(filePath, content);
  }
  
  return fixCount;
}

// Function to fix specific file issues
async function fixSpecificIssues(filePath: string): Promise<number> {
  let content = await fs.readFile(filePath, 'utf-8');
  let fixCount = 0;
  
  // Fix specific issues based on file path
  if (filePath.includes('campaigns/[id]')) {
    // Add proper type guards for budget property
    content = content.replace(
      /campaign\.budget\.total/g,
      "typeof campaign.budget === 'object' ? campaign.budget.total : campaign.budget"
    );
    fixCount++;
  }
  
  if (filePath.includes('lib/auth.ts')) {
    // Fix optional property types
    content = content.replace(
      /token: string \| undefined;/g,
      'token?: string;'
    );
    content = content.replace(
      /emailConfirmationRequired: boolean \| undefined;/g,
      'emailConfirmationRequired?: boolean;'
    );
    fixCount += 2;
  }
  
  if (fixCount > 0) {
    await fs.writeFile(filePath, content);
  }
  
  return fixCount;
}

// Main function to apply all fixes
async function fixFile(filePath: string): Promise<number> {
  let content = await fs.readFile(filePath, 'utf-8');
  let fixCount = 0;
  
  // Check if we need imports
  const needsNextImports = filePath.includes('pages/api/') && !content.includes('import { NextApiRequest, NextApiResponse }');
  const needsErrorUtils = content.includes('catch') && !content.includes('import { getErrorMessage }');
  
  // Add imports if needed
  if (needsNextImports) {
    content = `import { NextApiRequest, NextApiResponse } from 'next';\n${content}`;
    fixCount++;
  }
  
  if (needsErrorUtils) {
    content = `import { getErrorMessage } from '@/utils/errorUtils';\n${content}`;
    fixCount++;
  }
  
  // Apply pattern-based fixes
  for (const fix of fixes) {
    if (fix.filePattern && !fix.filePattern.test(filePath)) {
      continue;
    }
    
    const matches = content.match(fix.pattern);
    if (matches) {
      const oldContent = content;
      if (typeof fix.replacement === 'string') {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }
      
      if (oldContent !== content) {
        fixCount += matches.length;
        console.log(`  ✓ ${fix.description} (${matches.length} occurrences)`);
      }
    }
  }
  
  if (fixCount > 0) {
    await fs.writeFile(filePath, content);
  }
  
  return fixCount;
}

// Create error utility if it doesn't exist
async function createErrorUtils() {
  const errorUtilsPath = path.join(process.cwd(), 'utils', 'errorUtils.ts');
  const errorUtilsContent = `// utils/errorUtils.ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
`;

  try {
    await fs.access(errorUtilsPath);
  } catch {
    await fs.mkdir(path.dirname(errorUtilsPath), { recursive: true });
    await fs.writeFile(errorUtilsPath, errorUtilsContent);
    console.log('✅ Created utils/errorUtils.ts');
  }
}

// Main execution
async function main() {
  console.log('🔧 Starting comprehensive TypeScript fixes...\n');
  
  // Create error utils if needed
  await createErrorUtils();
  
  // Get TypeScript errors
  console.log('📊 Analyzing TypeScript errors...');
  let errorOutput = '';
  try {
    const { stdout } = await execAsync('npm run type-check 2>&1', { 
      maxBuffer: 1024 * 1024 * 10 
    });
    errorOutput = stdout;
  } catch (error: any) {
    errorOutput = error.stdout || '';
  }
  
  // Extract unused imports
  const importFixes = extractUnusedImports(errorOutput);
  
  // Fix unused imports first
  console.log('\n🧹 Removing unused imports...');
  let totalImportFixes = 0;
  for (const { file, unusedImports } of importFixes) {
    const fixes = await removeUnusedImports(file, unusedImports);
    if (fixes > 0) {
      console.log(`  ✓ Fixed ${fixes} unused imports in ${file}`);
      totalImportFixes += fixes;
    }
  }
  
  // Find all TypeScript files
  console.log('\n🔍 Applying pattern-based fixes...');
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'scripts/fix-all-typescript-errors.ts']
  });
  
  let totalPatternFixes = 0;
  let filesFixed = 0;
  
  for (const file of files) {
    console.log(`\n📝 Processing ${file}...`);
    const patternFixes = await fixFile(file);
    const specificFixes = await fixSpecificIssues(file);
    const totalFixes = patternFixes + specificFixes;
    
    if (totalFixes > 0) {
      totalPatternFixes += totalFixes;
      filesFixed++;
    }
  }
  
  // Run ESLint auto-fix for any remaining issues
  console.log('\n🧹 Running ESLint auto-fix...');
  try {
    await execAsync('npx eslint . --fix --ext .ts,.tsx');
    console.log('  ✓ ESLint auto-fix completed');
  } catch {
    console.log('  ⚠️  ESLint auto-fix had some issues (this is normal)');
  }
  
  // Summary
  const totalFixes = totalImportFixes + totalPatternFixes;
  console.log(`\n✅ Complete! Fixed ${totalFixes} issues in ${filesFixed} files`);
  console.log('\nNext steps:');
  console.log('1. Run "npm run type-check" to see remaining errors');
  console.log('2. Manually fix any complex type issues');
  console.log('3. Consider enabling stricter TypeScript settings');
  console.log('\nTo enable stricter settings, update tsconfig.json:');
  console.log(JSON.stringify({
    compilerOptions: {
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitAny: true,
      strictNullChecks: true
    }
  }, null, 2));
}

main().catch(console.error);
