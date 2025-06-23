import { getErrorMessage } from '@/utils/errorUtils';
/**
 * Test database management for AIrWAVE testing
 * Handles test data seeding, cleanup, and isolation
 */

import { createClient } from '@supabase/supabase-js';

export class TestDatabase {
  private supabase: any;
  private testPrefix = 'test_';

  constructor() {
    // Initialize with test database configuration
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase configuration not found - database features disabled');
      this.supabase = null as any;
      return;
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  isAvailable(): boolean {
    return this.supabase !== null;
  }

  async setup(): Promise<void> {
    if (!this.isAvailable()) {
      console.log('⚠️ Database not available - skipping setup');
      return;
    }
    
    console.log('Setting up test database...');
    
    try {
      // Create test data
      await this.seedTestData();
      console.log('✅ Test database setup complete');
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (!this.isAvailable()) {
      console.log('⚠️ Database not available - skipping cleanup');
      return;
    }
    
    console.log('Cleaning up test database...');
    
    try {
      // Clean up test data
      await this.cleanupTestData();
      console.log('✅ Test database cleanup complete');
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('❌ Test database cleanup failed:', error);
      // Don't throw to avoid masking test failures
    }
  }

  async seedTestData(): Promise<void> {
    // Create test clients
    const testClients = [
      {
        id: `${this.testPrefix}client_1`,
        name: 'Test Client 1',
        description: 'Test client for automated testing',
        industry: 'Technology',
        logo_url: 'https://example.com/logo1.png',
        created_at: new Date().toISOString()
      },
      {
        id: `${this.testPrefix}client_2`,
        name: 'Test Client 2',
        description: 'Another test client',
        industry: 'Healthcare',
        logo_url: 'https://example.com/logo2.png',
        created_at: new Date().toISOString()
      }
    ];

    // Insert test clients
    for (const client of testClients) {
      await this.supabase
        .from('clients')
        .upsert(client);
    }

    // Create test assets
    const testAssets = [
      {
        id: `${this.testPrefix}asset_1`,
        client_id: `${this.testPrefix}client_1`,
        name: 'test-image.jpg',
        type: 'image',
        file_url: 'https://picsum.photos/400/300',
        thumbnail_url: 'https://picsum.photos/200/150',
        description: 'Test image for automation',
        tags: ['test', 'automation'],
        file_size: 1024000,
        mime_type: 'image/jpeg',
        created_by: `${this.testPrefix}user_1`,
        created_at: new Date().toISOString()
      },
      {
        id: `${this.testPrefix}asset_2`,
        client_id: `${this.testPrefix}client_1`,
        name: 'test-video.mp4',
        type: 'video',
        file_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        description: 'Test video for automation',
        tags: ['test', 'video'],
        file_size: 5120000,
        mime_type: 'video/mp4',
        duration: 30,
        created_by: `${this.testPrefix}user_1`,
        created_at: new Date().toISOString()
      }
    ];

    // Insert test assets
    for (const asset of testAssets) {
      await this.supabase
        .from('assets')
        .upsert(asset);
    }

    // Create test templates
    const testTemplates = [
      {
        id: `${this.testPrefix}template_1`,
        name: 'Test Template 1',
        platform: 'instagram',
        aspect_ratio: '1:1',
        structure: {
          layers: [
            { type: 'image', name: 'background' },
            { type: 'text', name: 'headline' }
          ]
        },
        created_at: new Date().toISOString()
      }
    ];

    // Insert test templates
    for (const template of testTemplates) {
      await this.supabase
        .from('templates')
        .upsert(template);
    }

    // Create test matrices
    const testMatrices = [
      {
        id: `${this.testPrefix}matrix_1`,
        client_id: `${this.testPrefix}client_1`,
        name: 'Test Matrix 1',
        structure: {
          rows: 2,
          cols: 3,
          combinations: 6
        },
        template_id: `${this.testPrefix}template_1`,
        created_by: `${this.testPrefix}user_1`,
        created_at: new Date().toISOString()
      }
    ];

    // Insert test matrices
    for (const matrix of testMatrices) {
      await this.supabase
        .from('matrices')
        .upsert(matrix);
    }

    // Create test briefs
    const testBriefs = [
      {
        id: `${this.testPrefix}brief_1`,
        client_id: `${this.testPrefix}client_1`,
        name: 'Test Brief 1',
        raw_content: 'This is a test brief for automated testing.',
        parsed_data: {
          objectives: ['Test objective 1', 'Test objective 2'],
          target_audience: 'Test audience',
          key_messages: ['Message 1', 'Message 2']
        },
        created_by: `${this.testPrefix}user_1`,
        created_at: new Date().toISOString()
      }
    ];

    // Insert test briefs
    for (const brief of testBriefs) {
      await this.supabase
        .from('briefs')
        .upsert(brief);
    }

    console.log('✅ Test data seeded successfully');
  }

  async cleanupTestData(): Promise<void> {
    const tables = [
      'executions',
      'approval_workflows', 
      'matrices',
      'briefs',
      'assets',
      'templates',
      'clients'
    ];

    // Delete test data from each table
    for (const table of tables) {
      try {
        const { error } = await this.supabase
          .from(table)
          .delete()
          .like('id', `${this.testPrefix}%`);
        
        if (error) {
          console.warn(`Warning: Could not clean ${table}:`, error.message);
        }
      } catch (error) {
    const message = getErrorMessage(error);
        console.warn(`Warning: Could not clean ${table}:`, error.message);
      }
    }

    console.log('✅ Test data cleanup complete');
  }

  async getTestClient(index: number = 1): Promise<any> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', `${this.testPrefix}client_${index}`)
      .single();

    if (error) {
      throw new Error(`Could not get test client ${index}: ${error.message}`);
    }

    return data;
  }

  async getTestAssets(clientId?: string): Promise<any[]> {
    let query = this.supabase
      .from('assets')
      .select('*')
      .like('id', `${this.testPrefix}%`);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Could not get test assets: ${error.message}`);
    }

    return data || [];
  }

  async createTestExecution(matrixId: string): Promise<string> {
    const executionId = `${this.testPrefix}execution_${Date.now()}`;
    
    const { error } = await this.supabase
      .from('executions')
      .insert({
        id: executionId,
        matrix_id: matrixId,
        status: 'pending',
        metadata: {
          test: true,
          created_at: new Date().toISOString()
        }
      });

    if (error) {
      throw new Error(`Could not create test execution: ${error.message}`);
    }

    return executionId;
  }

  async updateExecutionStatus(executionId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('executions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', executionId);

    if (error) {
      throw new Error(`Could not update execution status: ${error.message}`);
    }
  }

  async waitForExecutionStatus(executionId: string, expectedStatus: string, timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const { data, error } = await this.supabase
        .from('executions')
        .select('status')
        .eq('id', executionId)
        .single();

      if (error) {
        throw new Error(`Could not check execution status: ${error.message}`);
      }

      if (data.status === expectedStatus) {
        return true;
      }

      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  // Helper method to reset database to clean state
  async reset(): Promise<void> {
    await this.cleanup();
    await this.setup();
  }
}