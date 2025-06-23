import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import { creatomateService } from '@/services/creatomate';

interface CreatomateApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatomateApiResponse>
): Promise<void> {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetTemplate(req, res);
      case 'POST':
        return await handleRenderVideo(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed' 
        });
    }
  } catch (error: any) {
    console.error('Creatomate API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGetTemplate(
  req: NextApiRequest,
  res: NextApiResponse<CreatomateApiResponse>
): Promise<void> {
  try {
    const { templateId } = req.query;
    const template = await creatomateService.getTemplate(templateId as string);
    
    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
}

async function handleRenderVideo(
  req: NextApiRequest,
  res: NextApiResponse<CreatomateApiResponse>
): Promise<void> {
  try {
    const { action, templateId, modifications } = req.body;

    if (!templateId || !modifications) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and modifications are required'
      });
    }

    if (action === 'render') {
      const renderResult = await creatomateService.renderVideo(modifications, templateId);
      return res.status(200).json({
        success: true,
        data: renderResult,
        message: 'Video render initiated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "render"'
      });
    }
  } catch (error: any) {
    console.error('Error rendering video:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to render video'
    });
  }
}

export default withSecurityHeaders(withAuth(handler));
