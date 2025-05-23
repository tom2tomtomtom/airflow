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
  clients?: Client[];
  client?: Client;
};

// Mock database for clients
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
  // Extract user ID from authorization header or query
  // In a real app, you would validate the token
  const userId = req.headers.authorization?.split(' ')[1] || 'user_123';

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClients(req, res, userId);
    case 'POST':
      return createClient(req, res, userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// GET - Retrieve all clients for a user
function getClients(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
  try {
    // Filter clients by user ID
    const userClients = mockClients.filter(client => client.userId === userId);
    
    return res.status(200).json({
      success: true,
      clients: userClients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// POST - Create a new client
function createClient(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
  try {
    const { name, description, primaryColor, secondaryColor, logoUrl } = req.body;

    // Basic validation
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }

    // Create new client
    const newClient: Client = {
      id: 'client_' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      primaryColor: primaryColor || '#3a86ff',
      secondaryColor: secondaryColor || '#8338ec',
      logoUrl,
      userId,
    };

    // Add to mock database
    mockClients.push(newClient);

    return res.status(201).json({
      success: true,
      client: newClient,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
