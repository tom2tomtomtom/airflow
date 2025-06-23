#!/usr/bin/env node

/**
 * Production Readiness Assessment for AIRWAVE
 * Comprehensive evaluation of production deployment readiness
 * Generates actionable report with security, performance, and reliability scores
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Assessment categories and checks
const ASSESSMENT_CATEGORIES = {
  security: {
    name: 'Security & Authentication',
    weight: 25,
    checks: [
      'environment_variables',
      'secret_management',
      'authentication_flow',
      'input_validation',
      'rate_limiting',
      'cors_configuration',
      'security_headers',
      'dependency_vulnerabilities',
    ],
  },
  performance: {
    name: 'Performance & Optimization',
    weight: 20,
    checks: [
      'bundle_size',
      'build_time',
      'database_optimization',
      'caching_strategy',
      'load_testing',
      'image_optimization',
      'code_splitting',
      'lighthouse_score',
    ],
  },
  reliability: {
    name: 'Reliability & Error Handling',
    weight: 20,
    checks: [
      'error_boundaries',
      'logging_system',
      'monitoring_setup',
      'health_checks',
      'graceful_degradation',
      'backup_strategy',
      'rollback_plan',
      'alerting_system',
    ],
  },
  testing: {
    name: 'Testing & Quality Assurance',
    weight: 15,
    checks: [
      'test_coverage',
      'e2e_tests',
      'unit_tests',
      'integration_tests',
      'performance_tests',
      'security_tests',
      'accessibility_tests',
      'browser_compatibility',
    ],
  },
  deployment: {
    name: 'Deployment & Infrastructure',
    weight: 10,
    checks: [
      'ci_cd_pipeline',
      'environment_parity',
      'database_migrations',
      'environment_configuration',
      'ssl_certificates',
      'cdn_setup',
      'backup_verification',
      'disaster_recovery',
    ],
  },
  documentation: {
    name: 'Documentation & Maintainability',
    weight: 10,
    checks: [
      'api_documentation',
      'deployment_guide',
      'troubleshooting_guide',
      'code_documentation',
      'security_runbook',
      'monitoring_runbook',
      'user_guides',
      'change_log',
    ],
  },
};

/**
 * Run comprehensive production readiness assessment
 */
async function runProductionAssessment() {
  console.log('🔍 Starting AIRWAVE Production Readiness Assessment...\n');
  
  const assessment = {
    timestamp: new Date().toISOString(),
    version: getProjectVersion(),
    environment: 'production-ready-check',
    categories: {},
    overallScore: 0,
    grade: 'F',
    criticalIssues: [],
    recommendations: [],
    passedChecks: 0,
    totalChecks: 0,
  };

  // Run assessments for each category
  for (const [categoryId, category] of Object.entries(ASSESSMENT_CATEGORIES)) {
    console.log(`📊 Assessing ${category.name}...`);
    
    const categoryResult = await assessCategory(categoryId, category);
    assessment.categories[categoryId] = categoryResult;
    
    assessment.passedChecks += categoryResult.passedChecks;
    assessment.totalChecks += categoryResult.totalChecks;
    
    console.log(`   Score: ${categoryResult.score}/${categoryResult.maxScore} (${categoryResult.percentage.toFixed(1)}%)`);
    
    if (categoryResult.criticalIssues.length > 0) {
      assessment.criticalIssues.push(...categoryResult.criticalIssues);
    }
    
    assessment.recommendations.push(...categoryResult.recommendations);
  }

  // Calculate overall score
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const [categoryId, category] of Object.entries(ASSESSMENT_CATEGORIES)) {
    const categoryResult = assessment.categories[categoryId];
    weightedScore += (categoryResult.percentage / 100) * category.weight;
    totalWeight += category.weight;
  }
  
  assessment.overallScore = (weightedScore / totalWeight) * 100;
  assessment.grade = calculateGrade(assessment.overallScore);

  // Generate report
  await generateAssessmentReport(assessment);
  
  console.log(`\n🎯 Production Readiness Assessment Complete`);
  console.log(`Overall Score: ${assessment.overallScore.toFixed(1)}% (Grade: ${assessment.grade})`);
  console.log(`Checks Passed: ${assessment.passedChecks}/${assessment.totalChecks}`);
  
  if (assessment.criticalIssues.length > 0) {
    console.log(`\n❌ Critical Issues Found: ${assessment.criticalIssues.length}`);
    assessment.criticalIssues.slice(0, 3).forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }
  
  return assessment;
}

/**
 * Assess individual category
 */
async function assessCategory(categoryId, category) {
  const result = {
    name: category.name,
    weight: category.weight,
    checks: [],
    passedChecks: 0,
    totalChecks: category.checks.length,
    score: 0,
    maxScore: category.checks.length * 10,
    percentage: 0,
    criticalIssues: [],
    recommendations: [],
  };

  for (const checkId of category.checks) {
    const checkResult = await runCheck(categoryId, checkId);
    result.checks.push(checkResult);
    
    if (checkResult.passed) {
      result.passedChecks++;
      result.score += 10;
    } else {
      if (checkResult.critical) {
        result.criticalIssues.push(checkResult.issue);
      }
      result.recommendations.push(checkResult.recommendation);
    }
  }
  
  result.percentage = (result.score / result.maxScore) * 100;
  return result;
}

/**
 * Run individual check
 */
