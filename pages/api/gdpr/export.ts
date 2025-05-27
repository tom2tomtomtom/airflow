import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/lib/errors/errorHandler';
import { withRateLimitedRoute } from '@/middleware/rateLimiter';
import { exportUserData } from '@/lib/gdpr/dataExport';
import { AuthorizationError } from '@/lib/errors/errorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const exportBlob = await exportUserData(userId);
    
    // Convert blob to buffer for response
    const buffer = Buffer.from(await exportBlob.arrayBuffer());
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="airwave-data-export-${userId}-${Date.now()}.zip"`
    );
    res.setHeader('Content-Length', buffer.length.toString());
    
    // Send the file
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Data export failed:', error);
    throw error;
  }
}

export default withRateLimitedRoute(
  withErrorHandler(handler),
  'api', // Use standard API rate limit
  { customIdentifier: (req) => `gdpr_export_${(req as any).userId}` }
);
