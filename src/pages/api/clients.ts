import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, getUserFromToken, getUserClients } from '@/lib/supabase';
import { isDemo } from '@/lib/env';

// Mock client data for demo mode
const mockClients = [
  {
    id: 'demo-client-1',
    name: 'Acme Corporation',
    description: 'Leading technology company specializing in innovative solutions',
    primaryColor: '#3a86ff',
    secondaryColor: '#8338ec',
    logoUrl: '/mock-images/client-logos/acme.png',
  },
  {
    id: 'demo-client-2',
    name: 'Eco Friendly Products',
    description: 'Sustainable retail company offering eco-friendly consumer products',
    primaryColor: '#06d6a0',
    secondaryColor: '#ffbe0b',
    logoUrl: '/mock-images/client-logos/eco.png',
  },
  {
    id: 'demo-client-3',
    name: 'Wellness Hub',
    description: 'Holistic wellness center offering fitness, nutrition, and mental health services',
    primaryColor: '#ef476f',
    secondaryColor: '#ffd166',
    logoUrl: '/mock-images/client-logos/wellness.png',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check for demo mode
  const authHeader = req.headers.authorization;
  const isDemoMode = isDemo || !authHeader || authHeader.includes('demo-token') || authHeader.includes('mock_token');

  if (isDemoMode) {
    // Handle demo mode
    if (req.method === 'GET') {
      return res.status(200).json({ 
        success: true,
        clients: mockClients,
        message: 'Demo clients loaded'
      });
    } else if (req.method === 'POST') {
      const newClient = {
        ...req.body,
        id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      
      return res.status(201).json({
        success: true,
        client: newClient,
        message: 'Client created successfully (demo mode)'
      });
    }
  }

  // Real Supabase mode - extract token
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    // Get user from token
    const user = await getUserFromToken(token);
    
    if (req.method === 'GET') {
      // Get user's accessible clients
      const userClientIds = await getUserClients(user.id);
      
      // Fetch client details
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .in('id', userClientIds)
        .order('name');
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      // Transform clients to match expected format
      const transformedClients = clients?.map(client => ({
        id: client.id,
        name: client.name,
        description: client.description || '',
        primaryColor: client.primary_color || '#3a86ff',
        secondaryColor: client.secondary_color || '#8338ec',
        logoUrl: client.logo_url || null,
        industry: client.industry || null,
        created_at: client.created_at,
        updated_at: client.updated_at
      })) || [];
      
      return res.status(200).json({ 
        success: true,
        clients: transformedClients,
        message: transformedClients.length > 0 ? 'Clients loaded successfully' : 'No clients found'
      });
      
    } else if (req.method === 'POST') {
      // Create a new client
      const { name, description, primaryColor, secondaryColor, logoUrl, industry } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Client name is required'
        });
      }
      
      // Use service role client for creating clients
      const serviceSupabase = getServiceSupabase();
      
      // Create the client
      const { data: newClient, error: clientError } = await serviceSupabase
        .from('clients')
        .insert({
          name,
          description,
          primary_color: primaryColor || '#3a86ff',
          secondary_color: secondaryColor || '#8338ec',
          logo_url: logoUrl || null,
          industry: industry || null
        })
        .select()
        .single();
      
      if (clientError) {
        console.error('Error creating client:', clientError);
        throw clientError;
      }
      
      // Grant the user access to the new client
      const { error: accessError } = await serviceSupabase
        .from('user_clients')
        .insert({
          user_id: user.id,
          client_id: newClient.id
        });
      
      if (accessError) {
        console.error('Error granting client access:', accessError);
        // Rollback client creation
        await serviceSupabase
          .from('clients')
          .delete()
          .eq('id', newClient.id);
        throw accessError;
      }
      
      // Transform response
      const transformedClient = {
        id: newClient.id,
        name: newClient.name,
        description: newClient.description || '',
        primaryColor: newClient.primary_color,
        secondaryColor: newClient.secondary_color,
        logoUrl: newClient.logo_url,
        industry: newClient.industry,
        created_at: newClient.created_at,
        updated_at: newClient.updated_at
      };
      
      return res.status(201).json({
        success: true,
        client: transformedClient,
        message: 'Client created successfully'
      });
      
    } else if (req.method === 'PUT') {
      // Update a client
      const { id } = req.query;
      const { name, description, primaryColor, secondaryColor, logoUrl, industry } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }
      
      // Check if user has access to this client
      const userClientIds = await getUserClients(user.id);
      if (!userClientIds.includes(id as string)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this client'
        });
      }
      
      // Update the client
      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update({
          name,
          description,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl,
          industry,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }
      
      // Transform response
      const transformedClient = {
        id: updatedClient.id,
        name: updatedClient.name,
        description: updatedClient.description || '',
        primaryColor: updatedClient.primary_color,
        secondaryColor: updatedClient.secondary_color,
        logoUrl: updatedClient.logo_url,
        industry: updatedClient.industry,
        created_at: updatedClient.created_at,
        updated_at: updatedClient.updated_at
      };
      
      return res.status(200).json({
        success: true,
        client: transformedClient,
        message: 'Client updated successfully'
      });
      
    } else if (req.method === 'DELETE') {
      // Delete a client (admin only)
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }
      
      // Check if user has access and is admin
      const userClientIds = await getUserClients(user.id);
      if (!userClientIds.includes(id as string)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this client'
        });
      }
      
      // Use service role for deletion
      const serviceSupabase = getServiceSupabase();
      
      // Delete client (cascading will handle related records)
      const { error } = await serviceSupabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        message: 'Client deleted successfully'
      });
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`
      });
    }
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
