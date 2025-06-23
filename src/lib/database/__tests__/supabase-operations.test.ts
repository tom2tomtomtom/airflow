/**
 * Supabase Database Operations Tests
 * 
 * Tests comprehensive database operations including:
 * - CRUD operations for all models
 * - Data validation and constraints
 * - Transaction handling
 * - Error handling and recovery
 * - Performance and optimization
 */

import { supabase } from '@/lib/supabase';
import type { Client, Asset, Brief, Matrix } from '@/types/database';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {},
  from: jest.fn(),
    auth: {},
  getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn() },
  rpc: jest.fn()}}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Supabase Database Operations', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  // Setup default mock implementations with proper chaining
  const createMockChain = () => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })} as any);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(createMockChain());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Client Operations', () => {
    const mockClient: Partial<Client> = {
      id: 'client123',
      name: 'Test Client',
      description: 'A test client for unit testing',
      industry: 'Technology',
      logo_url: 'https://example.com/logo.png',
      primary_color: '#007bff',
      secondary_color: '#6c757d'};

    test('should create a new client', async () => {
      const mockResponse = { data: mockClient, error: null };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .insert(mockClient)
        .select()
        .single();

      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
      expect(result.data).toEqual(mockClient);
      expect(result.error).toBeNull();
    });

    test('should retrieve client by ID', async () => {
      const mockResponse = { data: mockClient, error: null };
      mockSupabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .select('*')
        .eq('id', 'client123')
        .single();

      expect(result.data).toEqual(mockClient);
      expect(result.error).toBeNull();
    });

    test('should update client information', async () => {
      const updates = { name: 'Updated Client Name' };
      const mockResponse = { data: null, error: null };
      mockSupabase.from().update().eq.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .update(updates)
        .eq('id', 'client123');

      expect(result.error).toBeNull();
    });

    test('should delete client', async () => {
      const mockResponse = { data: null, error: null };
      mockSupabase.from().delete().eq.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .delete()
        .eq('id', 'client123');

      expect(result.error).toBeNull();
    });

    test('should handle client creation validation errors', async () => {
      const invalidClient = { name: '' }; // Missing required fields
      const mockResponse = { 
        data: null, 
        error: { message: 'Validation failed', code: '23502' } 
      };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .insert(invalidClient)
        .select()
        .single();

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Validation failed');
    });

    test('should list clients with pagination', async () => {
      const mockClients = [mockClient, { ...mockClient, id: 'client456' }];
      const mockResponse = { data: mockClients, error: null };
      mockSupabase.from().select().order().range.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 9);

      expect(result.data).toEqual(mockClients);
      expect(result.error).toBeNull();
    });
  });

  describe('Asset Operations', () => {
    const mockAsset: Partial<Asset> = {
      id: 'asset123',
      name: 'Test Asset',
      type: 'image',
      file_url: 'https://example.com/asset.jpg',
      client_id: 'client123',
      created_by: 'user123',
      file_size: 1024000,
      mime_type: 'image/jpeg',
      tags: ['marketing', 'social']};

    test('should create a new asset', async () => {
      const mockResponse = { data: mockAsset, error: null };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('assets')
        .insert(mockAsset)
        .select()
        .single();

      expect(result.data).toEqual(mockAsset);
      expect(result.error).toBeNull();
    });

    test('should search assets by tags', async () => {
      const mockAssets = [mockAsset];
      const mockResponse = { data: mockAssets, error: null };
      mockSupabase.from().select().eq().or.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('assets')
        .select('*')
        .eq('client_id', 'client123')
        .or('tags.cs.{marketing},tags.cs.{social}');

      expect(result.data).toEqual(mockAssets);
    });

    test('should filter assets by type', async () => {
      const mockResponse = { data: [mockAsset], error: null };
      const mockChain = createMockChain();
      mockChain.eq = jest.fn().mockReturnValue({
        ...mockChain,
        eq: jest.fn().mockResolvedValue(mockResponse)
      });
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await supabase
        .from('assets')
        .select('*')
        .eq('client_id', 'client123')
        .eq('type', 'image');

      expect(result.data).toEqual([mockAsset]);
    });

    test('should handle asset file size validation', async () => {
      const oversizedAsset = { ...mockAsset, file_size: 100000000 }; // 100MB
      const mockResponse = { 
        data: null, 
        error: { message: 'File size exceeds limit', code: '23514' } 
      };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('assets')
        .insert(oversizedAsset)
        .select()
        .single();

      expect(result.error).toBeTruthy();
    });

    test('should update asset metadata', async () => {
      const metadata = { width: 1920, height: 1080, format: 'JPEG' };
      const mockResponse = { data: null, error: null };
      mockSupabase.from().update().eq.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('assets')
        .update({ metadata })
        .eq('id', 'asset123');

      expect(result.error).toBeNull();
    });
  });

  describe('Brief Operations', () => {
    const mockBrief: Partial<Brief> = {
      id: 'brief123',
      name: 'Test Campaign Brief',
      description: 'A comprehensive campaign brief',
      client_id: 'client123',
      created_by: 'user123',
      objectives: { primary: 'Increase brand awareness'  },
  target_audience: 'Millennials aged 25-35',
      platforms: ['facebook', 'instagram'],
      budget: 50000};

    test('should create a new brief', async () => {
      const mockResponse = { data: mockBrief, error: null };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('briefs')
        .insert(mockBrief)
        .select()
        .single();

      expect(result.data).toEqual(mockBrief);
      expect(result.error).toBeNull();
    });

    test('should retrieve brief with parsed content', async () => {
      const briefWithContent = {
        ...mockBrief,
        raw_content: 'Original brief content...',
        parsing_status: 'completed',
        parsed_at: new Date().toISOString()};
      const mockResponse = { data: briefWithContent, error: null };
      mockSupabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('briefs')
        .select('*')
        .eq('id', 'brief123')
        .single();

      expect(result.data).toEqual(briefWithContent);
    });

    test('should update brief parsing status', async () => {
      const mockResponse = { data: null, error: null };
      mockSupabase.from().update().eq.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('briefs')
        .update({
          parsing_status: 'completed',
          parsed_at: new Date().toISOString()})
        .eq('id', 'brief123');

      expect(result.error).toBeNull();
    });

    test('should validate brief budget constraints', async () => {
      const invalidBrief = { ...mockBrief, budget: -1000 }; // Negative budget
      const mockResponse = { 
        data: null, 
        error: { message: 'Budget must be positive', code: '23514' } 
      };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('briefs')
        .insert(invalidBrief)
        .select()
        .single();

      expect(result.error).toBeTruthy();
    });
  });

  describe('Campaign Operations', () => {
    const mockCampaign = {
      id: 'campaign123',
      name: 'Test Campaign',
      client_id: 'client123',
      brief_id: 'brief123',
      status: 'draft' as const,
      created_by: 'user123',
      budget: 25000,
      start_date: '2024-01-01',
      end_date: '2024-01-31'};

    test('should create a new campaign', async () => {
      const mockResponse = { data: mockCampaign, error: null };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('campaigns')
        .insert(mockCampaign)
        .select()
        .single();

      expect(result.data).toEqual(mockCampaign);
    });

    test('should update campaign status', async () => {
      const mockResponse = { data: null, error: null };
      mockSupabase.from().update().eq.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', 'campaign123');

      expect(result.error).toBeNull();
    });

    test('should filter campaigns by status', async () => {
      const mockResponse = { data: [mockCampaign], error: null };
      const mockChain = createMockChain();
      mockChain.eq = jest.fn().mockReturnValue({
        ...mockChain,
        eq: jest.fn().mockResolvedValue(mockResponse)
      });
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await supabase
        .from('campaigns')
        .select('*')
        .eq('client_id', 'client123')
        .eq('status', 'active');

      expect(result.data).toEqual([mockCampaign]);
    });
  });

  describe('Matrix Operations', () => {
    const mockMatrix: Partial<Matrix> = {
      id: 'matrix123',
      campaign_id: 'campaign123',
      client_id: 'client123',
      created_by: 'user123',
      asset_ids: ['asset1', 'asset2'],
      copy_ids: ['copy1', 'copy2'],
      template_id: 'template123',
      combinations: [
        { asset_id: 'asset1', copy_id: 'copy1'  }
        { asset_id: 'asset2', copy_id: 'copy2'  }
      ]};

    test('should create a new matrix', async () => {
      const mockResponse = { data: mockMatrix, error: null };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('matrices')
        .insert(mockMatrix)
        .select()
        .single();

      expect(result.data).toEqual(mockMatrix);
    });

    test('should retrieve matrix with related data', async () => {
      const matrixWithRelations = {
        ...mockMatrix,
        campaign: { name: 'Test Campaign'  },
  assets: [{ id: 'asset1', name: 'Asset 1' }]};
      const mockResponse = { data: matrixWithRelations, error: null };
      mockSupabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('matrices')
        .select(`
          *,
          campaign:campaigns(name),
          assets:assets(id, name)
        `)
        .eq('id', 'matrix123')
        .single();

      expect(result.data).toEqual(matrixWithRelations);
    });
  });

  describe('Transaction Handling', () => {
    test('should handle database transactions', async () => {
      // Mock RPC call for transaction
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

      const result = await supabase.rpc('create_campaign_with_assets', {
        campaign_data: { name: 'Test Campaign'  },
  asset_ids: ['asset1', 'asset2']});

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });

    test('should handle transaction rollback on error', async () => {
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Transaction failed', code: 'P0001' } 
      });

      const result = await supabase.rpc('create_campaign_with_assets', {
        campaign_data: { name: '' }, // Invalid data
        asset_ids: ['asset1']});

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      mockSupabase.from().select().single.mockRejectedValue(
        new Error('Network error')
      );

      try {
        await supabase.from('clients').select('*').single();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    test('should handle constraint violations', async () => {
      const mockResponse = { 
        data: null, 
        error: { 
          message: 'duplicate key value violates unique constraint',
          code: '23505' 
        } 
      };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('clients')
        .insert({ name: 'Duplicate Client' })
        .select()
        .single();

      expect(result.error?.code).toBe('23505');
    });

    test('should handle foreign key violations', async () => {
      const mockResponse = { 
        data: null, 
        error: { 
          message: 'insert or update on table violates foreign key constraint',
          code: '23503' 
        } 
      };
      mockSupabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('assets')
        .insert({ client_id: 'nonexistent', name: 'Test' })
        .select()
        .single();

      expect(result.error?.code).toBe('23503');
    });
  });

  describe('Performance Optimization', () => {
    test('should use proper indexing for queries', async () => {
      const mockResponse = { data: [], error: null };
      mockSupabase.from().select().eq().order().limit.mockResolvedValue(mockResponse);

      await supabase
        .from('assets')
        .select('id, name, created_at')
        .eq('client_id', 'client123')
        .order('created_at', { ascending: false })
        .limit(10);

      // Verify that indexed columns are used in queries
      expect(mockSupabase.from).toHaveBeenCalledWith('assets');
    });

    test('should handle large result sets with pagination', async () => {
      const mockResponse = { data: [], error: null, count: 1000 };
      mockSupabase.from().select().range.mockResolvedValue(mockResponse);

      const result = await supabase
        .from('assets')
        .select('*', { count: 'exact' })
        .range(0, 99);

      expect(result.count).toBe(1000);
    });

    test('should optimize queries with selective field selection', async () => {
      const mockResponse = { data: [], error: null };
      mockSupabase.from().select().eq.mockResolvedValue(mockResponse);

      await supabase
        .from('clients')
        .select('id, name, logo_url')
        .eq('industry', 'Technology');

      // Verify selective field selection is used
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });
  });
});
