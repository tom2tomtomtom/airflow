/**
 * Service Integration Examples
 *
 * This file contains practical examples of how to integrate with the service layer
 * in different scenarios. These examples demonstrate best practices and common patterns.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createService, getService } from '../ServiceFactory';
import { ClientService } from '../ClientService';
import type { Client } from '@/types/models';
import type { ServiceOperationResult } from '@/types/services';

// ============================================================================
// EXAMPLE 1: Basic Service Integration in a Component
// ============================================================================

/**
 * Simple list component that displays clients using the service
 */
export function BasicClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get service instance
        const clientService = await createService<ClientService>('client-service');

        // Call service method
        const result = await clientService.getAllClients();

        if (result.success && result.data) {
          setClients(result.data);
        } else {
          setError(result.error?.message || 'Failed to load clients');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {clients.map(client => (
        <li key={client.id}>
          {client.name} - {client.industry}
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// EXAMPLE 2: Form Component with Service Operations
// ============================================================================

/**
 * Form component that creates and updates clients using the service
 */
export function ClientForm({
  clientId,
  onSave,
}: {
  clientId?: string;
  onSave?: (client: Client) => void;
}) {
  const [formData, setFormData] = useState({ name: '', industry: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing client for editing
  useEffect(() => {
    if (!clientId) return;

    const loadClient = async () => {
      try {
        const clientService = await createService<ClientService>('client-service');
        const result = await clientService.getClientById(clientId);

        if (result.success && result.data) {
          setFormData({
            name: result.data.name,
            industry: result.data.industry,
          });
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadClient();
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const clientService = await createService<ClientService>('client-service');

      let result: ServiceOperationResult<Client>;

      if (clientId) {
        // Update existing client
        result = await clientService.updateClient(clientId, formData);
      } else {
        // Create new client
        result = await clientService.createClient(formData);
      }

      if (result.success && result.data) {
        onSave?.(result.data);
      } else {
        setError(result.error?.message || 'Failed to save client');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          disabled={loading}
        />
      </div>

      <div>
        <label>Industry:</label>
        <input
          value={formData.industry}
          onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
          disabled={loading}
        />
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : clientId ? 'Update' : 'Create'}
      </button>
    </form>
  );
}

// ============================================================================
// EXAMPLE 3: Search Component with Debouncing
// ============================================================================

/**
 * Search component that uses service search with debouncing
 */
export function ClientSearch({ onSelect }: { onSelect: (client: Client) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const clientService = await createService<ClientService>('client-service');
        const result = await clientService.searchClients(searchTerm);

        if (result.success && result.data) {
          setResults(result.data);
        } else {
          setError(result.error?.message || 'Search failed');
          setResults([]);
        }
      } catch (err: any) {
        setError(err.message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search clients..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {isSearching && <div>Searching...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <ul>
        {results.map(client => (
          <li key={client.id}>
            <button onClick={() => onSelect(client)}>
              {client.name} - {client.industry}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Custom Hook for Service Integration
// ============================================================================

/**
 * Custom hook that provides a clean interface to client operations
 */
export function useClientOperations() {
  const serviceRef = useRef<ClientService | null>(null);

  const getServiceInstance = useCallback(async (): Promise<ClientService> => {
    if (!serviceRef.current) {
      // Try to get existing instance first (singleton pattern)
      const existingService = getService<ClientService>('client-service');
      if (existingService) {
        serviceRef.current = existingService;
      } else {
        // Create new service instance
        serviceRef.current = await createService<ClientService>('client-service');
      }
    }
    return serviceRef.current;
  }, []);

  const createClient = useCallback(
    async (clientData: Partial<Client>): Promise<Client> => {
      const service = await getServiceInstance();
      const result = await service.createClient(clientData);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to create client');
      }
    },
    [getServiceInstance]
  );

  const updateClient = useCallback(
    async (id: string, clientData: Partial<Client>): Promise<Client> => {
      const service = await getServiceInstance();
      const result = await service.updateClient(id, clientData);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to update client');
      }
    },
    [getServiceInstance]
  );

  const deleteClient = useCallback(
    async (id: string): Promise<void> => {
      const service = await getServiceInstance();
      const result = await service.deleteClient(id);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete client');
      }
    },
    [getServiceInstance]
  );

  const searchClients = useCallback(
    async (searchTerm: string): Promise<Client[]> => {
      const service = await getServiceInstance();
      const result = await service.searchClients(searchTerm);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Search failed');
      }
    },
    [getServiceInstance]
  );

  return {
    createClient,
    updateClient,
    deleteClient,
    searchClients,
  };
}

// ============================================================================
// EXAMPLE 5: Error Handling Patterns
// ============================================================================

/**
 * Component demonstrating comprehensive error handling
 */
export function ClientManagerWithErrorHandling() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createClient, updateClient, deleteClient } = useClientOperations();

  const handleCreateClient = async (clientData: Partial<Client>) => {
    setLoading(true);
    setError(null);

    try {
      const newClient = await createClient(clientData);
      setClients(prev => [...prev, newClient]);

      // Success feedback
      console.log('Client created successfully:', newClient.name);
    } catch (err: any) {
      // Handle specific error types
      if (err.message.includes('already exists')) {
        setError('A client with this name already exists');
      } else if (err.message.includes('validation')) {
        setError('Please check the client information and try again');
      } else {
        setError('Failed to create client. Please try again later.');
      }

      // Log full error for debugging
      console.error('Client creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));

      console.log('Client deleted successfully');
    } catch (err: any) {
      setError('Failed to delete client. Please try again.');
      console.error('Client deletion failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div
          style={{
            color: 'red',
            background: '#fee',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && <div>Processing...</div>}

      {/* Client list and actions */}
      <div>
        {clients.map(client => (
          <div key={client.id}>
            {client.name}
            <button onClick={() => handleDeleteClient(client.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Optimistic Updates
// ============================================================================

/**
 * Component demonstrating optimistic UI updates
 */
export function OptimisticClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const { updateClient } = useClientOperations();

  const handleToggleActive = async (client: Client) => {
    const updatedClient = { ...client, isActive: !client.isActive };

    // Optimistic update
    setClients(prev => prev.map(c => (c.id === client.id ? updatedClient : c)));
    setPendingUpdates(prev => new Set(prev).add(client.id));

    try {
      // Actual service call
      const result = await updateClient(client.id, { isActive: !client.isActive });

      // Update with server response
      setClients(prev => prev.map(c => (c.id === client.id ? result : c)));
    } catch (error) {
      // Revert optimistic update on failure
      setClients(prev => prev.map(c => (c.id === client.id ? client : c)));
      console.error('Failed to update client:', error);
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(client.id);
        return newSet;
      });
    }
  };

  return (
    <ul>
      {clients.map(client => (
        <li key={client.id}>
          {client.name}
          <button
            onClick={() => handleToggleActive(client)}
            disabled={pendingUpdates.has(client.id)}
          >
            {pendingUpdates.has(client.id)
              ? 'Updating...'
              : client.isActive
                ? 'Deactivate'
                : 'Activate'}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// EXAMPLE 7: Service Health Monitoring
// ============================================================================

/**
 * Component that monitors service health
 */
export function ServiceHealthMonitor() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const clientService = await createService<ClientService>('client-service');
        const healthStatus = await clientService.healthCheck();
        setHealth(healthStatus);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Checking service health...</div>;

  return (
    <div>
      <h3>Service Health</h3>
      <div
        style={{
          color: health?.status === 'healthy' ? 'green' : 'red',
          fontWeight: 'bold',
        }}
      >
        Status: {health?.status || 'unknown'}
      </div>

      {health?.metadata && (
        <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(health.metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Batch Operations
// ============================================================================

/**
 * Component demonstrating batch operations
 */
export function BatchClientOperations() {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { deleteClient } = useClientOperations();

  const handleBatchDelete = async () => {
    if (selectedClients.length === 0) return;

    setIsProcessing(true);

    try {
      // Process deletions concurrently
      const deletePromises = selectedClients.map(clientId =>
        deleteClient(clientId).catch(error => ({ clientId, error }))
      );

      const results = await Promise.allSettled(deletePromises);

      // Handle results
      const failures = results
        .filter((result, index) => result.status === 'rejected')
        .map((_, index) => selectedClients[index]);

      if (failures.length > 0) {
        console.error(`Failed to delete ${failures.length} clients`);
      } else {
        console.log(`Successfully deleted ${selectedClients.length} clients`);
      }

      setSelectedClients([]);
    } catch (error) {
      console.error('Batch delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <button onClick={handleBatchDelete} disabled={selectedClients.length === 0 || isProcessing}>
        {isProcessing
          ? `Deleting ${selectedClients.length} clients...`
          : `Delete ${selectedClients.length} selected clients`}
      </button>
    </div>
  );
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const ServiceIntegrationExamples = {
  BasicClientList,
  ClientForm,
  ClientSearch,
  useClientOperations,
  ClientManagerWithErrorHandling,
  OptimisticClientList,
  ServiceHealthMonitor,
  BatchClientOperations,
};

export default ServiceIntegrationExamples;
