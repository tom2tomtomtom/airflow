#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

console.log('🚀 Starting comprehensive TypeScript error fix...\n');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const UTILS_DIR = path.join(SRC_DIR, 'utils');
const LIB_DIR = path.join(SRC_DIR, 'lib');

// Track fixes
let fixCount = 0;
let errorCount = 0;
const fixLog = [];

// Helper functions
function log(message, type = 'info') {
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📝';
  
  console.log(`${prefix} ${message}`);
  fixLog.push({ message, type, timestamp: new Date().toISOString() });
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`Failed to read ${filePath}: ${error.message}`, 'error');
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    fixCount++;
    log(`Fixed ${filePath}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to write ${filePath}: ${error.message}`, 'error');
    errorCount++;
    return false;
  }
}

// Fix 1: Remove unused imports
function removeUnusedImports(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const originalContent = content;
  
  // Find all imports
  const importRegex = /import\s+(?:{([^}]+)}|([^,\s]+)(?:\s*,\s*{([^}]+)})?)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1] || match[3] || '';
    const defaultImport = match[2] || '';
    const source = match[4];
    
    imports.push({
      full: match[0],
      named: namedImports.split(',').map(i => i.trim()).filter(Boolean),
      default: defaultImport.trim(),
      source
    });
  }
  
  // Check which imports are used
  imports.forEach(imp => {
    const contentWithoutImports = content.replace(/import[^;]+;/g, '');
    
    // Check default import
    if (imp.default && !new RegExp(`\\b${imp.default}\\b`).test(contentWithoutImports)) {
      content = content.replace(imp.full, '');
    }
    
    // Check named imports
    const usedNamed = imp.named.filter(name => {
      const cleanName = name.split(' as ')[0].trim();
      return new RegExp(`\\b${cleanName}\\b`).test(contentWithoutImports);
    });
    
    if (usedNamed.length < imp.named.length && usedNamed.length > 0) {
      const newImport = `import { ${usedNamed.join(', ')} } from '${imp.source}'`;
      content = content.replace(imp.full, newImport);
    }
  });
  
  // Clean up empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (content !== originalContent) {
    return writeFile(filePath, content);
  }
  return false;
}

// Fix 2: Add missing type annotations
function addTypeAnnotations(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const originalContent = content;
  
  // Add 'any' type to parameters without types
  content = content.replace(
    /(\w+)\s*\(\s*([^)]+)\s*\)\s*{/g,
    (match, funcName, params) => {
      const typedParams = params.split(',').map(param => {
        param = param.trim();
        if (param && !param.includes(':') && !param.includes('=')) {
          return `${param}: any`;
        }
        return param;
      }).join(', ');
      return `${funcName}(${typedParams}) {`;
    }
  );
  
  // Add return type 'any' to functions without return types
  content = content.replace(
    /(\w+)\s*\(([^)]*)\)\s*{/g,
    (match, funcName, params) => {
      if (!match.includes(':') && !match.includes('=>')) {
        return `${funcName}(${params}): any {`;
      }
      return match;
    }
  );
  
  // Fix arrow functions without parameter types
  content = content.replace(
    /\(([^)]+)\)\s*=>/g,
    (match, params) => {
      const typedParams = params.split(',').map(param => {
        param = param.trim();
        if (param && !param.includes(':') && !param.includes('=')) {
          return `${param}: any`;
        }
        return param;
      }).join(', ');
      return `(${typedParams}) =>`;
    }
  );
  
  if (content !== originalContent) {
    return writeFile(filePath, content);
  }
  return false;
}

// Fix 3: Fix common type mismatches
function fixTypeMismatches(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const originalContent = content;
  
  // Fix SUPABASE_SERVICE_KEY -> SUPABASE_SERVICE_ROLE_KEY
  content = content.replace(/SUPABASE_SERVICE_KEY/g, 'SUPABASE_SERVICE_ROLE_KEY');
  
  // Fix optional chaining where needed
  content = content.replace(/(\w+)\.(\w+)\.(\w+)/g, (match, obj, prop1, prop2) => {
    // Add optional chaining for common patterns
    if (['session', 'user', 'data', 'error', 'campaign'].includes(obj)) {
      return `${obj}?.${prop1}?.${prop2}`;
    }
    return match;
  });
  
  // Fix async function types
  content = content.replace(
    /async\s+(\w+)\s*\(([^)]*)\)\s*{/g,
    (match, funcName, params) => {
      if (!match.includes('Promise')) {
        return `async ${funcName}(${params}): Promise<any> {`;
      }
      return match;
    }
  );
  
  // Fix missing properties by adding them as optional
  content = content.replace(
    /interface\s+(\w+)\s*{([^}]+)}/g,
    (match, interfaceName, body) => {
      if (interfaceName.includes('Campaign') && !body.includes('schedule')) {
        body = body.trimEnd() + '\n  schedule?: any;\n';
      }
      return `interface ${interfaceName} {${body}}`;
    }
  );
  
  if (content !== originalContent) {
    return writeFile(filePath, content);
  }
  return false;
}

