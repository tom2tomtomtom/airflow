import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { withAuth } from '@/middleware/withAuth';

interface Platform {
  id: string;
  name: string;
  displayName: string;
  isConnected: boolean;
  accountName?: string;
  permissions?: string[];
  lastSync?: string;
  status: 'active' | 'expired' | 'error';
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = req.headers['x-user-id'] as string;
  const clientId = req.headers['x-client-id'] as string;

  try {
    if (req.method === 'GET') {
      // Get platform integrations for the client
      const { data: integrations, error } = await supabase
        .from('platform_integrations')
        .select('*')
        .eq('client_id', clientId || null)
        .eq('created_by', userId);

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // Define supported platforms
      const supportedPlatforms = [
        { id: 'facebook', name: 'facebook', displayName: 'Facebook' },
        { id: 'instagram', name: 'instagram', displayName: 'Instagram' },
        { id: 'twitter', name: 'twitter', displayName: 'Twitter/X' },
        { id: 'linkedin', name: 'linkedin', displayName: 'LinkedIn' },
        { id: 'tiktok', name: 'tiktok', displayName: 'TikTok' },
      ];

      const platforms: Platform[] = supportedPlatforms.map(platform => {
        const integration = integrations?.find(i => i.platform === platform.name);
        
        return {
          ...platform,
          isConnected: !!integration,
          accountName: integration?.account_name || undefined,
          permissions: integration?.permissions || [],
          lastSync: integration?.last_sync_at || undefined,
          status: integration?.status || 'active',
        };
      });

      return res.status(200).json({
        success: true,
        platforms,
      });
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Platforms API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);