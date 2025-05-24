import { NextApiRequest, NextApiResponse } from 'next';

// Mock client data with the structure expected by ClientContext
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check for demo mode or missing auth
  const authHeader = req.headers.authorization;
  const isDemo = !authHeader || authHeader.includes('demo-token') || authHeader.includes('mock_token');

  if (req.method === 'GET') {
    // Return all clients with the expected response structure
    res.status(200).json({ 
      success: true,
      clients: isDemo ? mockClients : [],
      message: isDemo ? 'Demo clients loaded' : 'No clients found'
    });
  } else if (req.method === 'POST') {
    // Create a new client
    const newClient = {
      ...req.body,
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    
    res.status(201).json({
      success: true,
      client: newClient,
      message: 'Client created successfully'
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }
}
