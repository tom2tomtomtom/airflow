#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Unused Imports and Dead Code Cleanup Tool
 * Identifies and removes unused imports, empty functions, and commented code
 */

let totalFilesProcessed = 0;
let totalImportsRemoved = 0;
let totalLinesRemoved = 0;
const cleanupReport = [];

// Patterns to identify unused imports and dead code
const UNUSED_PATTERNS = [
  // Commented code blocks
  /^\s*\/\/.*$/gm,
  // Multi-line comments (but preserve JSDoc)
  /\/\*(?!\*)[^*]*\*+(?:[^/*][^*]*\*+)*\//gm,
  // Empty functions
  /^(\s*)(?:const|let|var|function)\s+\w+\s*=?\s*(?:async\s+)?\(?[^{]*\)?\s*{\s*(?:\/\/[^\n]*\n\s*)*}\s*$/gm,
  // TODO/FIXME comments older than threshold
  /^\s*\/\*?\s*(?:TODO|FIXME|XXX|HACK)\s*:?[^*]*\*?\/?$/gm,
  // Empty try-catch blocks
  /try\s*{\s*}\s*catch\s*\([^)]*\)\s*{\s*}/gm,
];

// Files to exclude from cleanup
const EXCLUDED_PATTERNS = [
  '**/node_modules/**',
  '**/coverage/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/*.min.js',
  '**/scripts/unused-imports-cleanup.js',
];

// File extensions to process
const EXTENSIONS = ['js', 'ts', 'jsx', 'tsx'];

function shouldExcludeFile(filePath) {
  return EXCLUDED_PATTERNS.some(pattern => {
    const regex = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    return new RegExp(regex).test(filePath);
  });
}

function analyzeImports(content, filePath) {
  const lines = content.split('\n');
  const imports = new Map();
  const usages = new Set();
  const unusedImports = [];
  
  // Extract all imports
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Regular imports: import { a, b } from 'module'
    const namedImportMatch = line.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"][^'"]+['"]/);
    if (namedImportMatch) {
      const importedNames = namedImportMatch[1]
        .split(',')
        .map(name => name.trim().split(' as ')[0].trim());
      
      importedNames.forEach(name => {
        imports.set(name, { line: i, type: 'named', fullLine: line });
      });
    }
    
    // Default imports: import Something from 'module'
    const defaultImportMatch = line.match(/import\s+(\w+)\s+from\s*['"][^'"]+['"]/);
    if (defaultImportMatch) {
      const importName = defaultImportMatch[1];
      imports.set(importName, { line: i, type: 'default', fullLine: line });
    }
    
    // Type imports: import type { Type } from 'module'
    const typeImportMatch = line.match(/import\s+type\s*\{\s*([^}]+)\s*\}\s*from\s*['"][^'"]+['"]/);
    if (typeImportMatch) {
      const typeNames = typeImportMatch[1]
        .split(',')
        .map(name => name.trim());
      
      typeNames.forEach(name => {
        imports.set(name, { line: i, type: 'type', fullLine: line });
      });
    }
  }
  
  // Find usages of imported items
  const contentWithoutImports = lines
    .filter((_, i) => !Array.from(imports.values()).some(imp => imp.line === i))
    .join('\n');
  
  for (const [importName] of imports) {
    // Create regex to find usage (more sophisticated than simple string search)
    const usagePatterns = [
      new RegExp(`\\b${importName}\\b`, 'g'), // Direct usage
      new RegExp(`\\b${importName}\\.[a-zA-Z]`, 'g'), // Method/property access
      new RegExp(`<${importName}[\\s>]`, 'g'), // JSX component usage
      new RegExp(`typeof\\s+${importName}\\b`, 'g'), // TypeScript typeof
    ];
    
    const hasUsage = usagePatterns.some(pattern => pattern.test(contentWithoutImports));
    
    if (hasUsage) {
      usages.add(importName);
    } else {
      unusedImports.push(importName);
    }
  }
  
  return { imports, unusedImports, totalImports: imports.size };
}

