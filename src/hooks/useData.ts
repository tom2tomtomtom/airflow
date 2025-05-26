import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  isDemoMode, 
  getDemoClients, 
  getDemoAssets, 
  getDemoTemplates, 
  getDemoCampaigns,
  getDemoMatrices,
  campaignToUICampaign,
  type UICampaign
} from '@/lib/demo-data';
import type { Client, Asset, Template, Campaign, Matrix } from '@/types/models';

// Type mapping for entity types
type EntityTypes = {
  clients: Client;
  assets: Asset;
  templates: Template;
  campaigns: Campaign | UICampaign;
  matrices: Matrix;
};

// Generic useData hook
export function useData<T extends keyof EntityTypes>(
  entityType: T,
  id?: string
): {
  data: EntityTypes[T] | EntityTypes[T][] | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<EntityTypes[T] | EntityTypes[T][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result: any = null;

        if (isDemoMode()) {
          // Demo mode data fetching
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
          
          switch (entityType) {
            case 'clients':
              const clients = getDemoClients();
              result = id ? clients.find(c => c.id === id) : clients;
              break;
            case 'campaigns':
              const campaigns = getDemoCampaigns() as UICampaign[];
              result = id ? campaigns.find(c => c.id === id) : campaigns;
              break;
            case 'assets':
              const assets = getDemoAssets();
              result = id ? assets.find(a => a.id === id) : assets;
              break;
            case 'templates':
              const templates = getDemoTemplates();
              result = id ? templates.find(t => t.id === id) : templates;
              break;
            case 'matrices':
              const matrices = getDemoMatrices();
              result = id ? matrices.find(m => m.id === id) : matrices;
              break;
          }
        } else {
          // Supabase data fetching
          if (id) {
            const { data, error } = await supabase
              .from(entityType)
              .select('*')
              .eq('id', id)
              .single();
            
            if (error) throw error;
            
            // Convert campaign data for UI if needed
            if (entityType === 'campaigns' && data) {
              result = campaignToUICampaign(data as Campaign);
            } else {
              result = data;
            }
          } else {
            const { data, error } = await supabase
              .from(entityType)
              .select('*')
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Convert campaign data for UI if needed
            if (entityType === 'campaigns' && data) {
              result = (data as Campaign[]).map(campaignToUICampaign);
            } else {
              result = data || [];
            }
          }
        }

        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityType, id]);

  return { data, loading, error };
}

// Custom hook for fetching clients
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return getDemoClients();
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for fetching assets
export const useAssets = (clientId?: string) => {
  return useQuery({
    queryKey: ['assets', clientId],
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return getDemoAssets(clientId);
      }
      
      let query = supabase.from('assets').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
};

// Custom hook for fetching templates
export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return getDemoTemplates();
      }
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for fetching campaigns
export const useCampaigns = (clientId?: string) => {
  return useQuery({
    queryKey: ['campaigns', clientId],
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 350));
        return getDemoCampaigns(clientId) as UICampaign[];
      }
      
      let query = supabase.from('campaigns').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to UI format
      return (data || []).map(campaignToUICampaign);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Custom hook for fetching matrices
export const useMatrices = (clientId?: string) => {
  return useQuery({
    queryKey: ['matrices', clientId],
    queryFn: async () => {
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return getDemoMatrices(clientId);
      }
      
      let query = supabase.from('matrices').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Custom hook for creating/updating assets
export const useCreateAsset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAsset = async (asset: Partial<Asset>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode()) {
        // In demo mode, just return a mock created asset
        const newAsset = {
          ...asset,
          id: `demo-asset-${Date.now()}`,
          dateCreated: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: 'demo-user',
          version: 1,
          metadata: asset.metadata || {},
        } as Asset;
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return { data: newAsset, error: null };
      }

      const { data, error } = await supabase
        .from('assets')
        .insert([asset])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { createAsset, isLoading, error };
};

// Custom hook for creating/updating matrices
export const useCreateMatrix = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMatrix = async (matrix: Partial<Matrix>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode()) {
        // In demo mode, just return a mock created matrix
        const newMatrix = {
          ...matrix,
          id: `demo-matrix-${Date.now()}`,
          dateCreated: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: 'demo-user',
          version: 1,
          metadata: {},
        } as Matrix;
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return { data: newMatrix, error: null };
      }

      const { data, error } = await supabase
        .from('matrices')
        .insert([matrix])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateMatrix = async (id: string, updates: Partial<Matrix>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isDemoMode()) {
        // In demo mode, just return the updated matrix
        const updatedMatrix = {
          ...updates,
          id,
          lastModified: new Date().toISOString(),
          version: (updates.version || 1) + 1,
        } as Matrix;
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return { data: updatedMatrix, error: null };
      }

      const { data, error } = await supabase
        .from('matrices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { createMatrix, updateMatrix, isLoading, error };
};

// Custom hook for uploading files
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, clientId: string, path?: string) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (isDemoMode()) {
        // Simulate upload progress in demo mode
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(i);
        }
        
        // Return a mock URL
        return {
          url: URL.createObjectURL(file),
          path: `demo/${clientId}/${file.name}`,
          error: null,
        };
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path ? `${path}/${fileName}` : `${clientId}/${fileName}`;

      const { data: _data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file, {
          onUploadProgress: (progress: { loaded: number; total: number }) => {
            const percentComplete = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          },
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl, path: filePath, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { url: null, path: null, error };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, uploadProgress, error };
};
