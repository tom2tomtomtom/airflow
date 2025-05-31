import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
  error?: string;
  data?: any;
}

interface IntegrationTestResponse {
  success: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IntegrationTestResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
      results: [],
      timestamp: new Date().toISOString()
    });
  }

  const startTime = Date.now();
  const results: TestResult[] = [];

  // Helper function to run a test
  const runTest = async (name: string, testFn: () => Promise<any>): Promise<TestResult> => {
    const testStart = Date.now();
    try {
      const data = await testFn();
      const duration = Date.now() - testStart;
      return {
        name,
        status: 'pass',
        message: 'Test passed successfully',
        duration,
        data
      };
    } catch (error) {
    const message = getErrorMessage(error);
      const duration = Date.now() - testStart;
      return {
        name,
        status: 'fail',
        message: 'Test failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Test 1: OpenAI Integration
  results.push(await runTest('OpenAI Integration', async () => {
    const response = await fetch(`${req.headers.host ? `http://${req.headers.host}` : ''}/api/test/openai`);
    if (!response.ok) {
      throw new Error(`OpenAI test failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'OpenAI test returned failure');
    }
    return data;
  }));

  // Test 2: Creatomate Connectivity Test
  results.push(await runTest('Creatomate Connectivity', async () => {
    const response = await fetch(`${req.headers.host ? `http://${req.headers.host}` : ''}/api/creatomate/test`);
    if (!response.ok) {
      throw new Error(`Creatomate test failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Creatomate test returned failure');
    }
    return data;
  }));

  // Test 3: Creatomate Templates Access
  results.push(await runTest('Creatomate Templates', async () => {
    const response = await fetch(`${req.headers.host ? `http://${req.headers.host}` : ''}/api/creatomate/templates?limit=1`);
    if (!response.ok) {
      throw new Error(`Creatomate templates test failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Creatomate templates test returned failure');
    }
    return data;
  }));

  // Test 4: Creatomate Account Info
  results.push(await runTest('Creatomate Account', async () => {
    const response = await fetch(`${req.headers.host ? `http://${req.headers.host}` : ''}/api/creatomate/account`);
    if (!response.ok) {
      throw new Error(`Creatomate account test failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Creatomate account test returned failure');
    }
    return data;
  }));

  // Test 5: Supabase Integration
  results.push(await runTest('Supabase Integration', async () => {
    const response = await fetch(`${req.headers.host ? `http://${req.headers.host}` : ''}/api/test/supabase`);
    if (!response.ok) {
      throw new Error(`Supabase test failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Supabase test returned failure');
    }
    return data;
  }));

  // Test 6: Environment Variables Check
  results.push(await runTest('Environment Configuration', async () => {
    const requiredVars = [
      'OPENAI_API_KEY',
      'CREATOMATE_API_KEY', 
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    const present = requiredVars.filter(varName => process.env[varName]);

    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    return {
      message: 'All required environment variables are configured',
      configured: present,
      total: requiredVars.length
    };
  }));

  // Test 7: Authentication System
  results.push(await runTest('Authentication System', async () => {
    const response = await fetch(`${req.headers.host ? `http://${req.headers.host}` : ''}/api/auth/test`);
    if (!response.ok) {
      throw new Error(`Auth test failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Auth test returned failure');
    }
    return data;
  }));

  // Test 8: Feature Flags Check
  results.push(await runTest('Feature Flags', async () => {
    const flags = {
      demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      aiFeatures: process.env.ENABLE_AI_FEATURES === 'true',
      videoGeneration: process.env.ENABLE_VIDEO_GENERATION === 'true',
      socialPublishing: process.env.ENABLE_SOCIAL_PUBLISHING === 'true'
    };

    return {
      message: 'Feature flags configuration retrieved',
      flags,
      integrationMode: flags.demoMode ? 'demo' : 'production'
    };
  }));

  // Calculate summary
  const totalDuration = Date.now() - startTime;
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  const success = failed === 0;

  console.log(`Integration test suite completed: ${passed}/${results.length} passed in ${totalDuration}ms`);

  return res.status(success ? 200 : 500).json({
    success,
    summary: {
      total: results.length,
      passed,
      failed,
      skipped,
      duration: totalDuration
    },
    results,
    timestamp: new Date().toISOString()
  });
}

export const config = {
  api: {
    externalResolver: true,
  },
  maxDuration: 120, // 2 minutes for comprehensive testing
};