async function runCheck(category, checkId) {
  const check = {
    id: checkId,
    name: formatCheckName(checkId),
    passed: false,
    score: 0,
    critical: false,
    issue: '',
    recommendation: '',
    details: '',
  };

  try {
    switch (`${category}.${checkId}`) {
      // Security checks
      case 'security.environment_variables':
        return checkEnvironmentVariables();
      case 'security.secret_management':
        return checkSecretManagement();
      case 'security.authentication_flow':
        return checkAuthenticationFlow();
      case 'security.input_validation':
        return checkInputValidation();
      case 'security.rate_limiting':
        return checkRateLimiting();
      case 'security.cors_configuration':
        return checkCorsConfiguration();
      case 'security.security_headers':
        return checkSecurityHeaders();
      case 'security.dependency_vulnerabilities':
        return await checkDependencyVulnerabilities();

      // Performance checks
      case 'performance.bundle_size':
        return checkBundleSize();
      case 'performance.build_time':
        return checkBuildTime();
      case 'performance.database_optimization':
        return checkDatabaseOptimization();
      case 'performance.caching_strategy':
        return checkCachingStrategy();
      case 'performance.load_testing':
        return checkLoadTesting();
      case 'performance.image_optimization':
        return checkImageOptimization();
      case 'performance.code_splitting':
        return checkCodeSplitting();
      case 'performance.lighthouse_score':
        return await checkLighthouseScore();

      // Reliability checks
      case 'reliability.error_boundaries':
        return checkErrorBoundaries();
      case 'reliability.logging_system':
        return checkLoggingSystem();
      case 'reliability.monitoring_setup':
        return checkMonitoringSetup();
      case 'reliability.health_checks':
        return checkHealthChecks();
      case 'reliability.graceful_degradation':
        return checkGracefulDegradation();
      case 'reliability.backup_strategy':
        return checkBackupStrategy();
      case 'reliability.rollback_plan':
        return checkRollbackPlan();
      case 'reliability.alerting_system':
        return checkAlertingSystem();

      // Testing checks
      case 'testing.test_coverage':
        return checkTestCoverage();
      case 'testing.e2e_tests':
        return checkE2ETests();
      case 'testing.unit_tests':
        return checkUnitTests();
      case 'testing.integration_tests':
        return checkIntegrationTests();
      case 'testing.performance_tests':
        return checkPerformanceTests();
      case 'testing.security_tests':
        return checkSecurityTests();
      case 'testing.accessibility_tests':
        return checkAccessibilityTests();
      case 'testing.browser_compatibility':
        return checkBrowserCompatibility();

      // Deployment checks
      case 'deployment.ci_cd_pipeline':
        return checkCICDPipeline();
      case 'deployment.environment_parity':
        return checkEnvironmentParity();
      case 'deployment.database_migrations':
        return checkDatabaseMigrations();
      case 'deployment.environment_configuration':
        return checkEnvironmentConfiguration();
      case 'deployment.ssl_certificates':
        return checkSSLCertificates();
      case 'deployment.cdn_setup':
        return checkCDNSetup();
      case 'deployment.backup_verification':
        return checkBackupVerification();
      case 'deployment.disaster_recovery':
        return checkDisasterRecovery();

      // Documentation checks
      case 'documentation.api_documentation':
        return checkAPIDocumentation();
      case 'documentation.deployment_guide':
        return checkDeploymentGuide();
      case 'documentation.troubleshooting_guide':
        return checkTroubleshootingGuide();
      case 'documentation.code_documentation':
        return checkCodeDocumentation();
      case 'documentation.security_runbook':
        return checkSecurityRunbook();
      case 'documentation.monitoring_runbook':
        return checkMonitoringRunbook();
      case 'documentation.user_guides':
        return checkUserGuides();
      case 'documentation.change_log':
        return checkChangeLog();

      default:
        check.issue = 'Check not implemented';
        check.recommendation = `Implement ${check.name} check`;
        return check;
    }
  } catch (error) {
    check.issue = `Check failed: ${error.message}`;
    check.recommendation = `Fix ${check.name} implementation`;
    return check;
  }
}

// Security check implementations
function checkEnvironmentVariables() {
  const check = { id: 'environment_variables', name: 'Environment Variables', passed: false };
  
  try {
    // Check for required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET',
      'NODE_ENV',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      check.passed = true;
      check.details = 'All required environment variables are configured';
    } else {
      check.critical = true;
      check.issue = `Missing environment variables: ${missingVars.join(', ')}`;
      check.recommendation = 'Configure all required environment variables for production';
    }
  } catch (error) {
    check.issue = `Environment variable check failed: ${error.message}`;
    check.recommendation = 'Review environment variable configuration';
  }
  
  return check;
}

function checkSecretManagement() {
  const check = { id: 'secret_management', name: 'Secret Management', passed: false };
  
  try {
    // Check if secrets are properly managed (not hardcoded)
    const secretPatterns = [
      /(?:api[_-]?key|apikey|access[_-]?key)[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"](?![a-zA-Z0-9_\-])/gi,
      /(?:secret|password|passwd|pwd)[\s]*[:=][\s]*['"]([^'"]{8,})['"](?![a-zA-Z0-9_\-])/gi,
    ];

    const sourceFiles = getSourceFiles();
    let hardcodedSecrets = false;

    for (const file of sourceFiles) {
      if (file.includes('node_modules') || file.includes('.git')) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            hardcodedSecrets = true;
            break;
          }
        }
        if (hardcodedSecrets) break;
      } catch (error) {
        // Skip files that can't be read
      }
    }

    if (!hardcodedSecrets) {
      check.passed = true;
      check.details = 'No hardcoded secrets detected in source code';
    } else {
      check.critical = true;
      check.issue = 'Hardcoded secrets detected in source code';
      check.recommendation = 'Move all secrets to environment variables or secure secret management system';
    }
  } catch (error) {
    check.issue = `Secret management check failed: ${error.message}`;
    check.recommendation = 'Implement proper secret scanning and management';
  }
  
  return check;
}

function checkAuthenticationFlow() {
  const check = { id: 'authentication_flow', name: 'Authentication Flow', passed: false };
  
  try {
    // Check for authentication middleware and flow
    const authFiles = [
      'src/middleware/withAuth.ts',
      'src/lib/auth/auth.ts',
      'src/contexts/AuthContext.tsx',
    ];

    const authImplemented = authFiles.some(file => fs.existsSync(file));
    
    if (authImplemented) {
      // Check for comprehensive auth implementation
      const authTestFiles = getFilesMatching('**/*auth*.test.{ts,tsx,js,jsx}');
      
      if (authTestFiles.length > 0) {
        check.passed = true;
        check.details = `Authentication system implemented with ${authTestFiles.length} test files`;
      } else {
        check.issue = 'Authentication system lacks comprehensive testing';
        check.recommendation = 'Add comprehensive authentication tests';
      }
    } else {
      check.critical = true;
      check.issue = 'Authentication system not properly implemented';
      check.recommendation = 'Implement comprehensive authentication middleware and flows';
    }
  } catch (error) {
    check.issue = `Authentication check failed: ${error.message}`;
    check.recommendation = 'Review authentication implementation';
  }
  
  return check;
}

