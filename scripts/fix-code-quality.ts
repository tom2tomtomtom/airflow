#!/usr/bin/env tsx

/**
 * Automated Code Quality Fixes
 * This script fixes common code quality issues across the codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

interface FixStats {
  filesProcessed: number;
  gridComponentsFixed: number;
  unusedImportsRemoved: number;
  consoleStatementsFixed: number;
  eslintIssuesFixed: number;
}

const stats: FixStats = {
  filesProcessed: 0,
  gridComponentsFixed: 0,
  unusedImportsRemoved: 0,
  consoleStatementsFixed: 0,
  eslintIssuesFixed: 0
};

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, and other build directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          traverse(fullPath);
        }
      } else if (stat.isFile() && ['.tsx', '.ts'].includes(extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function fixGridComponents(content: string): string {
  let fixed = content;
  
  // Fix Grid components missing 'item' prop
  // Pattern: <Grid xs={...} md={...}> -> <Grid item xs={...} md={...}>
  fixed = fixed.replace(
    /<Grid(\s+)(?!.*\bitem\b)(?=.*\b(?:xs|sm|md|lg|xl)\s*=)/g,
    '<Grid$1item '
  );
  
  // Count fixes
  const gridMatches = content.match(/<Grid(\s+)(?!.*\bitem\b)(?=.*\b(?:xs|sm|md|lg|xl)\s*=)/g);
  if (gridMatches) {
    stats.gridComponentsFixed += gridMatches.length;
  }
  
  return fixed;
}

function fixUnusedImports(content: string): string {
  let fixed = content;
  const lines = content.split('\n');
  const newLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip import lines that import unused variables (basic detection)
    if (line.trim().startsWith('import ') && line.includes('{')) {
      // Extract imported names
      const importMatch = line.match(/import\s*\{([^}]+)\}\s*from/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(imp => imp.trim());
        const usedImports = imports.filter(imp => {
          const varName = imp.split(' as ')[0].trim();
          // Check if the variable is used anywhere in the file
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          const matches = content.match(regex);
          return matches && matches.length > 1; // More than just the import
        });
        
        if (usedImports.length === 0) {
          // Remove entire import line
          stats.unusedImportsRemoved++;
          continue;
        } else if (usedImports.length < imports.length) {
          // Keep only used imports
          const newImportLine = line.replace(
            /\{[^}]+\}/,
            `{${usedImports.join(', ')}}`
          );
          newLines.push(newImportLine);
          stats.unusedImportsRemoved += imports.length - usedImports.length;
          continue;
        }
      }
    }
    
    newLines.push(line);
  }
  
  return newLines.join('\n');
}

function fixConsoleStatements(content: string): string {
  let fixed = content;
  
  // Replace console.log with conditional development logging
  const consoleLogMatches = content.match(/console\.log\(/g);
  if (consoleLogMatches) {
    stats.consoleStatementsFixed += consoleLogMatches.length;
  }
  
  fixed = fixed.replace(
    /console\.log\(/g,
    'process.env.NODE_ENV === \'development\' && console.log('
  );
  
  // Replace console.error with proper error handling (keep as is, but count)
  const consoleErrorMatches = content.match(/console\.error\(/g);
  if (consoleErrorMatches) {
    // Don't change console.error, just count for stats
    // stats.consoleStatementsFixed += consoleErrorMatches.length;
  }
  
  return fixed;
}

function fixCommonTypeScriptIssues(content: string): string {
  let fixed = content;
  
  // Fix common any types with proper types
  // This is a basic implementation - more sophisticated fixes would require AST parsing
  
  // Fix: any[] -> unknown[]
  fixed = fixed.replace(/:\s*any\[\]/g, ': unknown[]');
  
  // Fix: Record<string, any> -> Record<string, unknown> (in some cases)
  // Be careful not to break intentional any usage
  
  return fixed;
}

function processFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf8');
    let fixed = content;
    
    // Apply all fixes
    fixed = fixGridComponents(fixed);
    fixed = fixUnusedImports(fixed);
    fixed = fixConsoleStatements(fixed);
    fixed = fixCommonTypeScriptIssues(fixed);
    
    // Only write if content changed
    if (fixed !== content) {
      writeFileSync(filePath, fixed, 'utf8');
      stats.filesProcessed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔧 Starting automated code quality fixes...');
  
  const srcDir = join(process.cwd(), 'src');
  const files = getAllTsxFiles(srcDir);
  
  console.log(`📁 Found ${files.length} TypeScript files to process`);
  
  let processedCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      processedCount++;
    }
  }
  
  console.log('\n✅ Code quality fixes completed!');
  console.log(`📊 Statistics:`);
  console.log(`  - Files processed: ${stats.filesProcessed}`);
  console.log(`  - Grid components fixed: ${stats.gridComponentsFixed}`);
  console.log(`  - Unused imports removed: ${stats.unusedImportsRemoved}`);
  console.log(`  - Console statements fixed: ${stats.consoleStatementsFixed}`);
  
  // Run type check to see improvement
  console.log('\n🔍 Running type check to measure improvement...');
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    console.log('✅ No TypeScript errors found!');
  } catch (error: any) {
    const output = error.stdout?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    console.log(`📉 TypeScript errors remaining: ${errorCount}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as fixCodeQuality };
