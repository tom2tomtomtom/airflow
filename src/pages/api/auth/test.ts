import type { NextApiRequest, NextApiResponse } from 'next';

interface AuthTestResponse {
  success: boolean;
  mode: 'demo' | 'production';
  message: string;
  testCredentials?: {
    email: string;
    password: string;
  }[];
  availableEndpoints: string[];
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthTestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      mode: 'production',
      message: 'Method not allowed - use GET',
      availableEndpoints: []
    });
  }

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const response: AuthTestResponse = {
    success: true,
    mode: isDemoMode ? 'demo' : 'production',
    message: isDemoMode 
      ? 'Authentication is running in demo mode with mock credentials'
      : 'Authentication is running in production mode with Supabase',
    availableEndpoints: [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/auth/test'
    ]
  };

  if (isDemoMode) {
    response.testCredentials = [
      { email: 'test@airwave.com', password: 'testpass123' },
      { email: 'demo@airwave.com', password: 'demo123' }
    ];
  } else {
    response.message += '. Use real email/password or create new account via signup.';
  }

  return res.status(200).json(response);
}

export const config = {
  api: {
    externalResolver: true,
  },
};