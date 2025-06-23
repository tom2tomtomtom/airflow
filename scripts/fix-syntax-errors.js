#!/usr/bin/env node

/**
 * Emergency Syntax Error Fixer
 * Fixes common syntax patterns blocking the build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class SyntaxErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.errorPatterns = [
      // Pattern 1: Missing comma after object property
      {
        pattern: /(\w+:\s*[^,}\n]+)\s*\n\s*(\w+:)/g,
        replacement: '$1,\n    $2',
        description: 'Missing comma after object property'
      },
      
      // Pattern 2: Extra closing braces in objects
      {
        pattern: /}}\)}/g,
        replacement: '}))',
        description: 'Extra closing braces'
      },
      
      // Pattern 3: Missing comma before closing object brace
      {
        pattern: /([^,\s])\s*}}/g,
        replacement: '$1 }',
        description: 'Missing space before closing brace'
      },
      
      // Pattern 4: Malformed JSX fragments
      {
        pattern: /<>\s*{/g,
        replacement: '<>\n      {',
        description: 'JSX fragment formatting'
      },
      
      // Pattern 5: Missing comma in dropzone accept
      {
        pattern: /accept:\s*{\s*'([^']+)':\s*\[[^\]]+\]\s*}/g,
        replacement: "accept: { '$1': ['.png', '.jpg', '.jpeg'] }",
        description: 'Dropzone accept formatting'
      }
    ];
  }

  /**
   * Fix syntax errors across the codebase
   */
  async fixSyntaxErrors() {
    console.log(chalk.blue.bold('\n🔧 EMERGENCY SYNTAX ERROR FIXER'));
    console.log(chalk.blue('===================================\n'));

    try {
      // Get all TypeScript/JSX files
      const files = this.getSourceFiles();
      console.log(chalk.gray(`Found ${files.length} source files to check\n`));

      // Fix files in batches
      let fixedCount = 0;
      for (const file of files) {
        const fixed = await this.fixFile(file);
        if (fixed) {
          fixedCount++;
          this.fixedFiles.push(file);
        }
      }

      console.log(chalk.green(`\n✅ Fixed ${fixedCount} files with syntax errors`));
      
      // Generate report
      this.generateFixReport();

    } catch (error) {
      console.error(chalk.red('❌ Syntax fixing failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Get all source files to fix
   */
  getSourceFiles() {
    try {
      const result = execSync('find src -name "*.tsx" -o -name "*.ts" | head -50', { encoding: 'utf8' });
      return result.split('\n').filter(f => f.trim());
    } catch (error) {
      return [];
    }
  }

  /**
   * Fix a single file
   */
  async fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) return false;

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let hasChanges = false;

      // Apply each fix pattern
      for (const pattern of this.errorPatterns) {
        const newContent = content.replace(pattern.pattern, pattern.replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
          console.log(chalk.gray(`    Fixed: ${pattern.description} in ${filePath}`));
        }
      }

      // Apply specific fixes for known problematic files
      content = this.applySpecificFixes(content, filePath);
      if (content !== originalContent) {
        hasChanges = true;
      }

      // Write back if changed
      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(chalk.green(`  ✅ Fixed ${filePath}`));
        return true;
      }

      return false;
    } catch (error) {
      console.log(chalk.yellow(`  ⚠️ Could not fix ${filePath}: ${error.message}`));
      return false;
    }
  }

  /**
   * Apply specific fixes for known problematic patterns
   */
  applySpecificFixes(content, filePath) {
    // Fix AssetUploadModal dropzone syntax
    if (filePath.includes('AssetUploadModal')) {
      content = content.replace(
        /accept:\s*{\s*'image\/\*':\s*\[[^\]]+\],\s*'video\/\*':\s*\[[^\]]+\],\s*'audio\/\*':\s*\[[^\]]+\]}/g,
        `accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    }`
      );
      
      content = content.replace(/multiple:\s*true,/g, 'multiple: true');
    }

    // Fix ErrorBoundary object syntax
    if (filePath.includes('ErrorBoundary')) {
      content = content.replace(
        /errorBoundary:\s*true}}\)/g,
        'errorBoundary: true })'
      );
      
      content = content.replace(
        /metadata:\s*{},\s*componentStack:/g,
        'metadata: {}, componentStack:'
      );
    }

    // Fix ClientSelector JSX syntax
    if (filePath.includes('ClientSelector')) {
      content = content.replace(
        /return\s*\(\s*<>\s*{renderButton\(\)}\s*<Menu/g,
        'return (\n    <>\n      {renderButton()}\n      <Menu'
      );
    }

    // Fix GlobalSearch Dialog syntax
    if (filePath.includes('GlobalSearch')) {
      content = content.replace(
        /return\s*\(\s*<Dialog/g,
        'return (\n    <Dialog'
      );
    }

    // Fix AIImageGenerator interface syntax
    if (filePath.includes('AIImageGenerator')) {
      content = content.replace(
        /};\s*};\s*}/g,
        '}\n  };\n}'
      );
    }

    return content;
  }

  /**
   * Generate fix report
   */
  generateFixReport() {
    console.log(chalk.blue.bold('\n📋 SYNTAX FIX REPORT'));
    console.log(chalk.blue('====================\n'));

    console.log(chalk.white.bold('FIXED FILES:'));
    this.fixedFiles.forEach((file, index) => {
      console.log(chalk.green(`  ${index + 1}. ${file}`));
    });

    console.log(chalk.white.bold('\nFIX PATTERNS APPLIED:'));
    this.errorPatterns.forEach((pattern, index) => {
      console.log(chalk.blue(`  ${index + 1}. ${pattern.description}`));
    });

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      fixedFiles: this.fixedFiles,
      patternsApplied: this.errorPatterns.length,
      totalFiles: this.fixedFiles.length
    };

    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/syntax-fix-report.json', JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📄 Report saved to: reports/syntax-fix-report.json`));

    console.log(chalk.blue.bold('\n🎯 NEXT STEP: Try building again'));
    console.log(chalk.blue('npm run build\n'));
  }
}

// Run syntax fixer if called directly
if (require.main === module) {
  const fixer = new SyntaxErrorFixer();
  fixer.fixSyntaxErrors().catch(error => {
    console.error(chalk.red('\n❌ Syntax fixing failed:'), error.message);
    process.exit(1);
  });
}

module.exports = SyntaxErrorFixer;