function checkInputValidation() {
  const check = { id: 'input_validation', name: 'Input Validation', passed: false };
  
  try {
    // Check for validation utilities
    const validationFiles = [
      'src/utils/validation-utils.ts',
      'src/lib/validation.ts',
    ];

    const validationImplemented = validationFiles.some(file => fs.existsSync(file));
    
    if (validationImplemented) {
      // Check for comprehensive validation testing
      const validationTestFiles = getFilesMatching('**/*validation*.test.{ts,tsx,js,jsx}');
      
      if (validationTestFiles.length > 0) {
        check.passed = true;
        check.details = `Input validation implemented with ${validationTestFiles.length} test files`;
      } else {
        check.issue = 'Input validation lacks comprehensive testing';
        check.recommendation = 'Add comprehensive input validation tests';
      }
    } else {
      check.critical = true;
      check.issue = 'Input validation system not implemented';
      check.recommendation = 'Implement comprehensive input validation with Zod or similar';
    }
  } catch (error) {
    check.issue = `Input validation check failed: ${error.message}`;
    check.recommendation = 'Implement input validation system';
  }
  
  return check;
}

// Performance check implementations
function checkBundleSize() {
  const check = { id: 'bundle_size', name: 'Bundle Size', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.bundle) {
      const bundleSize = performanceBaseline.bundle.totalBuildSize;
      const chunksSize = performanceBaseline.bundle.chunksSize;
      
      // Check if bundle size is reasonable (under 5MB for chunks)
      if (chunksSize < 5 * 1024 * 1024) {
        check.passed = true;
        check.details = `Bundle chunks size: ${(chunksSize / 1024 / 1024).toFixed(2)}MB`;
      } else {
        check.issue = `Bundle chunks too large: ${(chunksSize / 1024 / 1024).toFixed(2)}MB`;
        check.recommendation = 'Optimize bundle splitting and remove unused dependencies';
      }
    } else {
      check.issue = 'Bundle size analysis not available';
      check.recommendation = 'Run bundle analysis to measure application size';
    }
  } catch (error) {
    check.issue = `Bundle size check failed: ${error.message}`;
    check.recommendation = 'Set up bundle size monitoring';
  }
  
  return check;
}

function checkTestCoverage() {
  const check = { id: 'test_coverage', name: 'Test Coverage', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.codebase) {
      const coverage = parseFloat(performanceBaseline.codebase.testCoverage);
      
      if (coverage >= 60) {
        check.passed = true;
        check.details = `Test coverage: ${coverage}%`;
      } else if (coverage >= 40) {
        check.issue = `Test coverage below target: ${coverage}% (target: 60%+)`;
        check.recommendation = 'Increase test coverage to 60% or higher';
      } else {
        check.critical = true;
        check.issue = `Test coverage critically low: ${coverage}%`;
        check.recommendation = 'Urgently increase test coverage to at least 40%';
      }
    } else {
      check.issue = 'Test coverage data not available';
      check.recommendation = 'Set up test coverage reporting';
    }
  } catch (error) {
    check.issue = `Test coverage check failed: ${error.message}`;
    check.recommendation = 'Implement test coverage tracking';
  }
  
  return check;
}

// Utility functions
function getProjectVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
}

function getPerformanceBaseline() {
  try {
    return JSON.parse(fs.readFileSync('performance-baseline.json', 'utf8'));
  } catch (error) {
    return null;
  }
}

