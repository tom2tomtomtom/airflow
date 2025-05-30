import type { NextApiRequest, NextApiResponse } from 'next';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    token: string;
  };
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password }: LoginRequest = req.body;

  // Simple mock authentication for testing
  // In a real app, this would validate against a database
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required' 
    });
  }

  // Mock user credentials for testing
  const validCredentials = [
    { email: 'test@airwave.com', password: 'testpass123', name: 'Test User' },
    { email: 'demo@airwave.com', password: 'demo123', name: 'Demo User' },
  ];

  const user = validCredentials.find(
    cred => cred.email === email && cred.password === password
  );

  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid email or password' 
    });
  }

  // Generate mock token
  const token = 'mock-jwt-token-' + Date.now();

  res.status(200).json({
    success: true,
    user: {
      id: 'user-' + Date.now(),
      email: user.email,
      name: user.name,
      token,
    },
  });
}