function removeUnusedImports(content, filePath) {
  const { imports, unusedImports } = analyzeImports(content, filePath);
  
  if (unusedImports.length === 0) {
    return { cleanedContent: content, importsRemoved: 0 };
  }
  
  const lines = content.split('\n');
  const linesToRemove = new Set();
  
  // Mark lines with unused imports for removal
  for (const unusedImport of unusedImports) {
    const importInfo = imports.get(unusedImport);
    if (importInfo) {
      const line = lines[importInfo.line];
      
      if (importInfo.type === 'named') {
        // For named imports, try to remove just the unused import
        const updatedLine = removeFromNamedImport(line, unusedImport);
        if (updatedLine && updatedLine !== line) {
          lines[importInfo.line] = updatedLine;
        } else {
          linesToRemove.add(importInfo.line);
        }
      } else {
        // For default/type imports, remove the entire line
        linesToRemove.add(importInfo.line);
      }
    }
  }
  
  // Remove marked lines
  const cleanedLines = lines.filter((_, index) => !linesToRemove.has(index));
  
  return {
    cleanedContent: cleanedLines.join('\n'),
    importsRemoved: unusedImports.length
  };
}

function removeFromNamedImport(line, unusedImport) {
  // Extract the imports part
  const match = line.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*(['"][^'"]+['"])/);
  if (!match) return line;
  
  const [, importsList, fromPart] = match;
  const imports = importsList
    .split(',')
    .map(imp => imp.trim())
    .filter(imp => {
      const actualName = imp.split(' as ')[0].trim();
      return actualName !== unusedImport;
    });
  
  if (imports.length === 0) {
    return null; // Remove entire line
  }
  
  return `import { ${imports.join(', ')} } from ${fromPart}`;
}

function removeDeadCode(content) {
  let cleanedContent = content;
  let linesRemoved = 0;
  
  // Remove TODO/FIXME comments (keep recent ones)
  const todoPattern = /^\s*\/\/\s*(TODO|FIXME|XXX|HACK)\s*:?.*$/gm;
  const todos = cleanedContent.match(todoPattern) || [];
  linesRemoved += todos.length;
  cleanedContent = cleanedContent.replace(todoPattern, '');
  
  // Remove single-line comments that are clearly debug statements
  const debugCommentPattern = /^\s*\/\/\s*(console\.|debug|test|temp|remove|delete).*$/gm;
  const debugComments = cleanedContent.match(debugCommentPattern) || [];
  linesRemoved += debugComments.length;
  cleanedContent = cleanedContent.replace(debugCommentPattern, '');
  
  // Remove empty lines (but keep single empty lines for readability)
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return { cleanedContent, linesRemoved };
}

function processFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Step 1: Remove unused imports
    const { cleanedContent: contentAfterImports, importsRemoved } = removeUnusedImports(content, filePath);
    
    // Step 2: Remove dead code  
    const { cleanedContent: finalContent, linesRemoved } = removeDeadCode(contentAfterImports);
    
    if (importsRemoved > 0 || linesRemoved > 0) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      
      cleanupReport.push({
        file: filePath,
        importsRemoved,
        linesRemoved,
        relativePath: path.relative(process.cwd(), filePath)
      });
      
      totalImportsRemoved += importsRemoved;
      totalLinesRemoved += linesRemoved;
      
      console.log(`✓ Cleaned ${importsRemoved} imports, ${linesRemoved} lines from ${path.relative(process.cwd(), filePath)}`);
    }
    
    totalFilesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function generateReport() {
  const reportPath = path.join(process.cwd(), `unused-imports-cleanup-report-${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFilesProcessed,
      totalImportsRemoved,
      totalLinesRemoved,
      filesModified: cleanupReport.length
    },
    files: cleanupReport
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Cleanup report saved to: ${reportPath}`);
  
  return report;
}

// Main execution
console.log('🧹 Starting unused imports and dead code cleanup...\n');

const startTime = Date.now();

// Find all files to process
const allFiles = [];
EXTENSIONS.forEach(ext => {
  const pattern = `**/*.${ext}`;
  const files = glob.sync(pattern, { ignore: EXCLUDED_PATTERNS });
  allFiles.push(...files);
});

console.log(`Found ${allFiles.length} files to process\n`);

// Process each file
allFiles.forEach(processFile);

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

// Generate and display summary
const report = generateReport();

console.log('\n🎉 Cleanup completed!');
console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
console.log(`📁 Files processed: ${report.summary.totalFilesProcessed}`);
console.log(`📝 Files modified: ${report.summary.filesModified}`);
console.log(`📦 Unused imports removed: ${report.summary.totalImportsRemoved}`);
console.log(`🗑️  Dead code lines removed: ${report.summary.totalLinesRemoved}`);

if (report.summary.filesModified > 0) {
  console.log('\n📋 Top files cleaned:');
  cleanupReport
    .sort((a, b) => (b.importsRemoved + b.linesRemoved) - (a.importsRemoved + a.linesRemoved))
    .slice(0, 10)
    .forEach(item => {
      console.log(`   • ${item.relativePath}: ${item.importsRemoved} imports, ${item.linesRemoved} lines`);
    });
}