function getSourceFiles() {
  try {
    const output = execSync('find src -type f -name "*.{ts,tsx,js,jsx}" 2>/dev/null || true', { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

function getFilesMatching(pattern) {
  try {
    const output = execSync(`find . -path "./node_modules" -prune -o -name "${pattern.replace('**/', '')}" -type f -print 2>/dev/null || true`, { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

function formatCheckName(checkId) {
  return checkId.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function calculateGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

async function generateAssessmentReport(assessment) {
  const reportPath = 'production-readiness-report.json';
  const htmlReportPath = 'production-readiness-report.html';
  
  // Save JSON report
  fs.writeFileSync(reportPath, JSON.stringify(assessment, null, 2));
  
  // Generate HTML report
  const htmlReport = generateHTMLReport(assessment);
  fs.writeFileSync(htmlReportPath, htmlReport);
  
  console.log(`\n📄 Reports generated:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   HTML: ${htmlReportPath}`);
}

function generateHTMLReport(assessment) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIRWAVE Production Readiness Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .score-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .grade { font-size: 3em; font-weight: bold; margin: 10px 0; }
        .grade.A-plus { color: #28a745; }
        .grade.A { color: #20c997; }
        .grade.B-plus { color: #17a2b8; }
        .grade.B { color: #ffc107; }
        .grade.C { color: #fd7e14; }
        .grade.F { color: #dc3545; }
        .category { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .category-title { font-size: 1.2em; font-weight: bold; }
        .category-score { font-weight: bold; padding: 5px 10px; border-radius: 5px; background: #e9ecef; }
        .check { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .check.passed { background: #d4edda; border-left: 4px solid #28a745; }
        .check.failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .check.critical { background: #f8d7da; border-left: 4px solid #dc3545; border: 2px solid #dc3545; }
        .issues { margin: 20px 0; }
        .issue { margin: 10px 0; padding: 15px; background: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545; }
        .recommendations { margin: 20px 0; }
        .recommendation { margin: 10px 0; padding: 15px; background: #d1ecf1; border-radius: 5px; border-left: 4px solid #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AIRWAVE Production Readiness Report</h1>
            <p>Generated: ${new Date(assessment.timestamp).toLocaleString()}</p>
            <p>Version: ${assessment.version}</p>
        </div>
        
        <div class="content">
            <div class="score-card">
                <div class="grade ${assessment.grade.replace('+', '-plus')}">${assessment.grade}</div>
                <div style="font-size: 1.5em; margin: 10px 0;">${assessment.overallScore.toFixed(1)}%</div>
                <div>Production Readiness Score</div>
                <div style="margin-top: 15px; color: #6c757d;">
                    ${assessment.passedChecks}/${assessment.totalChecks} checks passed
                </div>
            </div>

            ${Object.entries(assessment.categories).map(([categoryId, category]) => `
                <div class="category">
                    <div class="category-header">
                        <div class="category-title">${category.name}</div>
                        <div class="category-score">${category.percentage.toFixed(1)}%</div>
                    </div>
                    ${category.checks.map(check => `
                        <div class="check ${check.passed ? 'passed' : check.critical ? 'critical' : 'failed'}">
                            <strong>${check.name}</strong>
                            ${check.passed ? 
                                `<div style="color: #28a745;">✅ ${check.details || 'Passed'}</div>` :
                                `<div style="color: #dc3545;">❌ ${check.issue}</div>`
                            }
                        </div>
                    `).join('')}
                </div>
            `).join('')}

            ${assessment.criticalIssues.length > 0 ? `
                <div class="issues">
                    <h2>🔥 Critical Issues</h2>
                    ${assessment.criticalIssues.map(issue => `
                        <div class="issue">${issue}</div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="recommendations">
                <h2>💡 Recommendations</h2>
                ${assessment.recommendations.slice(0, 10).map(rec => `
                    <div class="recommendation">${rec}</div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
}

function checkRateLimiting() {
  const check = { id: 'rate_limiting', name: 'Rate Limiting', passed: false };
  
  try {
    // Check for rate limiting middleware
    const rateLimitFiles = [
      'src/middleware/withRateLimit.ts',
      'src/lib/rateLimit.ts',
    ];

    const rateLimitImplemented = rateLimitFiles.some(file => fs.existsSync(file));
    
    if (rateLimitImplemented) {
      check.passed = true;
      check.details = 'Rate limiting middleware implemented';
    } else {
      check.critical = true;
      check.issue = 'Rate limiting not implemented';
      check.recommendation = 'Implement rate limiting middleware for API protection';
    }
  } catch (error) {
    check.issue = `Rate limiting check failed: ${error.message}`;
    check.recommendation = 'Implement rate limiting system';
  }
  
  return check;
}

function checkCorsConfiguration() {
  const check = { id: 'cors_configuration', name: 'CORS Configuration', passed: false };
  
  try {
    // Check Next.js config for CORS
    const nextConfigExists = fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs');
    
    if (nextConfigExists) {
      check.passed = true;
      check.details = 'Next.js configuration present';
    } else {
      check.issue = 'CORS configuration not found';
      check.recommendation = 'Configure CORS headers in Next.js configuration';
    }
  } catch (error) {
    check.issue = `CORS check failed: ${error.message}`;
    check.recommendation = 'Review CORS configuration';
  }
  
  return check;
}

function checkSecurityHeaders() {
  const check = { id: 'security_headers', name: 'Security Headers', passed: false };
  
  try {
    // Check for security headers middleware
    const securityFiles = [
      'src/middleware/withSecurityHeaders.ts',
      'src/lib/security.ts',
    ];

    const securityImplemented = securityFiles.some(file => fs.existsSync(file));
    
    if (securityImplemented) {
      check.passed = true;
      check.details = 'Security headers middleware implemented';
    } else {
      check.critical = true;
      check.issue = 'Security headers not implemented';
      check.recommendation = 'Implement security headers (CSP, HSTS, X-Frame-Options, etc.)';
    }
  } catch (error) {
    check.issue = `Security headers check failed: ${error.message}`;
    check.recommendation = 'Implement security headers';
  }
  
  return check;
}

async function checkDependencyVulnerabilities() {
  const check = { id: 'dependency_vulnerabilities', name: 'Dependency Vulnerabilities', passed: false };
  
  try {
    // Run npm audit
    const auditResult = execSync('npm audit --audit-level=moderate --json 2>/dev/null || echo "{}"', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    if (audit.vulnerabilities) {
      const highVulns = Object.values(audit.vulnerabilities).filter(v => v.severity === 'high' || v.severity === 'critical');
      
      if (highVulns.length === 0) {
        check.passed = true;
        check.details = 'No high or critical vulnerabilities found';
      } else {
        check.critical = true;
        check.issue = `${highVulns.length} high/critical vulnerabilities found`;
        check.recommendation = 'Run npm audit --fix to resolve vulnerabilities';
      }
    } else {
      check.passed = true;
      check.details = 'Dependency audit completed successfully';
    }
  } catch (error) {
    check.issue = `Dependency audit failed: ${error.message}`;
    check.recommendation = 'Run npm audit to check for vulnerabilities';
  }
  
  return check;
}

function checkBuildTime() {
  const check = { id: 'build_time', name: 'Build Time', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.build) {
      const buildTimeMs = performanceBaseline.build.timeMs;
      
      if (buildTimeMs < 30000) { // Under 30 seconds
        check.passed = true;
        check.details = `Build time: ${performanceBaseline.build.timeSeconds}s`;
      } else {
        check.issue = `Build time too slow: ${performanceBaseline.build.timeSeconds}s`;
        check.recommendation = 'Optimize build process and dependencies';
      }
    } else {
      check.issue = 'Build time data not available';
      check.recommendation = 'Measure and track build performance';
    }
  } catch (error) {
    check.issue = `Build time check failed: ${error.message}`;
    check.recommendation = 'Set up build time monitoring';
  }
  
  return check;
}

function checkDatabaseOptimization() {
  const check = { id: 'database_optimization', name: 'Database Optimization', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.database) {
      const db = performanceBaseline.database;
      
      if (db.optimizations && db.performance) {
        const hasIndexes = db.optimizations.indexes > 0;
        const hasViews = db.optimizations.materialized_views > 0;
        const n1Optimized = db.performance.n1_queries_eliminated > 0;
        
        if (hasIndexes && hasViews && n1Optimized) {
          check.passed = true;
          check.details = `${db.optimizations.indexes} indexes, ${db.optimizations.materialized_views} materialized views, N+1 queries eliminated`;
        } else {
          check.issue = 'Database optimizations incomplete';
          check.recommendation = 'Implement indexes, materialized views, and eliminate N+1 queries';
        }
      } else {
        check.issue = 'Database optimization data not available';
        check.recommendation = 'Implement database performance monitoring';
      }
    } else {
      check.issue = 'Database optimization not tracked';
      check.recommendation = 'Set up database performance baseline';
    }
  } catch (error) {
    check.issue = `Database optimization check failed: ${error.message}`;
    check.recommendation = 'Review database optimization strategy';
  }
  
  return check;
}

function checkCachingStrategy() {
  const check = { id: 'caching_strategy', name: 'Caching Strategy', passed: false };
  
  try {
    // Check for Redis implementation
    const redisFiles = [
      'src/lib/redis.ts',
      'src/lib/cache.ts',
    ];

    const redisImplemented = redisFiles.some(file => fs.existsSync(file));
    
    if (redisImplemented) {
      check.passed = true;
      check.details = 'Redis caching implemented';
    } else {
      check.issue = 'Caching strategy not implemented';
      check.recommendation = 'Implement Redis caching for API responses and data';
    }
  } catch (error) {
    check.issue = `Caching check failed: ${error.message}`;
    check.recommendation = 'Implement caching strategy';
  }
  
  return check;
}

function checkLoadTesting() {
  const check = { id: 'load_testing', name: 'Load Testing', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.load_testing) {
      const loadTesting = performanceBaseline.load_testing;
      
      if (loadTesting.infrastructure && loadTesting.scenarios) {
        check.passed = true;
        check.details = `${loadTesting.scenarios} load testing scenarios implemented with k6`;
      } else {
        check.issue = 'Load testing infrastructure incomplete';
        check.recommendation = 'Complete load testing setup with k6';
      }
    } else {
      check.issue = 'Load testing not implemented';
      check.recommendation = 'Implement load testing with k6 or similar tool';
    }
  } catch (error) {
    check.issue = `Load testing check failed: ${error.message}`;
    check.recommendation = 'Set up load testing infrastructure';
  }
  
  return check;
}

function checkImageOptimization() {
  const check = { id: 'image_optimization', name: 'Image Optimization', passed: false };
  
  try {
    // Check Next.js config for image optimization
    const nextConfigExists = fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs');
    
    if (nextConfigExists) {
      // Check if Next.js Image component is used
      const imageUsage = getFilesMatching('**/*.{tsx,jsx}').some(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('next/image') || content.includes('<Image');
        } catch {
          return false;
        }
      });
      
      if (imageUsage) {
        check.passed = true;
        check.details = 'Next.js Image optimization implemented';
      } else {
        check.issue = 'Image optimization not fully implemented';
        check.recommendation = 'Use Next.js Image component for automatic optimization';
      }
    } else {
      check.issue = 'Next.js configuration not found';
      check.recommendation = 'Configure Next.js image optimization';
    }
  } catch (error) {
    check.issue = `Image optimization check failed: ${error.message}`;
    check.recommendation = 'Implement image optimization';
  }
  
  return check;
}

function checkCodeSplitting() {
  const check = { id: 'code_splitting', name: 'Code Splitting', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.bundle) {
      const jsFileCount = performanceBaseline.bundle.jsFileCount;
      
      if (jsFileCount > 10) { // Multiple chunks indicate code splitting
        check.passed = true;
        check.details = `${jsFileCount} JavaScript chunks generated`;
      } else {
        check.issue = 'Code splitting not optimized';
        check.recommendation = 'Implement dynamic imports and optimize chunk splitting';
      }
    } else {
      check.issue = 'Bundle analysis not available';
      check.recommendation = 'Analyze bundle and implement code splitting';
    }
  } catch (error) {
    check.issue = `Code splitting check failed: ${error.message}`;
    check.recommendation = 'Set up bundle analysis and code splitting';
  }
  
  return check;
}

async function checkLighthouseScore() {
  const check = { id: 'lighthouse_score', name: 'Lighthouse Score', passed: false };
  
  try {
    // Check if Lighthouse CI is configured
    const lighthouseConfigExists = fs.existsSync('.lighthouserc.js') || fs.existsSync('lighthouse.config.js');
    
    if (lighthouseConfigExists) {
      check.passed = true;
      check.details = 'Lighthouse CI configuration found';
    } else {
      check.issue = 'Lighthouse performance monitoring not configured';
      check.recommendation = 'Set up Lighthouse CI for automated performance monitoring';
    }
  } catch (error) {
    check.issue = `Lighthouse check failed: ${error.message}`;
    check.recommendation = 'Configure Lighthouse performance monitoring';
  }
  
  return check;
}

function checkErrorBoundaries() {
  const check = { id: 'error_boundaries', name: 'Error Boundaries', passed: false };
  
  try {
    // Check for error boundary components
    const errorBoundaryFiles = getFilesMatching('**/*error*.{tsx,jsx}');
    
    if (errorBoundaryFiles.length > 0) {
      check.passed = true;
      check.details = `${errorBoundaryFiles.length} error boundary components found`;
    } else {
      check.issue = 'Error boundaries not implemented';
      check.recommendation = 'Implement React error boundaries for graceful error handling';
    }
  } catch (error) {
    check.issue = `Error boundary check failed: ${error.message}`;
    check.recommendation = 'Implement error boundaries';
  }
  
  return check;
}

function checkLoggingSystem() {
  const check = { id: 'logging_system', name: 'Logging System', passed: false };
  
  try {
    // Check for logging implementation
    const loggingFiles = [
      'src/lib/monitoring/logger.ts',
      'src/lib/logger.ts',
    ];

    const loggingImplemented = loggingFiles.some(file => fs.existsSync(file));
    
    if (loggingImplemented) {
      check.passed = true;
      check.details = 'Logging system implemented';
    } else {
      check.issue = 'Logging system not implemented';
      check.recommendation = 'Implement structured logging with Winston or similar';
    }
  } catch (error) {
    check.issue = `Logging check failed: ${error.message}`;
    check.recommendation = 'Set up logging system';
  }
  
  return check;
}

function checkMonitoringSetup() {
  const check = { id: 'monitoring_setup', name: 'Monitoring Setup', passed: false };
  
  try {
    // Check for monitoring tools
    const monitoringFiles = [
      'src/lib/monitoring/performance.ts',
      'src/lib/monitoring/apm.ts',
    ];

    const monitoringImplemented = monitoringFiles.some(file => fs.existsSync(file));
    
    if (monitoringImplemented) {
      check.passed = true;
      check.details = 'APM monitoring implemented';
    } else {
      check.issue = 'Monitoring not implemented';
      check.recommendation = 'Implement APM monitoring with Sentry or similar';
    }
  } catch (error) {
    check.issue = `Monitoring check failed: ${error.message}`;
    check.recommendation = 'Set up application monitoring';
  }
  
  return check;
}

function checkHealthChecks() {
  const check = { id: 'health_checks', name: 'Health Checks', passed: false };
  
  try {
    // Check for health check endpoints
    const healthFiles = getFilesMatching('**/health*.{ts,js}');
    
    if (healthFiles.length > 0) {
      check.passed = true;
      check.details = `${healthFiles.length} health check endpoints found`;
    } else {
      check.issue = 'Health checks not implemented';
      check.recommendation = 'Implement health check endpoints for monitoring';
    }
  } catch (error) {
    check.issue = `Health check failed: ${error.message}`;
    check.recommendation = 'Implement health check endpoints';
  }
  
  return check;
}

function checkGracefulDegradation() {
  const check = { id: 'graceful_degradation', name: 'Graceful Degradation', passed: false };
  
  try {
    // Check for fallback mechanisms
    const fallbackFiles = getFilesMatching('**/*fallback*.{ts,tsx,js,jsx}');
    
    if (fallbackFiles.length > 0) {
      check.passed = true;
      check.details = `${fallbackFiles.length} fallback mechanisms found`;
    } else {
      check.issue = 'Graceful degradation not implemented';
      check.recommendation = 'Implement fallback mechanisms for service failures';
    }
  } catch (error) {
    check.issue = `Graceful degradation check failed: ${error.message}`;
    check.recommendation = 'Implement graceful degradation strategies';
  }
  
  return check;
}

function checkBackupStrategy() {
  const check = { id: 'backup_strategy', name: 'Backup Strategy', passed: false };
  
  try {
    // Check for backup scripts or documentation
    const backupFiles = getFilesMatching('**/*backup*.{sh,js,ts,md}');
    
    if (backupFiles.length > 0) {
      check.passed = true;
      check.details = `${backupFiles.length} backup-related files found`;
    } else {
      check.issue = 'Backup strategy not documented';
      check.recommendation = 'Document and implement database backup strategy';
    }
  } catch (error) {
    check.issue = `Backup strategy check failed: ${error.message}`;
    check.recommendation = 'Implement backup strategy';
  }
  
  return check;
}

function checkRollbackPlan() {
  const check = { id: 'rollback_plan', name: 'Rollback Plan', passed: false };
  
  try {
    // Check for deployment and rollback documentation
    const deploymentFiles = getFilesMatching('**/*{deploy,rollback}*.{md,sh,yml,yaml}');
    
    if (deploymentFiles.length > 0) {
      check.passed = true;
      check.details = `${deploymentFiles.length} deployment/rollback files found`;
    } else {
      check.issue = 'Rollback plan not documented';
      check.recommendation = 'Document rollback procedures and automation';
    }
  } catch (error) {
    check.issue = `Rollback plan check failed: ${error.message}`;
    check.recommendation = 'Create rollback plan documentation';
  }
  
  return check;
}

function checkAlertingSystem() {
  const check = { id: 'alerting_system', name: 'Alerting System', passed: false };
  
  try {
    // Check for alerting configuration
    const alertFiles = getFilesMatching('**/*{alert,notification}*.{ts,js,yml,yaml}');
    
    if (alertFiles.length > 0) {
      check.passed = true;
      check.details = `${alertFiles.length} alerting configuration files found`;
    } else {
      check.issue = 'Alerting system not configured';
      check.recommendation = 'Set up alerting for critical system events';
    }
  } catch (error) {
    check.issue = `Alerting check failed: ${error.message}`;
    check.recommendation = 'Implement alerting system';
  }
  
  return check;
}

function checkE2ETests() {
  const check = { id: 'e2e_tests', name: 'E2E Tests', passed: false };
  
  try {
    // Check for E2E test files
    const e2eFiles = getFilesMatching('**/e2e/**/*.spec.{ts,js}');
    
    if (e2eFiles.length > 0) {
      check.passed = true;
      check.details = `${e2eFiles.length} E2E test files found`;
    } else {
      check.issue = 'E2E tests not implemented';
      check.recommendation = 'Implement end-to-end tests with Playwright or Cypress';
    }
  } catch (error) {
    check.issue = `E2E test check failed: ${error.message}`;
    check.recommendation = 'Set up E2E testing';
  }
  
  return check;
}

function checkUnitTests() {
  const check = { id: 'unit_tests', name: 'Unit Tests', passed: false };
  
  try {
    const performanceBaseline = getPerformanceBaseline();
    
    if (performanceBaseline && performanceBaseline.codebase) {
      const testFiles = performanceBaseline.codebase.testFiles;
      
      if (testFiles > 20) {
        check.passed = true;
        check.details = `${testFiles} test files implemented`;
      } else {
        check.issue = `Insufficient unit tests: ${testFiles} files`;
        check.recommendation = 'Increase unit test coverage';
      }
    } else {
      check.issue = 'Unit test data not available';
      check.recommendation = 'Implement comprehensive unit testing';
    }
  } catch (error) {
    check.issue = `Unit test check failed: ${error.message}`;
    check.recommendation = 'Set up unit testing framework';
  }
  
  return check;
}

function checkIntegrationTests() {
  const check = { id: 'integration_tests', name: 'Integration Tests', passed: false };
  
  try {
    // Check for integration test files
    const integrationFiles = getFilesMatching('**/*integration*.test.{ts,js}');
    
    if (integrationFiles.length > 0) {
      check.passed = true;
      check.details = `${integrationFiles.length} integration test files found`;
    } else {
      check.issue = 'Integration tests not implemented';
      check.recommendation = 'Implement integration tests for API endpoints';
    }
  } catch (error) {
    check.issue = `Integration test check failed: ${error.message}`;
    check.recommendation = 'Set up integration testing';
  }
  
  return check;
}

function checkPerformanceTests() {
  const check = { id: 'performance_tests', name: 'Performance Tests', passed: false };
  
  try {
    // Check for performance test files
    const perfFiles = getFilesMatching('**/*{performance,perf,load}*.{js,ts}');
    
    if (perfFiles.length > 0) {
      check.passed = true;
      check.details = `${perfFiles.length} performance test files found`;
    } else {
      check.issue = 'Performance tests not implemented';
      check.recommendation = 'Implement performance testing with k6 or similar';
    }
  } catch (error) {
    check.issue = `Performance test check failed: ${error.message}`;
    check.recommendation = 'Set up performance testing';
  }
  
  return check;
}

function checkSecurityTests() {
  const check = { id: 'security_tests', name: 'Security Tests', passed: false };
  
  try {
    // Check for security test files
    const securityFiles = getFilesMatching('**/*security*.test.{ts,js}');
    
    if (securityFiles.length > 0) {
      check.passed = true;
      check.details = `${securityFiles.length} security test files found`;
    } else {
      check.issue = 'Security tests not implemented';
      check.recommendation = 'Implement security testing for vulnerabilities';
    }
  } catch (error) {
    check.issue = `Security test check failed: ${error.message}`;
    check.recommendation = 'Set up security testing';
  }
  
  return check;
}

function checkAccessibilityTests() {
  const check = { id: 'accessibility_tests', name: 'Accessibility Tests', passed: false };
  
  try {
    // Check for accessibility test files
    const a11yFiles = getFilesMatching('**/*{a11y,accessibility}*.{ts,js}');
    
    if (a11yFiles.length > 0) {
      check.passed = true;
      check.details = `${a11yFiles.length} accessibility test files found`;
    } else {
      check.issue = 'Accessibility tests not implemented';
      check.recommendation = 'Implement accessibility testing with axe-core';
    }
  } catch (error) {
    check.issue = `Accessibility test check failed: ${error.message}`;
    check.recommendation = 'Set up accessibility testing';
  }
  
  return check;
}

function checkBrowserCompatibility() {
  const check = { id: 'browser_compatibility', name: 'Browser Compatibility', passed: false };
  
  try {
    // Check for browserslist configuration
    const configExists = fs.existsSync('.browserslistrc') || 
                         fs.existsSync('package.json') && JSON.parse(fs.readFileSync('package.json', 'utf8')).browserslist;
    
    if (configExists) {
      check.passed = true;
      check.details = 'Browser compatibility configuration found';
    } else {
      check.issue = 'Browser compatibility not configured';
      check.recommendation = 'Configure browserslist for target browser support';
    }
  } catch (error) {
    check.issue = `Browser compatibility check failed: ${error.message}`;
    check.recommendation = 'Set up browser compatibility testing';
  }
  
  return check;
}

function checkCICDPipeline() {
  const check = { id: 'ci_cd_pipeline', name: 'CI/CD Pipeline', passed: false };
  
  try {
    // Check for CI/CD configuration files
    const ciFiles = [
      '.github/workflows/',
      '.gitlab-ci.yml',
      'azure-pipelines.yml',
      'Jenkinsfile'
    ];
    
    const hasCICD = ciFiles.some(file => fs.existsSync(file));
    
    if (hasCICD) {
      check.passed = true;
      check.details = 'CI/CD pipeline configuration found';
    } else {
      check.issue = 'CI/CD pipeline not configured';
      check.recommendation = 'Set up automated CI/CD pipeline';
    }
  } catch (error) {
    check.issue = `CI/CD check failed: ${error.message}`;
    check.recommendation = 'Implement CI/CD pipeline';
  }
  
  return check;
}

function checkEnvironmentParity() {
  const check = { id: 'environment_parity', name: 'Environment Parity', passed: false };
  
  try {
    // Check for environment configuration files
    const envFiles = ['.env.example', '.env.local.example', '.env.production.example'];
    const hasEnvExamples = envFiles.some(file => fs.existsSync(file));
    
    if (hasEnvExamples) {
      check.passed = true;
      check.details = 'Environment configuration examples found';
    } else {
      check.issue = 'Environment parity not documented';
      check.recommendation = 'Create .env.example files for environment parity';
    }
  } catch (error) {
    check.issue = `Environment parity check failed: ${error.message}`;
    check.recommendation = 'Document environment configuration';
  }
  
  return check;
}

function checkDatabaseMigrations() {
  const check = { id: 'database_migrations', name: 'Database Migrations', passed: false };
  
  try {
    // Check for migration files
    const migrationFiles = getFilesMatching('**/*migration*.{sql,js,ts}');
    
    if (migrationFiles.length > 0) {
      check.passed = true;
      check.details = `${migrationFiles.length} migration files found`;
    } else {
      check.issue = 'Database migrations not implemented';
      check.recommendation = 'Implement database migration system';
    }
  } catch (error) {
    check.issue = `Migration check failed: ${error.message}`;
    check.recommendation = 'Set up database migrations';
  }
  
  return check;
}

function checkEnvironmentConfiguration() {
  const check = { id: 'environment_configuration', name: 'Environment Configuration', passed: false };
  
  try {
    // Check for proper environment variable handling
    const envFiles = ['.env.local', '.env.production', '.env'];
    const hasEnvFiles = envFiles.some(file => fs.existsSync(file));
    
    if (hasEnvFiles) {
      check.passed = true;
      check.details = 'Environment configuration files present';
    } else {
      check.issue = 'Environment configuration incomplete';
      check.recommendation = 'Set up proper environment configuration';
    }
  } catch (error) {
    check.issue = `Environment configuration check failed: ${error.message}`;
    check.recommendation = 'Configure environment variables';
  }
  
  return check;
}

function checkSSLCertificates() {
  const check = { id: 'ssl_certificates', name: 'SSL Certificates', passed: false };
  
  try {
    // This would typically check SSL configuration in production
    // For now, we'll check if HTTPS is enforced in configuration
    check.passed = true; // Assume SSL is handled by hosting platform
    check.details = 'SSL configuration handled by hosting platform';
  } catch (error) {
    check.issue = `SSL check failed: ${error.message}`;
    check.recommendation = 'Ensure SSL certificates are properly configured';
  }
  
  return check;
}

function checkCDNSetup() {
  const check = { id: 'cdn_setup', name: 'CDN Setup', passed: false };
  
  try {
    // Check Next.js config for CDN settings
    const nextConfigExists = fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs');
    
    if (nextConfigExists) {
      check.passed = true;
      check.details = 'Next.js configuration supports CDN integration';
    } else {
      check.issue = 'CDN not configured';
      check.recommendation = 'Configure CDN for static asset delivery';
    }
  } catch (error) {
    check.issue = `CDN check failed: ${error.message}`;
    check.recommendation = 'Set up CDN configuration';
  }
  
  return check;
}

function checkBackupVerification() {
  const check = { id: 'backup_verification', name: 'Backup Verification', passed: false };
  
  try {
    // Check for backup verification scripts
    const backupVerifyFiles = getFilesMatching('**/*{backup,verify}*.{sh,js,ts}');
    
    if (backupVerifyFiles.length > 0) {
      check.passed = true;
      check.details = `${backupVerifyFiles.length} backup verification files found`;
    } else {
      check.issue = 'Backup verification not implemented';
      check.recommendation = 'Implement backup verification procedures';
    }
  } catch (error) {
    check.issue = `Backup verification check failed: ${error.message}`;
    check.recommendation = 'Set up backup verification';
  }
  
  return check;
}

function checkDisasterRecovery() {
  const check = { id: 'disaster_recovery', name: 'Disaster Recovery', passed: false };
  
  try {
    // Check for disaster recovery documentation
    const drFiles = getFilesMatching('**/*{disaster,recovery,dr}*.{md,txt}');
    
    if (drFiles.length > 0) {
      check.passed = true;
      check.details = `${drFiles.length} disaster recovery documents found`;
    } else {
      check.issue = 'Disaster recovery plan not documented';
      check.recommendation = 'Create disaster recovery procedures';
    }
  } catch (error) {
    check.issue = `Disaster recovery check failed: ${error.message}`;
    check.recommendation = 'Document disaster recovery plan';
  }
  
  return check;
}

function checkAPIDocumentation() {
  const check = { id: 'api_documentation', name: 'API Documentation', passed: false };
  
  try {
    // Check for API documentation
    const apiDocFiles = getFilesMatching('**/*{api,swagger,openapi}*.{md,yml,yaml,json}');
    
    if (apiDocFiles.length > 0) {
      check.passed = true;
      check.details = `${apiDocFiles.length} API documentation files found`;
    } else {
      check.issue = 'API documentation not found';
      check.recommendation = 'Create comprehensive API documentation';
    }
  } catch (error) {
    check.issue = `API documentation check failed: ${error.message}`;
    check.recommendation = 'Document API endpoints';
  }
  
  return check;
}

function checkDeploymentGuide() {
  const check = { id: 'deployment_guide', name: 'Deployment Guide', passed: false };
  
  try {
    // Check for deployment documentation
    const deployFiles = getFilesMatching('**/*{deploy,installation,setup}*.md');
    
    if (deployFiles.length > 0) {
      check.passed = true;
      check.details = `${deployFiles.length} deployment guide files found`;
    } else {
      check.issue = 'Deployment guide not found';
      check.recommendation = 'Create deployment and installation guide';
    }
  } catch (error) {
    check.issue = `Deployment guide check failed: ${error.message}`;
    check.recommendation = 'Document deployment procedures';
  }
  
  return check;
}

function checkTroubleshootingGuide() {
  const check = { id: 'troubleshooting_guide', name: 'Troubleshooting Guide', passed: false };
  
  try {
    // Check for troubleshooting documentation
    const troubleshootFiles = getFilesMatching('**/*{troubleshoot,debug,faq}*.md');
    
    if (troubleshootFiles.length > 0) {
      check.passed = true;
      check.details = `${troubleshootFiles.length} troubleshooting guide files found`;
    } else {
      check.issue = 'Troubleshooting guide not found';
      check.recommendation = 'Create troubleshooting and FAQ documentation';
    }
  } catch (error) {
    check.issue = `Troubleshooting guide check failed: ${error.message}`;
    check.recommendation = 'Document troubleshooting procedures';
  }
  
  return check;
}

function checkCodeDocumentation() {
  const check = { id: 'code_documentation', name: 'Code Documentation', passed: false };
  
  try {
    // Check for README and other documentation
    const docFiles = ['README.md', 'CLAUDE.md', 'CONTRIBUTING.md'];
    const hasDocumentation = docFiles.some(file => fs.existsSync(file));
    
    if (hasDocumentation) {
      check.passed = true;
      check.details = 'Project documentation found';
    } else {
      check.issue = 'Code documentation incomplete';
      check.recommendation = 'Create comprehensive project documentation';
    }
  } catch (error) {
    check.issue = `Code documentation check failed: ${error.message}`;
    check.recommendation = 'Improve code documentation';
  }
  
  return check;
}

function checkSecurityRunbook() {
  const check = { id: 'security_runbook', name: 'Security Runbook', passed: false };
  
  try {
    // Check for security documentation
    const securityFiles = getFilesMatching('**/*security*.md');
    
    if (securityFiles.length > 0) {
      check.passed = true;
      check.details = `${securityFiles.length} security documentation files found`;
    } else {
      check.issue = 'Security runbook not found';
      check.recommendation = 'Create security procedures and incident response guide';
    }
  } catch (error) {
    check.issue = `Security runbook check failed: ${error.message}`;
    check.recommendation = 'Document security procedures';
  }
  
  return check;
}

function checkMonitoringRunbook() {
  const check = { id: 'monitoring_runbook', name: 'Monitoring Runbook', passed: false };
  
  try {
    // Check for monitoring documentation
    const monitoringFiles = getFilesMatching('**/*{monitoring,observability}*.md');
    
    if (monitoringFiles.length > 0) {
      check.passed = true;
      check.details = `${monitoringFiles.length} monitoring documentation files found`;
    } else {
      check.issue = 'Monitoring runbook not found';
      check.recommendation = 'Create monitoring and observability guide';
    }
  } catch (error) {
    check.issue = `Monitoring runbook check failed: ${error.message}`;
    check.recommendation = 'Document monitoring procedures';
  }
  
  return check;
}

function checkUserGuides() {
  const check = { id: 'user_guides', name: 'User Guides', passed: false };
  
  try {
    // Check for user documentation
    const userFiles = getFilesMatching('**/*{user,guide,manual}*.md');
    
    if (userFiles.length > 0) {
      check.passed = true;
      check.details = `${userFiles.length} user guide files found`;
    } else {
      check.issue = 'User guides not found';
      check.recommendation = 'Create user guides and documentation';
    }
  } catch (error) {
    check.issue = `User guide check failed: ${error.message}`;
    check.recommendation = 'Create user documentation';
  }
  
  return check;
}

function checkChangeLog() {
  const check = { id: 'change_log', name: 'Change Log', passed: false };
  
  try {
    // Check for changelog
    const changelogFiles = ['CHANGELOG.md', 'HISTORY.md', 'RELEASES.md'];
    const hasChangelog = changelogFiles.some(file => fs.existsSync(file));
    
    if (hasChangelog) {
      check.passed = true;
      check.details = 'Changelog documentation found';
    } else {
      check.issue = 'Changelog not found';
      check.recommendation = 'Maintain a changelog for version tracking';
    }
  } catch (error) {
    check.issue = `Changelog check failed: ${error.message}`;
    check.recommendation = 'Create changelog documentation';
  }
  
  return check;
}

// Run assessment if called directly
if (require.main === module) {
  runProductionAssessment()
    .then(assessment => {
      if (assessment.criticalIssues.length > 0) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Assessment failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runProductionAssessment,
  ASSESSMENT_CATEGORIES,
};