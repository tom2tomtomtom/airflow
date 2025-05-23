import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    token?: string;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    // In a real app, you would create a user in the database
    // For this demo, we'll just return a success response
    
    // Generate a mock user
    const user = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      email,
      name,
      token: 'mock_token_' + Math.random().toString(36).substring(2, 15),
    };

    // Return success response with user data
    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
