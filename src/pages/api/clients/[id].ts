import type { NextApiRequest, NextApiResponse } from 'next';

type Client = {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  userId: string;
};

type ResponseData = {
  success: boolean;
  message?: string;
  client?: Client;
};

// Mock database for clients (same as in index.ts)
let mockClients: Client[] = [
  {
    id: 'client_1',
    name: 'Acme Corporation',
    description: 'A global leader in innovative solutions',
    primaryColor: '#3a86ff',
    secondaryColor: '#8338ec',
    userId: 'user_123',
  },
  {
    id: 'client_2',
    name: 'TechStart',
    description: 'Cutting-edge technology for startups',
    primaryColor: '#06d6a0',
    secondaryColor: '#ffbe0b',
    userId: 'user_123',
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Extract client ID from the URL
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, message: 'Invalid client ID' });
  }

  // Extract user ID from authorization header
  // In a real app, you would validate the token
  const userId = req.headers.authorization?.split(' ')[1] || 'user_123';

  // Find the client
  const clientIndex = mockClients.findIndex(c => c.id === id && c.userId === userId);
  
  if (clientIndex === -1) {
    return res.status(404).json({ success: false, message: 'Client not found' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClient(req, res, clientIndex);
    case 'PUT':
      return updateClient(req, res, clientIndex);
    case 'DELETE':
      return deleteClient(req, res, clientIndex);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// GET - Retrieve a specific client
function getClient(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  clientIndex: number
) {
  try {
    const client = mockClients[clientIndex];
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    return res.status(200).json({
      success: true,
      client: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// PUT - Update a client
function updateClient(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  clientIndex: number
) {
  try {
    const { name, description, primaryColor, secondaryColor, logoUrl } = req.body;
    
    const existingClient = mockClients[clientIndex];
    
    if (!existingClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Update client data
    const updatedClient = {
      ...existingClient,
      name: name || existingClient.name,
      description: description || existingClient.description,
      primaryColor: primaryColor || existingClient.primaryColor,
      secondaryColor: secondaryColor || existingClient.secondaryColor,
      logoUrl: logoUrl || existingClient.logoUrl,
    };

    // Update in mock database
    mockClients[clientIndex] = updatedClient;

    return res.status(200).json({
      success: true,
      client: updatedClient,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// DELETE - Remove a client
function deleteClient(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  clientIndex: number
) {
  try {
    // Remove from mock database
    const deletedClient = mockClients[clientIndex];
    
    if (!deletedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    mockClients = mockClients.filter((_, index) => index !== clientIndex);

    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
      client: deletedClient,
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}