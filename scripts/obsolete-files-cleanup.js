#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Obsolete Files and Documentation Cleanup Tool
 * Identifies and removes obsolete documentation, temporary files, and cleanup artifacts
 */

let totalFilesRemoved = 0;
let totalDirectoriesRemoved = 0;
let totalSizeFreed = 0;
const cleanupReport = [];

// Categories of obsolete files/directories to remove
const OBSOLETE_PATTERNS = {
  // Root level documentation files (keep core ones)
  rootDocumentation: [
    'AIRWAVE-E2E-TESTS.md',
    'AIRWAVE_NEXT_STEPS_PLAN.md',
    'AIRWAVE_PRODUCTION_READINESS_REPORT.md',
    'AIRWAVE_TEST_COVERAGE_REPORT.md',
    'API_TESTING_FIX_COMPREHENSIVE_REPORT.md',
    'CLEANUP_IMPROVEMENTS_README.md',
    'CODE_IMPROVEMENTS_REPORT.md',
    'COMPLETION_PLAN_BACKUP.md',
    'COMPREHENSIVE_CODE_REVIEW_REPORT_CURRENT.md',
    'COMPREHENSIVE_REMEDIATION_PLAN.md',
    'COMPREHENSIVE_TESTING_AND_ERROR_FIXING_REPORT.md',
    'COMPREHENSIVE_TEST_COVERAGE_ANALYSIS.md',
    'COMPREHENSIVE_UI_TESTING_PLAN.md',
    'ENVIRONMENT_SETUP.md', // Duplicate of docs/ENVIRONMENT_SETUP.md
    'ENVIRONMENT_SETUP_SECURITY.md',
    'EXECUTIVE_SUMMARY.md',
    'EXPANDED_COVERAGE_TRACKING_REPORT.md',
    'IMPLEMENTATION_ROADMAP.md',
    'MERGE_STRATEGY.md',
    'NEXT_PHASES_TASK_LIST.md',
    'PERFORMANCE_BASELINE.md',
    'PHASE_1_CHECKLIST.md',
    'PHASE_1_TESTING_IMPLEMENTATION.md',
    'PHASE_2_CRITICAL_TESTING_TASKS.md',
    'QUICK_FIX_GUIDE.md',
    'QUICK_STATUS_CURRENT.md',
    'README_HONEST.md',
    'REMEDIATION_PLAN.md',
    'REPOSITORY_CLEANUP_PLAN.md',
    'SECURITY_ENVIRONMENT_AUDIT.md',
    'SECURITY_FIXES_COMPLETED.md',
    'SUCCESSFUL_IMPROVEMENTS_SUMMARY.md',
    'TEST_COVERAGE_SUMMARY_REPORT.md',
    'TEST_REPORT.md',
    'TYPESCRIPT_ERROR_AUDIT.md',
    'TYPESCRIPT_MIGRATION_PROGRESS.md',
    'TYPESCRIPT_MIGRATION_REPORT.md',
    'TYPESCRIPT_STRICT_MODE_PLAN.md',
    'api-issues.md',
    'cleanup-report-2025-07-28.md',
    'error-dependency-matrix.md',
    'performance-baseline.md',
    'pre-deployment-check-report-2025-07-28.md',
    'security-resolution-summary.md',
    'security-update-plan.md',
    'typescript-error-audit.md',
    'typescript-error-categorization.md',
    'ui-testing-results.md'
  ],
  
  // Temporary and fix scripts
  temporaryScripts: [
    'analyze_complexity.js',
    'debug-workflow.js',
    'final-test-syntax-fix.js',
    'fix-all-syntax.js',
    'fix-console-statements.js',
    'fix-final-syntax.js',
    'fix-jsx-advanced.js',
    'fix-jsx-semicolons.js',
    'fix-record-pattern.js',
    'fix-record-syntax.js',
    'fix-remaining-syntax.js',
    'fix-syntax.js',
    'manual-ui-test.js',
    'quick-fix-record.js',
    'test-complete-workflow.js',
    'test-current-ui.js',
    'test-flow-functionality.js',
    'test-merged-improvements.js'
  ],
  
  // Test and report files
  testReports: [
    'bundle-metrics.json',
    'dev-tooling-status.json',
    'dev.log',
    'performance-baseline.json',
    'production-readiness-report.html',
    'production-readiness-report.json',
    'quality-gate-status.json',
    'quality-metrics.json',
    'security-audit-baseline.json',
    'smoke-test-report-*.json',
    'strict-mode-migration-plan.json',
    'test-brief-content.txt',
    'test-credentials.json',
    'test-workflow-manual.md',
    'console-cleanup-report-*.json',
    'unused-imports-cleanup-report-*.json'
  ],
  
  // Archive directories
  archiveDirectories: [
    'archive',
    '.misleading-docs-backup',
    'temp'
  ],
  
  // TypeScript config files (keep main ones)
  obsoleteConfigs: [
    'tsconfig.migration-final.json',
    'tsconfig.migration-phase1.json',
    'tsconfig.migration-phase2.json',
    'tsconfig.tsbuildinfo'
  ],
  
  // Package backup files
  packageBackups: [
    'package.json.backup'
  ]
};

// Files and directories to always preserve
const PRESERVE_PATTERNS = [
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'DEPLOYMENT_GUIDE.md',
  'SETUP_SUPABASE.md',
  'docs/**',
  'src/**',
  'public/**',
  'supabase/**',
  'scripts/aggressive-console-cleanup.js',
  'scripts/unused-imports-cleanup.js',
  'scripts/obsolete-files-cleanup.js'
];

