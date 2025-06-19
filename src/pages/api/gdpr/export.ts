import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/lib/errors/errorHandler';
import { withRateLimitedRoute } from '../../../../middleware/rateLimiter';
import { exportUserData } from '@/lib/gdpr/dataExport';
import { AuthorizationError } from '@/lib/errors/errorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get authenticated user
  const userId = (req as any).userId;
  if (!userId) {
    throw new AuthorizationError('Authentication required');
  }
  
  try {
    // Generate data export
    const exportJson = await exportUserData(userId);
    
    // Set headers for JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="airwave-data-export-${userId}-${Date.now()}.json"`
    );
    
    // Send the JSON file
    res.status(200).send(exportJson);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Data export failed:', error);
    throw error;
  }
}

export default withRateLimitedRoute(
  withErrorHandler(handler),
  'api', // Use standard API rate limit
  {
    customIdentifier: (req: any) => `gdpr_export_${(req as any).userId}`
  }
);