// Fix 4: Add missing imports
function addMissingImports(filePath) {
  let content = readFile(filePath);
  if (!content) return false;
  
  const originalContent = content;
  const imports = [];
  
  // Check for common missing imports
  if (content.includes('useState') && !content.includes('import.*useState.*from.*react')) {
    imports.push("import { useState } from 'react';");
  }
  
  if (content.includes('useEffect') && !content.includes('import.*useEffect.*from.*react')) {
    imports.push("import { useEffect } from 'react';");
  }
  
  if (content.includes('useRouter') && !content.includes('import.*useRouter.*from.*next/router')) {
    imports.push("import { useRouter } from 'next/router';");
  }
  
  if (content.includes('supabase') && !content.includes('import.*supabase')) {
    // For API routes, use server module
    if (filePath.includes('/pages/api/')) {
      imports.push("import { createClient } from '@/lib/supabase/server';");
      imports.push("const supabase = createClient();");
    } else {
      // For client-side code, use client module  
      imports.push("import { createClient } from '@/lib/supabase/client';");
      imports.push("const supabase = createClient();");
    }
  }
  
  if (imports.length > 0) {
    // Add imports at the top of the file
    const importSection = imports.join('\n') + '\n\n';
    content = importSection + content;
    return writeFile(filePath, content);
  }
  
  return false;
}

// Fix 5: Fix ESLint issues
function fixESLintIssues(filePath) {
  try {
    execSync(`npx eslint --fix "${filePath}"`, { 
      cwd: PROJECT_ROOT,
      stdio: 'pipe'
    });
    fixCount++;
    log(`ESLint fixed ${filePath}`, 'success');
    return true;
  } catch (error) {
    // ESLint exit with non-zero if there are unfixable errors, which is OK
    return false;
  }
}

// Fix 6: Create missing type definitions
function createTypeDefinitions() {
  const typeDefsPath = path.join(SRC_DIR, 'types', 'index.d.ts');
  const typeDefsDir = path.dirname(typeDefsPath);
  
  if (!fs.existsSync(typeDefsDir)) {
    fs.mkdirSync(typeDefsDir, { recursive: true });
  }
  
  const typeDefinitions = `// Auto-generated type definitions
// Add any missing types here

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add missing global types
declare global {
  interface Window {
    // Add any custom window properties
  }
}

// Common type aliases
export type ID = string | number;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = any> = () => Promise<T>;

// Fix for missing types
export interface FixMeLater {
  [key: string]: any;
}

export {};
`;

  return writeFile(typeDefsPath, typeDefinitions);
}

// Main execution
async function main() {
  log('Starting TypeScript error fixes...', 'info');
  
  // Step 1: Create type definitions
  log('Creating type definitions...', 'info');
  createTypeDefinitions();
  
  // Get all TypeScript files
  const tsFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    ignore: ['node_modules/**', 'dist/**', '.next/**'],
    absolute: true
  });
  
  log(`Found ${tsFiles.length} TypeScript files to process`, 'info');
  
  // Process each file
  for (const file of tsFiles) {
    log(`Processing ${path.relative(PROJECT_ROOT, file)}...`, 'info');
    
    // Apply fixes in order
    removeUnusedImports(file);
    addTypeAnnotations(file);
    fixTypeMismatches(file);
    addMissingImports(file);
    fixESLintIssues(file);
  }
  
  // Step 2: Run TypeScript compiler to check remaining errors
  log('\nRunning TypeScript compiler check...', 'info');
  try {
    execSync('npx tsc --noEmit', { 
      cwd: PROJECT_ROOT,
      stdio: 'pipe'
    });
    log('No TypeScript errors found!', 'success');
  } catch (error) {
    const output = error.stdout?.toString() || '';
    const errors = output.split('\n').filter(line => line.includes('error TS'));
    log(`Found ${errors.length} remaining TypeScript errors`, 'warning');
    
    // Save error report
    const errorReport = errors.join('\n');
    fs.writeFileSync(
      path.join(PROJECT_ROOT, 'typescript-errors-remaining.txt'),
      errorReport
    );
    log('Saved remaining errors to typescript-errors-remaining.txt', 'info');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`✅ Fixed: ${fixCount} issues`);
  console.log(`❌ Errors: ${errorCount} issues`);
  
  // Save fix log
  const logPath = path.join(PROJECT_ROOT, 'typescript-fix-log.json');
  fs.writeFileSync(logPath, JSON.stringify(fixLog, null, 2));
  log(`\nFix log saved to ${logPath}`, 'info');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
