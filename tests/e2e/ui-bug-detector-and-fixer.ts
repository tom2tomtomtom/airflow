import * as fs from 'fs/promises';
import * as path from 'path';

// Interface for detected issues
interface UIIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix: string;
  autoFixable: boolean;
}

// Common UI patterns that should exist
const requiredPatterns = {
  passwordToggle: {
    pattern: /data-testid=["']password-toggle/,
    fix: `data-testid="password-toggle-button"`,
    description: 'Password visibility toggle missing test ID'
  },
  errorDisplay: {
    pattern: /\{error\s*&&\s*\(/,
    requiredTestId: 'data-testid="error-message"',
    description: 'Error message display missing test ID'
  },
  uploadButton: {
    pattern: /upload|Upload/i,
    requiredTestId: 'data-testid="upload-button"',
    description: 'Upload button missing test ID'
  },
  navigation: {
    pattern: /<nav|component=["']nav["']/,
    requiredTestId: 'data-testid="sidebar-nav"',
    description: 'Navigation missing test ID'
  },
  userMenu: {
    pattern: /UserMenu|user-menu/,
    requiredTestId: 'data-testid="user-menu"',
    description: 'User menu missing test ID'
  }
};

// Validation patterns
const validationPatterns = {
  formValidation: {
    pattern: /handleSubmit|onSubmit/,
    requiredValidation: /if\s*\(!.*\)/,
    description: 'Form validation missing'
  },
  emptyStateCheck: {
    pattern: /\.map\(/,
    requiredCheck: /\.length\s*===\s*0|isEmpty/,
    description: 'Missing empty state check'
  }
};

export class UIBugDetectorAndFixer {
  private issues: UIIssue[] = [];
  private srcPath: string;

  constructor(projectPath: string) {
    this.srcPath = path.join(projectPath, 'src');
  }

  async scanProject(): Promise<UIIssue[]> {
    console.log('🔍 Scanning project for UI issues...\n');
    this.issues = [];

    // Scan all TypeScript/React files
    await this.scanDirectory(this.srcPath);

    return this.issues;
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        await this.scanFile(fullPath);
      }
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), filePath);

    console.log(`Scanning: ${relativePath}`);

    // Check for missing test IDs
    this.checkMissingTestIds(content, lines, relativePath);

    // Check for validation issues
    this.checkValidationIssues(content, lines, relativePath);

    // Check for accessibility issues
    this.checkAccessibilityIssues(content, lines, relativePath);

    // Check for missing error handling
    this.checkErrorHandling(content, lines, relativePath);
  }

  private checkMissingTestIds(content: string, lines: string[], file: string): void {
    // Check password toggle
    if (content.includes('password') && content.includes('IconButton') && !content.includes('data-testid="password-toggle')) {
      const lineNum = this.findLineNumber(lines, /IconButton.*show.*password/i);
      if (lineNum > -1) {
        this.issues.push({
          file,
          line: lineNum,
          issue: 'Password toggle button missing test ID',
          severity: 'high',
          suggestedFix: 'Add data-testid="password-toggle-button" to IconButton',
          autoFixable: true
        });
      }
    }

    // Check upload buttons
    if (content.match(/upload/i) && content.includes('Button') && !content.includes('data-testid="upload-button"')) {
      const lineNum = this.findLineNumber(lines, /Button.*upload/i);
      if (lineNum > -1) {
        this.issues.push({
          file,
          line: lineNum,
          issue: 'Upload button missing test ID',
          severity: 'medium',
          suggestedFix: 'Add data-testid="upload-button" to Button',
          autoFixable: true
        });
      }
    }

    // Check navigation
    if (content.match(/<nav|component=["']nav["']/) && !content.includes('data-testid="sidebar-nav"')) {
      const lineNum = this.findLineNumber(lines, /<nav|component=["']nav["']/);
      if (lineNum > -1) {
        this.issues.push({
          file,
          line: lineNum,
          issue: 'Navigation component missing test ID',
          severity: 'medium',
          suggestedFix: 'Add data-testid="sidebar-nav" to navigation component',
          autoFixable: true
        });
      }
    }
  }

  private checkValidationIssues(content: string, lines: string[], file: string): void {
    // Check form validation
    if (content.includes('handleSubmit')) {
      const submitIndex = content.indexOf('handleSubmit');
      const functionEnd = content.indexOf('}', submitIndex);
      const submitFunction = content.substring(submitIndex, functionEnd);

      if (!submitFunction.match(/if\s*\(!.*\)/) && !submitFunction.includes('validate')) {
        const lineNum = this.findLineNumber(lines, /handleSubmit/);
        this.issues.push({
          file,
          line: lineNum,
          issue: 'Form submission missing validation',
          severity: 'high',
          suggestedFix: 'Add validation checks before processing form data',
          autoFixable: false
        });
      }
    }

    // Check for error display
    if (content.includes('error') && content.includes('useState') && !content.match(/\{error\s*&&/)) {
      this.issues.push({
        file,
        line: 0,
        issue: 'Error state defined but not displayed to user',
        severity: 'high',
        suggestedFix: 'Add error display component with proper styling',
        autoFixable: false
      });
    }
  }

  private checkAccessibilityIssues(content: string, lines: string[], file: string): void {
    // Check for missing aria-labels on icon buttons
    if (content.includes('IconButton') && !content.includes('aria-label')) {
      const lineNum = this.findLineNumber(lines, /IconButton/);
      this.issues.push({
        file,
        line: lineNum,
        issue: 'IconButton missing aria-label for accessibility',
        severity: 'medium',
        suggestedFix: 'Add aria-label to describe button action',
        autoFixable: true
      });
    }

    // Check for images without alt text
    if (content.match(/<img|Image/) && !content.includes('alt=')) {
      const lineNum = this.findLineNumber(lines, /<img|Image/);
      this.issues.push({
        file,
        line: lineNum,
        issue: 'Image missing alt text',
        severity: 'medium',
        suggestedFix: 'Add alt attribute with descriptive text',
        autoFixable: false
      });
    }
  }

  private checkErrorHandling(content: string, lines: string[], file: string): void {
    // Check for async functions without try-catch
    const asyncPattern = /async\s+(?:function\s+)?(\w+)?\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g;
    let match;

    while ((match = asyncPattern.exec(content)) !== null) {
      const functionStart = match.index;
      const functionEnd = this.findMatchingBrace(content, functionStart);
      const functionBody = content.substring(functionStart, functionEnd);

      if (!functionBody.includes('try') && !functionBody.includes('catch')) {
        const lineNum = this.findLineNumber(lines, new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        this.issues.push({
          file,
          line: lineNum,
          issue: `Async function missing error handling`,
          severity: 'high',
          suggestedFix: 'Wrap async operations in try-catch block',
          autoFixable: false
        });
      }
    }
  }

  private findLineNumber(lines: string[], pattern: RegExp): number {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return -1;
  }

  private findMatchingBrace(content: string, start: number): number {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = start; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') {
          braceCount--;
          if (braceCount === 0) return i + 1;
        }
      }
    }

    return content.length;
  }

  async applyAutoFixes(): Promise<void> {
    console.log('\n🔧 Applying automatic fixes...\n');

    const fixableIssues = this.issues.filter(issue => issue.autoFixable);

    for (const issue of fixableIssues) {
      await this.applyFix(issue);
    }

    console.log(`\n✅ Applied ${fixableIssues.length} automatic fixes`);
  }

  private async applyFix(issue: UIIssue): Promise<void> {
    try {
      const content = await fs.readFile(issue.file, 'utf-8');
      const lines = content.split('\n');

      let fixedContent = content;

      // Apply specific fixes based on issue type
      if (issue.issue.includes('Password toggle button missing test ID')) {
        fixedContent = content.replace(
          /(<IconButton[^>]*onClick[^>]*setShowPassword[^>]*)(>)/,
          '$1 data-testid="password-toggle-button"$2'
        );
      } else if (issue.issue.includes('Upload button missing test ID')) {
        fixedContent = content.replace(
          /(<Button[^>]*[Uu]pload[^>]*)(>)/,
          '$1 data-testid="upload-button"$2'
        );
      } else if (issue.issue.includes('Navigation component missing test ID')) {
        fixedContent = content.replace(
          /(<(?:nav|Box)[^>]*component=["']nav["'][^>]*)(>)/,
          '$1 data-testid="sidebar-nav"$2'
        );
      } else if (issue.issue.includes('IconButton missing aria-label')) {
        // Add aria-label based on context
        fixedContent = content.replace(
          /(<IconButton[^>]*)(>)/g,
          (match, p1, p2) => {
            if (!p1.includes('aria-label')) {
              return `${p1} aria-label="Icon button"${p2}`;
            }
            return match;
          }
        );
      }

      if (fixedContent !== content) {
        await fs.writeFile(issue.file, fixedContent);
        console.log(`✅ Fixed: ${issue.issue} in ${path.relative(process.cwd(), issue.file)}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${issue.file}: ${error}`);
    }
  }

  async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
      autoFixable: this.issues.filter(i => i.autoFixable).length,
      issues: this.issues
    };

    const reportPath = path.join(process.cwd(), 'UI_ISSUE_DETECTION_REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📋 Report generated: ${reportPath}`);
    console.log(`Total issues: ${report.totalIssues}`);
    console.log(`Critical: ${report.critical}, High: ${report.high}, Medium: ${report.medium}, Low: ${report.low}`);
    console.log(`Auto-fixable: ${report.autoFixable}`);
  }
}

// Main execution
async function main() {
  const detector = new UIBugDetectorAndFixer(process.cwd());
  
  // Scan for issues
  await detector.scanProject();
  
  // Generate report
  await detector.generateReport();
  
  // Apply automatic fixes
  await detector.applyAutoFixes();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}