/**
 * Accessibility Reporter for Playwright Tests
 * Tracks and reports accessibility compliance across test runs
 */

import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface AccessibilityIssue {
  testName: string;
  project: string;
  page: string;
  ruleId: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  element: string;
  help: string;
  helpUrl?: string;
  timestamp: number;
}

interface AccessibilityMetric {
  testName: string;
  project: string;
  page: string;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  passed: boolean;
  timestamp: number;
}

class AccessibilityReporter implements Reporter {
  private issues: AccessibilityIssue[] = [];
  private metrics: AccessibilityMetric[] = [];
  private outputDir: string;
  private startTime: number = 0;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || 'test-results/accessibility';
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log('\n♿ Starting Accessibility Testing...\n');
    
    // Ensure output directory exists
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const accessibilityData = this.extractAccessibilityData(test, result);
    
    if (accessibilityData.issues.length > 0 || accessibilityData.metrics) {
      this.issues.push(...accessibilityData.issues);
      
      if (accessibilityData.metrics) {
        this.metrics.push(accessibilityData.metrics);
      }
      
      this.logAccessibilityResults(test, accessibilityData);
    }
  }

  onEnd(result: FullResult) {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    this.generateAccessibilityReport();
    this.generateAccessibilitySummary(totalDuration);
    
    console.log('\n♿ Accessibility Testing Complete!');
    console.log(`📁 Accessibility report saved to: ${this.outputDir}/accessibility-report.json`);
  }

  private extractAccessibilityData(test: TestCase, result: TestResult): {
    issues: AccessibilityIssue[];
    metrics?: AccessibilityMetric;
  } {
    const issues: AccessibilityIssue[] = [];
    const project = test.parent?.project()?.name || 'unknown';
    const output = result.stdout.concat(result.stderr);
    
    // Extract accessibility violations from axe-core or similar tools
    const accessibilityPatterns = [
      /Accessibility violations: (.+)/g,
      /axe-core results: (.+)/g,
      /a11y-violations: (.+)/g
    ];
    
    for (const pattern of accessibilityPatterns) {
      let match;
      while ((match = pattern.exec(output.join('\n'))) !== null) {
        try {
          const violationData = JSON.parse(match[1]);
          
          if (Array.isArray(violationData)) {
            for (const violation of violationData) {
              // Handle axe-core format
              if (violation.nodes) {
                for (const node of violation.nodes) {
                  issues.push({
                    testName: test.title,
                    project,
                    page: this.extractPageFromTest(test),
                    ruleId: violation.id,
                    impact: violation.impact || 'moderate',
                    description: violation.description,
                    element: node.target ? node.target.join(', ') : 'unknown',
                    help: violation.help,
                    helpUrl: violation.helpUrl,
                    timestamp: Date.now()
                  });
                }
              }
              // Handle custom format
              else {
                issues.push({
                  testName: test.title,
                  project,
                  page: this.extractPageFromTest(test),
                  ruleId: violation.ruleId || 'unknown',
                  impact: violation.impact || 'moderate',
                  description: violation.description || 'Accessibility issue detected',
                  element: violation.element || 'unknown',
                  help: violation.help || 'Please review accessibility guidelines',
                  helpUrl: violation.helpUrl,
                  timestamp: Date.now()
                });
              }
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      }
    }
    
    // Extract keyboard navigation results
    const keyboardPatterns = [
      /Keyboard navigation: (.+)/g,
      /Focus management: (.+)/g,
      /Tab order: (.+)/g
    ];
    
    for (const pattern of keyboardPatterns) {
      let match;
      while ((match = pattern.exec(output.join('\n'))) !== null) {
        try {
          const keyboardData = JSON.parse(match[1]);
          
          if (keyboardData.violations) {
            for (const violation of keyboardData.violations) {
              issues.push({
                testName: test.title,
                project,
                page: this.extractPageFromTest(test),
                ruleId: 'keyboard-navigation',
                impact: violation.impact || 'serious',
                description: violation.description,
                element: violation.element || 'unknown',
                help: 'Ensure all interactive elements are keyboard accessible',
                timestamp: Date.now()
              });
            }
          }
        } catch (error) {
          // Skip invalid data
        }
      }
    }
    
    // Look for screen reader compatibility issues
    const screenReaderPatterns = [
      /Screen reader: (.+)/g,
      /ARIA labels: (.+)/g,
      /Semantic markup: (.+)/g
    ];
    
    for (const pattern of screenReaderPatterns) {
      let match;
      while ((match = pattern.exec(output.join('\n'))) !== null) {
        const issueText = match[1];
        
        if (issueText.includes('missing') || issueText.includes('invalid') || issueText.includes('error')) {
          issues.push({
            testName: test.title,
            project,
            page: this.extractPageFromTest(test),
            ruleId: 'screen-reader-support',
            impact: 'serious',
            description: issueText,
            element: 'various',
            help: 'Ensure proper ARIA labels and semantic markup',
            timestamp: Date.now()
          });
        }
      }
    }
    
    // Check for accessibility test annotations
    for (const annotation of test.annotations) {
      if (annotation.type.startsWith('a11y:')) {
        const issueType = annotation.type.replace('a11y:', '');
        
        issues.push({
          testName: test.title,
          project,
          page: this.extractPageFromTest(test),
          ruleId: issueType,
          impact: 'moderate',
          description: annotation.description || 'Accessibility issue detected',
          element: 'annotated',
          help: 'Please review accessibility guidelines',
          timestamp: Date.now()
        });
      }
    }
    
    // Generate metrics
    const metrics: AccessibilityMetric = {
      testName: test.title,
      project,
      page: this.extractPageFromTest(test),
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.impact === 'critical').length,
      seriousIssues: issues.filter(i => i.impact === 'serious').length,
      moderateIssues: issues.filter(i => i.impact === 'moderate').length,
      minorIssues: issues.filter(i => i.impact === 'minor').length,
      passed: issues.filter(i => i.impact === 'critical' || i.impact === 'serious').length === 0,
      timestamp: Date.now()
    };
    
    return { issues, metrics };
  }

  private extractPageFromTest(test: TestCase): string {
    // Extract page name from test title or parent
    const title = test.title.toLowerCase();
    
    if (title.includes('dashboard')) return 'dashboard';
    if (title.includes('login') || title.includes('auth')) return 'authentication';
    if (title.includes('client')) return 'clients';
    if (title.includes('asset')) return 'assets';
    if (title.includes('matrix')) return 'matrix';
    if (title.includes('strategy') || title.includes('flow')) return 'strategy';
    if (title.includes('campaign')) return 'campaigns';
    
    return 'unknown';
  }

  private logAccessibilityResults(test: TestCase, data: { issues: AccessibilityIssue[]; metrics?: AccessibilityMetric }) {
    if (data.metrics) {
      const status = data.metrics.passed ? '✅' : '❌';
      const criticalSeriousCount = data.metrics.criticalIssues + data.metrics.seriousIssues;
      
      console.log(
        `${status} ${data.metrics.project} | ${data.metrics.testName} | ${data.metrics.page}: ${data.metrics.totalIssues} issues (${criticalSeriousCount} critical/serious)`
      );
      
      // Log individual critical and serious issues
      const criticalSeriousIssues = data.issues.filter(i => i.impact === 'critical' || i.impact === 'serious');
      for (const issue of criticalSeriousIssues) {
        console.log(`   🚨 ${issue.impact.toUpperCase()}: ${issue.ruleId} - ${issue.description}`);
      }
    }
  }

  private generateAccessibilityReport() {
    const report = {
      summary: this.generateSummaryStats(),
      issues: this.issues,
      metrics: this.metrics,
      compliance: this.calculateCompliance(),
      recommendations: this.generateRecommendations(),
      ruleBreakdown: this.analyzeRuleBreakdown(),
      pageBreakdown: this.analyzePageBreakdown(),
      timestamp: new Date().toISOString()
    };
    
    const reportPath = join(this.outputDir, 'accessibility-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate WCAG compliance report
    this.generateWCAGReport();
    
    // Generate CSV for detailed analysis
    this.generateCSVReport();
  }

  private generateSummaryStats() {
    return {
      totalTests: this.metrics.length,
      passedTests: this.metrics.filter(m => m.passed).length,
      failedTests: this.metrics.filter(m => !m.passed).length,
      totalIssues: this.issues.length,
      criticalIssues: this.issues.filter(i => i.impact === 'critical').length,
      seriousIssues: this.issues.filter(i => i.impact === 'serious').length,
      moderateIssues: this.issues.filter(i => i.impact === 'moderate').length,
      minorIssues: this.issues.filter(i => i.impact === 'minor').length,
      uniqueRules: [...new Set(this.issues.map(i => i.ruleId))].length,
      pagesWithIssues: [...new Set(this.issues.map(i => i.page))].length
    };
  }

  private calculateCompliance() {
    const totalTests = this.metrics.length;
    const passedTests = this.metrics.filter(m => m.passed).length;
    
    const complianceRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;
    
    let complianceLevel = 'AA'; // Assume AA compliance target
    if (complianceRate < 80) complianceLevel = 'Below AA';
    if (complianceRate >= 95) complianceLevel = 'AAA Ready';
    
    return {
      rate: Math.round(complianceRate * 100) / 100,
      level: complianceLevel,
      criticalBlockers: this.issues.filter(i => i.impact === 'critical').length,
      seriousBlockers: this.issues.filter(i => i.impact === 'serious').length
    };
  }

  private analyzeRuleBreakdown() {
    const ruleBreakdown: Record<string, any> = {};
    
    for (const issue of this.issues) {
      if (!ruleBreakdown[issue.ruleId]) {
        ruleBreakdown[issue.ruleId] = {
          count: 0,
          impact: issue.impact,
          description: issue.description,
          help: issue.help,
          helpUrl: issue.helpUrl,
          pages: new Set()
        };
      }
      
      ruleBreakdown[issue.ruleId].count++;
      ruleBreakdown[issue.ruleId].pages.add(issue.page);
    }
    
    // Convert Sets to arrays for JSON serialization
    for (const rule of Object.values(ruleBreakdown)) {
      (rule as any).pages = Array.from((rule as any).pages);
    }
    
    return ruleBreakdown;
  }

  private analyzePageBreakdown() {
    const pageBreakdown: Record<string, any> = {};
    
    for (const metric of this.metrics) {
      if (!pageBreakdown[metric.page]) {
        pageBreakdown[metric.page] = {
          totalTests: 0,
          passedTests: 0,
          totalIssues: 0,
          criticalIssues: 0,
          seriousIssues: 0,
          moderateIssues: 0,
          minorIssues: 0
        };
      }
      
      const page = pageBreakdown[metric.page];
      page.totalTests++;
      if (metric.passed) page.passedTests++;
      page.totalIssues += metric.totalIssues;
      page.criticalIssues += metric.criticalIssues;
      page.seriousIssues += metric.seriousIssues;
      page.moderateIssues += metric.moderateIssues;
      page.minorIssues += metric.minorIssues;
    }
    
    // Calculate compliance rates for each page
    for (const [pageName, data] of Object.entries(pageBreakdown)) {
      const pageData = data as any;
      pageData.complianceRate = pageData.totalTests > 0 ? 
        (pageData.passedTests / pageData.totalTests) * 100 : 100;
    }
    
    return pageBreakdown;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const ruleBreakdown = this.analyzeRuleBreakdown();
    
    // Top rule violations
    const topViolations = Object.entries(ruleBreakdown)
      .sort(([,a], [,b]) => (b as any).count - (a as any).count)
      .slice(0, 5);
    
    if (topViolations.length > 0) {
      recommendations.push('Top accessibility issues to address:');
      
      for (const [ruleId, data] of topViolations) {
        const ruleData = data as any;
        recommendations.push(
          `• ${ruleId}: ${ruleData.count} violations across ${ruleData.pages.length} pages - ${ruleData.help}`
        );
      }
    }
    
    // Critical issues
    const criticalIssues = this.issues.filter(i => i.impact === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`🚨 ${criticalIssues.length} critical accessibility issues require immediate attention`);
    }
    
    // Page-specific recommendations
    const pageBreakdown = this.analyzePageBreakdown();
    const problematicPages = Object.entries(pageBreakdown)
      .filter(([, data]) => (data as any).complianceRate < 80)
      .sort(([,a], [,b]) => (a as any).complianceRate - (b as any).complianceRate);
    
    if (problematicPages.length > 0) {
      recommendations.push('Pages requiring accessibility improvements:');
      
      for (const [pageName, data] of problematicPages) {
        const pageData = data as any;
        recommendations.push(
          `• ${pageName}: ${pageData.complianceRate.toFixed(1)}% compliance (${pageData.criticalIssues + pageData.seriousIssues} critical/serious issues)`
        );
      }
    }
    
    // General recommendations
    const compliance = this.calculateCompliance();
    if (compliance.rate < 95) {
      recommendations.push('Consider implementing automated accessibility testing in CI/CD pipeline');
      recommendations.push('Provide accessibility training for development team');
      recommendations.push('Conduct user testing with assistive technology users');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ All accessibility tests passed! Consider expanding test coverage.');
    }
    
    return recommendations;
  }

  private generateWCAGReport() {
    const wcagMapping: Record<string, string[]> = {
      'color-contrast': ['1.4.3', '1.4.6'],
      'keyboard-navigation': ['2.1.1', '2.1.2'],
      'focus-management': ['2.4.7'],
      'screen-reader-support': ['1.3.1', '4.1.2'],
      'semantic-markup': ['1.3.1'],
      'aria-labels': ['4.1.2'],
      'heading-order': ['2.4.6'],
      'link-purpose': ['2.4.4'],
      'form-labels': ['1.3.1', '3.3.2']
    };
    
    const wcagReport = {
      guidelines: {} as Record<string, any>,
      summary: {
        totalGuidelines: 0,
        passedGuidelines: 0,
        failedGuidelines: 0
      }
    };
    
    // Initialize all WCAG guidelines
    const allGuidelines = [...new Set(Object.values(wcagMapping).flat())];
    for (const guideline of allGuidelines) {
      wcagReport.guidelines[guideline] = {
        passed: true,
        violations: [],
        relatedRules: []
      };
    }
    
    // Map issues to WCAG guidelines
    for (const issue of this.issues) {
      const guidelines = wcagMapping[issue.ruleId] || [];
      
      for (const guideline of guidelines) {
        if (issue.impact === 'critical' || issue.impact === 'serious') {
          wcagReport.guidelines[guideline].passed = false;
        }
        
        wcagReport.guidelines[guideline].violations.push({
          ruleId: issue.ruleId,
          impact: issue.impact,
          page: issue.page,
          element: issue.element
        });
        
        if (!wcagReport.guidelines[guideline].relatedRules.includes(issue.ruleId)) {
          wcagReport.guidelines[guideline].relatedRules.push(issue.ruleId);
        }
      }
    }
    
    // Calculate summary
    wcagReport.summary.totalGuidelines = allGuidelines.length;
    wcagReport.summary.passedGuidelines = Object.values(wcagReport.guidelines)
      .filter(g => (g as any).passed).length;
    wcagReport.summary.failedGuidelines = wcagReport.summary.totalGuidelines - wcagReport.summary.passedGuidelines;
    
    const wcagPath = join(this.outputDir, 'wcag-compliance.json');
    writeFileSync(wcagPath, JSON.stringify(wcagReport, null, 2));
  }

  private generateCSVReport() {
    const csvHeader = 'Test Name,Project,Page,Rule ID,Impact,Description,Element,Timestamp\n';
    const csvRows = this.issues.map(issue => 
      `"${issue.testName}","${issue.project}","${issue.page}","${issue.ruleId}","${issue.impact}","${issue.description}","${issue.element}","${new Date(issue.timestamp).toISOString()}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const csvPath = join(this.outputDir, 'accessibility-issues.csv');
    writeFileSync(csvPath, csvContent);
  }

  private generateAccessibilitySummary(totalDuration: number) {
    const summary = this.generateSummaryStats();
    const compliance = this.calculateCompliance();
    
    console.log('\n♿ Accessibility Summary:');
    console.log(`   Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`   Tests: ${summary.passedTests}/${summary.totalTests} passed (${compliance.rate.toFixed(1)}%)`);
    console.log(`   Compliance Level: ${compliance.level}`);
    console.log(`   Total Issues: ${summary.totalIssues}`);
    
    if (summary.criticalIssues > 0) {
      console.log(`   🚨 Critical Issues: ${summary.criticalIssues}`);
    }
    
    if (summary.seriousIssues > 0) {
      console.log(`   ⚠️  Serious Issues: ${summary.seriousIssues}`);
    }
    
    if (summary.moderateIssues > 0) {
      console.log(`   ℹ️  Moderate Issues: ${summary.moderateIssues}`);
    }
    
    if (summary.totalIssues === 0) {
      console.log('   ✅ No accessibility issues detected!');
    }
  }
}

export default AccessibilityReporter;