function shouldPreserve(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  return PRESERVE_PATTERNS.some(pattern => {
    const regex = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    return new RegExp(`^${regex}$`).test(relativePath) || 
           new RegExp(`^${regex}$`).test(path.basename(relativePath));
  });
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function removeFile(filePath) {
  if (shouldPreserve(filePath)) {
    console.log(`🔒 Preserving: ${path.relative(process.cwd(), filePath)}`);
    return false;
  }
  
  try {
    const size = getFileSize(filePath);
    fs.unlinkSync(filePath);
    
    totalFilesRemoved++;
    totalSizeFreed += size;
    
    cleanupReport.push({
      type: 'file',
      path: path.relative(process.cwd(), filePath),
      size: size
    });
    
    console.log(`🗑️  Removed file: ${path.relative(process.cwd(), filePath)} (${formatBytes(size)})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove file ${filePath}:`, error.message);
    return false;
  }
}

function removeDirectory(dirPath) {
  if (shouldPreserve(dirPath)) {
    console.log(`🔒 Preserving directory: ${path.relative(process.cwd(), dirPath)}`);
    return false;
  }
  
  try {
    const size = getDirSize(dirPath);
    fs.rmSync(dirPath, { recursive: true, force: true });
    
    totalDirectoriesRemoved++;
    totalSizeFreed += size;
    
    cleanupReport.push({
      type: 'directory',
      path: path.relative(process.cwd(), dirPath),
      size: size
    });
    
    console.log(`🗂️  Removed directory: ${path.relative(process.cwd(), dirPath)} (${formatBytes(size)})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove directory ${dirPath}:`, error.message);
    return false;
  }
}

function getDirSize(dirPath) {
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        totalSize += getDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors for size calculation
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanupObsoleteFiles() {
  console.log('🧹 Starting obsolete files cleanup...\n');
  
  // Remove obsolete root documentation
  console.log('📄 Cleaning up obsolete root documentation...');
  for (const file of OBSOLETE_PATTERNS.rootDocumentation) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      removeFile(filePath);
    }
  }
  
  // Remove temporary scripts
  console.log('\n🔧 Cleaning up temporary scripts...');
  for (const file of OBSOLETE_PATTERNS.temporaryScripts) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      removeFile(filePath);
    }
  }
  
  // Remove test reports and configs
  console.log('\n📊 Cleaning up test reports and configs...');
  for (const pattern of OBSOLETE_PATTERNS.testReports) {
    if (pattern.includes('*')) {
      // Handle wildcard patterns
      const files = glob.sync(pattern, { cwd: process.cwd() });
      for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          removeFile(filePath);
        }
      }
    } else {
      const filePath = path.join(process.cwd(), pattern);
      if (fs.existsSync(filePath)) {
        removeFile(filePath);
      }
    }
  }
  
  // Remove obsolete configs
  console.log('\n⚙️  Cleaning up obsolete config files...');
  for (const file of OBSOLETE_PATTERNS.obsoleteConfigs) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      removeFile(filePath);
    }
  }
  
  // Remove package backups
  console.log('\n📦 Cleaning up package backups...');
  for (const file of OBSOLETE_PATTERNS.packageBackups) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      removeFile(filePath);
    }
  }
  
  // Remove archive directories
  console.log('\n🗂️  Cleaning up archive directories...');
  for (const dir of OBSOLETE_PATTERNS.archiveDirectories) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      removeDirectory(dirPath);
    }
  }
  
  // Remove empty directories
  console.log('\n📁 Cleaning up empty directories...');
  removeEmptyDirectories(process.cwd());
}

function removeEmptyDirectories(dirPath) {
  if (shouldPreserve(dirPath)) {
    return;
  }
  
  try {
    const items = fs.readdirSync(dirPath);
    
    // First, recursively check subdirectories
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        removeEmptyDirectories(itemPath);
      }
    }
    
    // Check if directory is empty now
    const updatedItems = fs.readdirSync(dirPath);
    if (updatedItems.length === 0 && dirPath !== process.cwd()) {
      fs.rmdirSync(dirPath);
      console.log(`📁 Removed empty directory: ${path.relative(process.cwd(), dirPath)}`);
      totalDirectoriesRemoved++;
    }
  } catch (error) {
    // Ignore errors for empty directory cleanup
  }
}

function generateReport() {
  const reportName = `obsolete-cleanup-report-${Date.now()}.json`;
  const reportPath = path.join(process.cwd(), reportName);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFilesRemoved,
      totalDirectoriesRemoved,
      totalSizeFreed: formatBytes(totalSizeFreed),
      totalSizeFreedBytes: totalSizeFreed
    },
    removedItems: cleanupReport
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Cleanup report saved to: ${reportName}`);
  
  return report;
}

// Main execution
const startTime = Date.now();

cleanupObsoleteFiles();

const endTime = Date.now();
const duration = (endTime - startTime) / 1000;

// Generate and display summary
const report = generateReport();

console.log('\n🎉 Obsolete files cleanup completed!');
console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
console.log(`🗑️  Files removed: ${report.summary.totalFilesRemoved}`);
console.log(`🗂️  Directories removed: ${report.summary.totalDirectoriesRemoved}`);
console.log(`💾 Disk space freed: ${report.summary.totalSizeFreed}`);

if (cleanupReport.length > 0) {
  console.log('\n📋 Top items removed:');
  cleanupReport
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach(item => {
      const icon = item.type === 'directory' ? '📁' : '📄';
      console.log(`   ${icon} ${item.path}: ${formatBytes(item.size)}`);
    });
}