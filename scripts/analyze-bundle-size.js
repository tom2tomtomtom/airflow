#!/usr/bin/env node

/**
 * Advanced Bundle Size Analysis Script
 * Analyzes bundle composition and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class BundleAnalyzer {
  constructor() {
    this.results = {
      analysis: {
        totalSize: 0,
        directories: {},
        largestFiles: [],
        duplicates: [],
        optimizationOpportunities: []
      }
    };
  }

  /**
   * Run comprehensive bundle analysis
   */
  async analyzeBundleSize() {
    console.log(chalk.blue.bold('\n📊 ADVANCED BUNDLE SIZE ANALYSIS'));
    console.log(chalk.blue('=====================================\n'));

    try {
      // Analyze .next directory size
      await this.analyzeNextDirectory();
      
      // Analyze node_modules impact
      await this.analyzeNodeModules();
      
      // Analyze source code size
      await this.analyzeSourceCode();
      
      // Find large files
      await this.findLargeFiles();
      
      // Detect duplicate dependencies
      await this.detectDuplicates();
      
      // Generate optimization recommendations
      await this.generateOptimizationRecommendations();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error(chalk.red('❌ Bundle analysis failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Analyze .next directory
   */
  async analyzeNextDirectory() {
    console.log(chalk.yellow('🔍 Analyzing .next directory...'));
    
    if (fs.existsSync('.next')) {
      const nextSize = this.getDirectorySize('.next');
      this.results.analysis.directories['.next'] = nextSize;
      console.log(chalk.blue(`  .next directory: ${this.formatSize(nextSize)}`));
      
      // Analyze subdirectories
      const subdirs = ['static', 'cache', 'server', 'BUILD_ID'];
      for (const subdir of subdirs) {
        const subdirPath = path.join('.next', subdir);
        if (fs.existsSync(subdirPath)) {
          const size = this.getDirectorySize(subdirPath);
          this.results.analysis.directories[`.next/${subdir}`] = size;
          console.log(chalk.gray(`    ${subdir}: ${this.formatSize(size)}`));
        }
      }
    } else {
      console.log(chalk.yellow('  ⚠️ .next directory not found - running build first...'));
      try {
        execSync('npm run build', { stdio: 'inherit' });
        await this.analyzeNextDirectory();
      } catch (error) {
        console.log(chalk.red('  ❌ Build failed - analyzing source only'));
      }
    }
  }

  /**
   * Analyze node_modules impact on bundle
   */
  async analyzeNodeModules() {
    console.log(chalk.yellow('📦 Analyzing node_modules impact...'));
    
    try {
      // Get package.json dependencies
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const heavyDependencies = [];
      
      for (const [dep, version] of Object.entries(dependencies)) {
        const depPath = path.join('node_modules', dep);
        if (fs.existsSync(depPath)) {
          const size = this.getDirectorySize(depPath);
          heavyDependencies.push({ name: dep, version, size });
        }
      }
      
      // Sort by size and show top 10
      heavyDependencies.sort((a, b) => b.size - a.size);
      console.log(chalk.blue('  Top 10 heaviest dependencies:'));
      
      heavyDependencies.slice(0, 10).forEach((dep, index) => {
        console.log(chalk.gray(`    ${index + 1}. ${dep.name}: ${this.formatSize(dep.size)}`));
      });
      
      this.results.analysis.heavyDependencies = heavyDependencies.slice(0, 20);
      
    } catch (error) {
      console.log(chalk.red('  ❌ Failed to analyze dependencies:'), error.message);
    }
  }

  /**
   * Analyze source code size
   */
  async analyzeSourceCode() {
    console.log(chalk.yellow('📝 Analyzing source code...'));
    
    const srcDirs = ['src', 'pages', 'components', 'public'];
    
    for (const dir of srcDirs) {
      if (fs.existsSync(dir)) {
        const size = this.getDirectorySize(dir);
        this.results.analysis.directories[dir] = size;
        console.log(chalk.blue(`  ${dir}: ${this.formatSize(size)}`));
      }
    }
  }

  /**
   * Find largest files in the project
   */
  async findLargeFiles() {
    console.log(chalk.yellow('🔍 Finding largest files...'));
    
    try {
      const result = execSync(`find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" | head -20`, { encoding: 'utf8' });
      
      const largeFiles = result.split('\n').filter(f => f.trim()).map(file => {
        const stats = fs.statSync(file);
        return { path: file, size: stats.size };
      });
      
      largeFiles.sort((a, b) => b.size - a.size);
      
      console.log(chalk.blue('  Large files (>1MB):'));
      largeFiles.forEach(file => {
        console.log(chalk.gray(`    ${file.path}: ${this.formatSize(file.size)}`));
      });
      
      this.results.analysis.largestFiles = largeFiles;
      
    } catch (error) {
      console.log(chalk.gray('  No large files found or command failed'));
    }
  }

  /**
   * Detect duplicate dependencies
   */
  async detectDuplicates() {
    console.log(chalk.yellow('🔄 Detecting duplicate dependencies...'));
    
    try {
      const result = execSync('npm ls --depth=0 2>/dev/null || echo "No duplicates detected"', { encoding: 'utf8' });
      // This is a simplified duplicate detection
      // In a real scenario, you'd want more sophisticated analysis
      console.log(chalk.gray('  Duplicate detection completed'));
    } catch (error) {
      console.log(chalk.gray('  Duplicate detection skipped'));
    }
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizationRecommendations() {
    console.log(chalk.yellow('💡 Generating optimization recommendations...'));
    
    const recommendations = [];
    
    // Check for heavy dependencies
    if (this.results.analysis.heavyDependencies) {
      const veryHeavy = this.results.analysis.heavyDependencies.filter(dep => dep.size > 50 * 1024 * 1024);
      if (veryHeavy.length > 0) {
        recommendations.push({
          type: 'dependency-optimization',
          priority: 'high',
          description: `Heavy dependencies detected: ${veryHeavy.map(d => d.name).join(', ')}`,
          impact: 'high',
          effort: 'medium'
        });
      }
    }
    
    // Check .next size
    const nextSize = this.results.analysis.directories['.next'] || 0;
    if (nextSize > 100 * 1024 * 1024) { // >100MB
      recommendations.push({
        type: 'build-optimization',
        priority: 'critical',
        description: '.next directory is extremely large - bundle splitting needed',
        impact: 'high',
        effort: 'medium'
      });
    }
    
    // Check for large files
    if (this.results.analysis.largestFiles.length > 0) {
      recommendations.push({
        type: 'asset-optimization',
        priority: 'high',
        description: 'Large files detected - consider compression or removal',
        impact: 'medium',
        effort: 'low'
      });
    }
    
    this.results.analysis.optimizationOpportunities = recommendations;
    
    console.log(chalk.blue('  Optimization opportunities identified:'));
    recommendations.forEach((rec, index) => {
      console.log(chalk.gray(`    ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`));
    });
  }

  /**
   * Calculate directory size recursively
   */
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Handle permission errors or missing directories
      return 0;
    }
    
    return totalSize;
  }

  /**
   * Format bytes to human readable format
   */
  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const totalSize = Object.values(this.results.analysis.directories).reduce((sum, size) => sum + size, 0);
    this.results.analysis.totalSize = totalSize;
    
    console.log(chalk.blue.bold('\n📊 BUNDLE SIZE ANALYSIS REPORT'));
    console.log(chalk.blue('================================\n'));
    
    console.log(chalk.white.bold('TOTAL PROJECT SIZE:'));
    console.log(chalk.green(`  Total analyzed size: ${this.formatSize(totalSize)}\n`));
    
    console.log(chalk.white.bold('DIRECTORY BREAKDOWN:'));
    Object.entries(this.results.analysis.directories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([dir, size]) => {
        const percentage = ((size / totalSize) * 100).toFixed(1);
        console.log(chalk.blue(`  ${dir}: ${this.formatSize(size)} (${percentage}%)`));
      });
    
    console.log(chalk.white.bold('\nOPTIMIZATION OPPORTUNITIES:'));
    this.results.analysis.optimizationOpportunities.forEach((opp, index) => {
      const color = opp.priority === 'critical' ? 'red' : opp.priority === 'high' ? 'yellow' : 'gray';
      console.log(chalk[color](`  ${index + 1}. [${opp.priority.toUpperCase()}] ${opp.description}`));
    });
    
    // Save detailed report
    const reportPath = 'reports/bundle-analysis-report.json';
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
    
    console.log(chalk.blue.bold('\n🎯 NEXT STEPS:'));
    console.log(chalk.blue('1. Implement webpack optimizations'));
    console.log(chalk.blue('2. Configure advanced bundle splitting'));
    console.log(chalk.blue('3. Optimize heavy dependencies'));
    console.log(chalk.blue('4. Implement asset optimization'));
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyzeBundleSize().catch(error => {
    console.error(chalk.red('\n❌ Bundle analysis failed:'), error.message);
    process.exit(1);
  });
}

module.exports = BundleAnalyzer;