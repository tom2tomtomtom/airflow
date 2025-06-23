import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { creatomateService } from '@/services/creatomate';

interface RenderStatusResponse {
  success: boolean;
  data?: any;
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RenderStatusResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { renderId } = req.query;

    if (!renderId || typeof renderId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Render ID is required'
      });
    }

    const renderStatus = await creatomateService.getRenderStatus(renderId);
    
    return res.status(200).json({
      success: true,
      data: renderStatus
    });

  } catch (error: any) {
    console.error('Error getting render status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get render status'
    });
  }
}

export default withAuth(handler);
