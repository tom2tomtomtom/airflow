import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check for demo mode or missing auth
  const authHeader = req.headers.authorization;

  if (req.method === 'GET') {
    // Get a single client
    res.status(200).json({
      success: true,
      client: {
        id: id as string,
        name: 'Demo Client',
        description: 'Demo client for testing',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        logoUrl: '',
      },
    });
  } else if (req.method === 'PUT') {
    // Update a client
    const updatedClient = {
      id: id as string,
      ...req.body,
    };
    
    res.status(200).json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully',
    });
  } else if (req.method === 'DELETE') {
    // Delete a client
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
