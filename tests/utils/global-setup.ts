/**
 * Global setup for AIrWAVE comprehensive testing
 * Handles test database setup, environment configuration, and authentication
 */

import { chromium, FullConfig } from '@playwright/test';
import { TestDatabase } from './test-database';
import { AuthHelper } from './auth-helper';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AIrWAVE comprehensive test setup...');
  
  // Ensure test directories exist
  const dirs = [
    'test-results',
    'test-results/artifacts',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  try {
    // 1. Setup test database (optional)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      console.log('📊 Setting up test database...');
      const testDb = new TestDatabase();
      await testDb.setup();
      process.env.TEST_DATABASE_READY = 'true';
    } else {
      console.log('⚠️ Skipping database setup - no Supabase config found');
      process.env.TEST_DATABASE_READY = 'false';
    }
    
    // 2. Setup authentication for tests
    console.log('🔐 Setting up authentication...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const authHelper = new AuthHelper(page);
    
    // Create test users with different roles
    await authHelper.setupTestUsers();
    
    // Store authentication state for tests
    await authHelper.saveAuthStates();
    
    await browser.close();
    
    // 3. Setup API mocks
    console.log('🎭 Setting up API mocks...');
    await setupAPIMocks();
    
    // 4. Setup test data
    console.log('📝 Setting up test data...');
    await setupTestData();
    
    console.log('✅ Global setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

async function setupAPIMocks() {
  // Setup mock responses for external APIs
  const mockConfigs = {
    creatomate: {
      baseUrl: 'https://api.creatomate.com',
      endpoints: {
        '/v1/renders': { status: 'queued', id: 'test-render-id' },
        '/v1/templates': { data: [] }
      }
    },
    openai: {
      baseUrl: 'https://api.openai.com',
      endpoints: {
        '/v1/chat/completions': {
          choices: [{ message: { content: 'Test response' } }]
        }
      }
    },
    elevenlabs: {
      baseUrl: 'https://api.elevenlabs.io',
      endpoints: {
        '/v1/text-to-speech': { audio_url: 'test-audio-url' }
      }
    }
  };
  
  // Save mock configurations for test use
  fs.writeFileSync(
    path.join(process.cwd(), 'tests/fixtures/api-mocks.json'),
    JSON.stringify(mockConfigs, null, 2)
  );
}

async function setupTestData() {
  // Create test assets and data
  const testAssets = [
    {
      name: 'test-image.jpg',
      type: 'image',
      size: 1024000,
      content: 'base64-encoded-image-data'
    },
    {
      name: 'test-video.mp4',
      type: 'video',
      size: 5120000,
      content: 'base64-encoded-video-data'
    },
    {
      name: 'test-audio.mp3',
      type: 'audio',
      size: 2048000,
      content: 'base64-encoded-audio-data'
    }
  ];
  
  // Save test assets
  fs.writeFileSync(
    path.join(process.cwd(), 'tests/fixtures/test-assets.json'),
    JSON.stringify(testAssets, null, 2)
  );
  
  // Create test campaigns and matrices
  const testCampaigns = {
    simple: {
      name: 'Simple Campaign',
      assets: ['test-image.jpg'],
      combinations: 1
    },
    complex: {
      name: 'Complex Campaign',
      assets: ['test-image.jpg', 'test-video.mp4', 'test-audio.mp3'],
      combinations: 24
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'tests/fixtures/test-campaigns.json'),
    JSON.stringify(testCampaigns, null, 2)
  );
}

export default globalSetup;