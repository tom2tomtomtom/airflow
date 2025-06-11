/**
 * Performance Reporter for Playwright Tests
 * Tracks and reports performance metrics across test runs
 */

import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PerformanceMetric {
  testName: string;
  project: string;
  metric: string;
  value: number;
  unit: string;
  threshold?: number;
  passed?: boolean;
  timestamp: number;
}

class PerformanceReporter implements Reporter {
  private metrics: PerformanceMetric[] = [];
  private outputDir: string;
  private startTime: number = 0;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || 'test-results/performance';
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log('\n🚀 Starting Performance Testing...\n');
    
    // Ensure output directory exists
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Extract performance metrics from test attachments or console logs
    const performanceData = this.extractPerformanceData(test, result);
    
    if (performanceData.length > 0) {
      this.metrics.push(...performanceData);
      this.logPerformanceMetrics(test, performanceData);
    }
  }

  onEnd(result: FullResult) {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    this.generatePerformanceReport();
    this.generatePerformanceSummary(totalDuration);
    
    console.log('\n📊 Performance Testing Complete!');
    console.log(`📁 Performance report saved to: ${this.outputDir}/performance-report.json`);
  }

  private extractPerformanceData(test: TestCase, result: TestResult): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const project = test.parent?.project()?.name || 'unknown';
    
    // Extract from stdout/stderr
    const output = result.stdout.concat(result.stderr);
    
    // Look for performance patterns in the output
    const performancePatterns = [
      /Performance Metrics: (.+)/g,
      /Load time: (\d+)ms/g,
      /Search time: (\d+)ms/g,
      /Upload time: (\d+)ms/g,
      /Processing time: (\d+)ms/g,
      /Execution time: (\d+)ms/g,
      /Memory usage: (.+)/g
    ];
    
    for (const pattern of performancePatterns) {
      let match;
      while ((match = pattern.exec(output.join('\n'))) !== null) {
        try {
          if (match[1].includes('{')) {
            // JSON metrics
            const jsonMetrics = JSON.parse(match[1]);
            if (Array.isArray(jsonMetrics)) {
              for (const metric of jsonMetrics) {
                metrics.push({
                  testName: test.title,
                  project,
                  metric: metric.page || metric.operation || 'unknown',
                  value: metric.loadTime || metric.time || metric.value || 0,
                  unit: 'ms',
                  threshold: this.getThreshold(metric.page || metric.operation),
                  passed: this.isWithinThreshold(metric.loadTime || metric.time || metric.value, metric.page || metric.operation),
                  timestamp: Date.now()
                });
              }
            }
          } else {
            // Simple numeric metrics
            const value = parseInt(match[1]);
            if (!isNaN(value)) {
              const metricType = this.inferMetricType(match[0]);
              metrics.push({
                testName: test.title,
                project,
                metric: metricType,
                value,
                unit: 'ms',
                threshold: this.getThreshold(metricType),
                passed: this.isWithinThreshold(value, metricType),
                timestamp: Date.now()
              });
            }
          }
        } catch (error) {
          // Skip invalid JSON or parsing errors
        }
      }
    }
    
    // Extract from test annotations
    for (const annotation of test.annotations) {
      if (annotation.type.startsWith('performance:')) {
        const metricType = annotation.type.replace('performance:', '');
        const value = parseFloat(annotation.description || '0');
        
        if (!isNaN(value)) {
          metrics.push({
            testName: test.title,
            project,
            metric: metricType,
            value,
            unit: 'ms',
            threshold: this.getThreshold(metricType),
            passed: this.isWithinThreshold(value, metricType),
            timestamp: Date.now()
          });
        }
      }
    }
    
    return metrics;
  }

  private inferMetricType(matchedString: string): string {
    if (matchedString.includes('Load time')) return 'page-load';
    if (matchedString.includes('Search time')) return 'search';
    if (matchedString.includes('Upload time')) return 'upload';
    if (matchedString.includes('Processing time')) return 'ai-processing';
    if (matchedString.includes('Execution time')) return 'matrix-execution';
    return 'general';
  }

  private getThreshold(metricType: string): number {
    const thresholds: Record<string, number> = {
      'dashboard': 3000,
      'page-load': 3000,
      'assets': 5000,
      'matrix': 4000,
      'strategy': 3000,
      'search': 1000,
      'upload': 10000,
      'ai-processing': 60000,
      'matrix-execution': 300000,
      'client-creation': 5000,
      'asset-assignment': 3000
    };
    
    return thresholds[metricType] || 5000; // Default 5 second threshold
  }

  private isWithinThreshold(value: number, metricType: string): boolean {
    const threshold = this.getThreshold(metricType);
    return value <= threshold;
  }

  private logPerformanceMetrics(test: TestCase, metrics: PerformanceMetric[]) {
    for (const metric of metrics) {
      const status = metric.passed ? '✅' : '❌';
      const threshold = metric.threshold ? ` (threshold: ${metric.threshold}${metric.unit})` : '';
      
      console.log(
        `${status} ${metric.project} | ${metric.testName} | ${metric.metric}: ${metric.value}${metric.unit}${threshold}`
      );
    }
  }

  private generatePerformanceReport() {
    const report = {
      summary: this.generateSummaryStats(),
      metrics: this.metrics,
      thresholds: this.getThresholdsSummary(),
      trends: this.analyzeTrends(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    const reportPath = join(this.outputDir, 'performance-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate CSV for easy analysis
    this.generateCSVReport();
  }

  private generateSummaryStats() {
    const summary: Record<string, any> = {
      totalMetrics: this.metrics.length,
      passedMetrics: this.metrics.filter(m => m.passed).length,
      failedMetrics: this.metrics.filter(m => !m.passed).length,
      averageValues: {},
      maxValues: {},
      minValues: {}
    };
    
    // Group by metric type
    const metricGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.metric]) {
        groups[metric.metric] = [];
      }
      groups[metric.metric].push(metric.value);
      return groups;
    }, {} as Record<string, number[]>);
    
    // Calculate statistics for each metric type
    for (const [metricType, values] of Object.entries(metricGroups)) {
      summary.averageValues[metricType] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      summary.maxValues[metricType] = Math.max(...values);
      summary.minValues[metricType] = Math.min(...values);
    }
    
    return summary;
  }

  private getThresholdsSummary() {
    const uniqueMetrics = [...new Set(this.metrics.map(m => m.metric))];
    return uniqueMetrics.reduce((thresholds, metric) => {
      thresholds[metric] = this.getThreshold(metric);
      return thresholds;
    }, {} as Record<string, number>);
  }

  private analyzeTrends() {
    // Simple trend analysis - more sophisticated analysis could be added
    const trends: Record<string, any> = {};
    
    const metricGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.metric]) {
        groups[metric.metric] = [];
      }
      groups[metric.metric].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);
    
    for (const [metricType, metrics] of Object.entries(metricGroups)) {
      if (metrics.length > 1) {
        const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
        const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
        const secondHalf = sortedMetrics.slice(Math.floor(sortedMetrics.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;
        
        const trend = secondHalfAvg > firstHalfAvg ? 'degrading' : 'improving';
        const change = Math.abs(secondHalfAvg - firstHalfAvg);
        
        trends[metricType] = {
          trend,
          change: Math.round(change),
          changePercent: Math.round((change / firstHalfAvg) * 100)
        };
      }
    }
    
    return trends;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const failedMetrics = this.metrics.filter(m => !m.passed);
    
    if (failedMetrics.length > 0) {
      recommendations.push(`${failedMetrics.length} performance metrics failed to meet thresholds`);
      
      const slowestMetrics = failedMetrics
        .sort((a, b) => (b.value - (b.threshold || 0)) - (a.value - (a.threshold || 0)))
        .slice(0, 3);
      
      for (const metric of slowestMetrics) {
        const exceededBy = metric.value - (metric.threshold || 0);
        recommendations.push(
          `${metric.metric} exceeded threshold by ${exceededBy}ms in ${metric.testName}`
        );
      }
    }
    
    // Analyze trends for recommendations
    const trends = this.analyzeTrends();
    for (const [metricType, trend] of Object.entries(trends)) {
      if (trend.trend === 'degrading' && trend.changePercent > 20) {
        recommendations.push(
          `${metricType} performance is degrading (${trend.changePercent}% increase)`
        );
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All performance metrics are within acceptable thresholds');
    }
    
    return recommendations;
  }

  private generateCSVReport() {
    const csvHeader = 'Test Name,Project,Metric,Value,Unit,Threshold,Passed,Timestamp\n';
    const csvRows = this.metrics.map(metric => 
      `"${metric.testName}","${metric.project}","${metric.metric}",${metric.value},"${metric.unit}",${metric.threshold || ''},${metric.passed},${new Date(metric.timestamp).toISOString()}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const csvPath = join(this.outputDir, 'performance-metrics.csv');
    writeFileSync(csvPath, csvContent);
  }

  private generatePerformanceSummary(totalDuration: number) {
    const summary = this.generateSummaryStats();
    const passRate = ((summary.passedMetrics / summary.totalMetrics) * 100).toFixed(1);
    
    console.log('\n📈 Performance Summary:');
    console.log(`   Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`   Metrics Collected: ${summary.totalMetrics}`);
    console.log(`   Pass Rate: ${passRate}% (${summary.passedMetrics}/${summary.totalMetrics})`);
    
    if (summary.failedMetrics > 0) {
      console.log(`   ⚠️  Failed Metrics: ${summary.failedMetrics}`);
    }
    
    console.log('\n🏆 Top Performance Metrics:');
    for (const [metric, avgValue] of Object.entries(summary.averageValues)) {
      const threshold = this.getThreshold(metric);
      const status = avgValue <= threshold ? '✅' : '❌';
      console.log(`   ${status} ${metric}: ${avgValue}ms (avg)`);
    }
  }
}

export default PerformanceReporter;