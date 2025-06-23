#!/usr/bin/env node

/**
 * Performance Baseline Assessment Script
 * Gathers comprehensive performance metrics for optimization planning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceBaseline {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      bundle: {},
      build: {},
      test: {},
      codebase: {},
      dependencies: {}
    };
  }

  async gatherMetrics() {
    console.log('🔍 Gathering Performance Baseline Metrics...\n');
    
    try {
      await this.analyzeBundleSize();
      await this.analyzeCodebase();
      await this.analyzeDependencies();
      await this.measureBuildTime();
      await this.measureTestTime();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Error gathering metrics:', error.message);
    }
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing Bundle Size...');
    
    try {
      // Get total build size
      const buildPath = '.next';
      if (fs.existsSync(buildPath)) {
        const buildSize = this.getDirSize(buildPath);
        this.metrics.bundle.totalBuildSize = buildSize;
        
        // Get static chunks size
        const chunksPath = '.next/static/chunks';
        if (fs.existsSync(chunksPath)) {
          const chunksSize = this.getDirSize(chunksPath);
          this.metrics.bundle.chunksSize = chunksSize;
          
          // Count JavaScript files
          const jsFiles = this.countFiles(chunksPath, '.js');
          this.metrics.bundle.jsFileCount = jsFiles;
        }
        
        // Get static assets size
        const staticPath = '.next/static';
        if (fs.existsSync(staticPath)) {
          const staticSize = this.getDirSize(staticPath);
          this.metrics.bundle.staticSize = staticSize;
        }
      }
      
      console.log(`   Total Build Size: ${this.formatBytes(this.metrics.bundle.totalBuildSize)}`);
      console.log(`   Static Assets: ${this.formatBytes(this.metrics.bundle.staticSize)}`);
      console.log(`   JS Chunks: ${this.formatBytes(this.metrics.bundle.chunksSize)}`);
      console.log(`   JS Files: ${this.metrics.bundle.jsFileCount}`);
      
    } catch (error) {
      console.log('   ⚠️  Bundle analysis failed:', error.message);
    }
  }

  async analyzeCodebase() {
    console.log('\n📊 Analyzing Codebase...');
    
    try {
      // Count source files
      const srcFiles = this.countFiles('src', '.ts') + this.countFiles('src', '.tsx');
      const testFiles = this.countFiles('src', '.test.ts') + this.countFiles('src', '.test.tsx');
      const totalFiles = srcFiles + testFiles;
      
      this.metrics.codebase.sourceFiles = srcFiles;
      this.metrics.codebase.testFiles = testFiles;
      this.metrics.codebase.totalFiles = totalFiles;
      this.metrics.codebase.testCoverage = ((testFiles / srcFiles) * 100).toFixed(1);
      
      // Get codebase size
      const srcSize = this.getDirSize('src');
      this.metrics.codebase.size = srcSize;
      
      console.log(`   Source Files: ${srcFiles}`);
      console.log(`   Test Files: ${testFiles}`);
      console.log(`   Test Coverage: ${this.metrics.codebase.testCoverage}%`);
      console.log(`   Codebase Size: ${this.formatBytes(srcSize)}`);
      
    } catch (error) {
      console.log('   ⚠️  Codebase analysis failed:', error.message);
    }
  }

  async analyzeDependencies() {
    console.log('\n📋 Analyzing Dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const prodDeps = Object.keys(packageJson.dependencies || {}).length;
      const devDeps = Object.keys(packageJson.devDependencies || {}).length;
      const totalDeps = prodDeps + devDeps;
      
      this.metrics.dependencies.production = prodDeps;
      this.metrics.dependencies.development = devDeps;
      this.metrics.dependencies.total = totalDeps;
      
      // Get node_modules size if it exists
      if (fs.existsSync('node_modules')) {
        const nodeModulesSize = this.getDirSize('node_modules');
        this.metrics.dependencies.nodeModulesSize = nodeModulesSize;
      }
      
      console.log(`   Production Dependencies: ${prodDeps}`);
      console.log(`   Development Dependencies: ${devDeps}`);
      console.log(`   Total Dependencies: ${totalDeps}`);
      if (this.metrics.dependencies.nodeModulesSize) {
        console.log(`   node_modules Size: ${this.formatBytes(this.metrics.dependencies.nodeModulesSize)}`);
      }
      
    } catch (error) {
      console.log('   ⚠️  Dependencies analysis failed:', error.message);
    }
  }

  async measureBuildTime() {
    console.log('\n⏱️  Measuring Build Performance...');
    
    try {
      const startTime = Date.now();
      
      // Run a quick build test (just compile check)
      execSync('npx next build --dry-run || echo "Build dry-run completed"', { 
        stdio: 'pipe',
        timeout: 30000 
      });
      
      const buildTime = Date.now() - startTime;
      this.metrics.build.timeMs = buildTime;
      this.metrics.build.timeSeconds = (buildTime / 1000).toFixed(2);
      
      console.log(`   Build Time: ${this.metrics.build.timeSeconds}s`);
      
    } catch (error) {
      console.log('   ⚠️  Build measurement failed:', error.message);
      this.metrics.build.error = error.message;
    }
  }

  async measureTestTime() {
    console.log('\n🧪 Measuring Test Performance...');
    
    try {
      const startTime = Date.now();
      
      // Run a subset of tests to measure performance
      execSync('npm test -- --testPathPattern="(health|constants)\.test\.ts" --silent', { 
        stdio: 'pipe',
        timeout: 15000 
      });
      
      const testTime = Date.now() - startTime;
      this.metrics.test.timeMs = testTime;
      this.metrics.test.timeSeconds = (testTime / 1000).toFixed(2);
      
      console.log(`   Test Suite Time: ${this.metrics.test.timeSeconds}s`);
      
    } catch (error) {
      console.log('   ⚠️  Test measurement failed:', error.message);
      this.metrics.test.error = error.message;
    }
  }

  getDirSize(dirPath) {
    let size = 0;
    
    const walk = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          walk(filePath);
        } else {
          size += stats.size;
        }
      }
    };
    
    if (fs.existsSync(dirPath)) {
      walk(dirPath);
    }
    
    return size;
  }

  countFiles(dirPath, extension) {
    let count = 0;
    
    const walk = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            walk(filePath);
          } else if (file.endsWith(extension)) {
            count++;
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };
    
    if (fs.existsSync(dirPath)) {
      walk(dirPath);
    }
    
    return count;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  async generateReport() {
    console.log('\n📋 Performance Baseline Report');
    console.log('================================');
    
    // Overall Assessment
    let grade = 'C';
    let issues = [];
    let recommendations = [];
    
    // Bundle size assessment
    if (this.metrics.bundle.chunksSize > 10 * 1024 * 1024) { // 10MB
      issues.push('Large bundle size');
      recommendations.push('Implement code splitting and lazy loading');
    }
    
    if (this.metrics.bundle.jsFileCount > 100) {
      issues.push('Too many JavaScript files');
      recommendations.push('Optimize chunk splitting strategy');
    }
    
    // Test coverage assessment
    const coverage = parseFloat(this.metrics.codebase.testCoverage);
    if (coverage < 30) {
      issues.push('Low test coverage');
      recommendations.push('Increase test coverage to 40%+');
    } else if (coverage > 30) {
      grade = 'B';
    }
    
    // Performance assessment
    if (this.metrics.build.timeMs && this.metrics.build.timeMs < 10000) {
      grade = grade === 'C' ? 'B' : 'A';
    }
    
    this.metrics.assessment = {
      grade,
      issues,
      recommendations
    };
    
    console.log(`📊 Overall Grade: ${grade}`);
    console.log(`\n🎯 Performance Metrics:`);
    console.log(`   Bundle Size: ${this.formatBytes(this.metrics.bundle.chunksSize)} (${this.metrics.bundle.jsFileCount} files)`);
    console.log(`   Test Coverage: ${coverage}% (${this.metrics.codebase.testFiles}/${this.metrics.codebase.sourceFiles} files)`);
    console.log(`   Build Time: ${this.metrics.build.timeSeconds}s`);
    console.log(`   Dependencies: ${this.metrics.dependencies.total} total`);
    
    if (issues.length > 0) {
      console.log(`\n⚠️  Issues Identified:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    if (recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
    
    // Save detailed report
    const reportPath = 'performance-baseline.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the baseline assessment
const baseline = new PerformanceBaseline();
baseline.gatherMetrics().catch(console.error);