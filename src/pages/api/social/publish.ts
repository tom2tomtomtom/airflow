import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { withAuth } from '@/middleware/withAuth';

interface PublishRequest {
  platforms: string[];
  content: {
    text?: string;
    images?: string[];
    video?: string;
    link?: string;
  };
  scheduledAt?: string;
}

interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

async function publishToFacebook(accessToken: string, content: any): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('message', content.text || '');
    formData.append('access_token', accessToken);

    if (content.link) {
      formData.append('link', content.link);
    }

    const response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error?.message || 'Facebook API error' };
    }

    return { success: true, postId: result.id };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

async function publishToTwitter(accessToken: string, content: any): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content.text || '',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.detail || 'Twitter API error' };
    }

    return { success: true, postId: result.data?.id };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

async function publishToLinkedIn(accessToken: string, content: any): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: 'urn:li:person:PERSON_ID', // Would need to get actual person ID
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text || '',
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'LinkedIn API error' };
    }

    return { success: true, postId: result.id };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

async function publishToPlatform(platform: string, accessToken: string, content: any): Promise<PublishResult> {
  let result: { success: boolean; postId?: string; error?: string };

  switch (platform) {
    case 'facebook':
      result = await publishToFacebook(accessToken, content);
      break;
    case 'twitter':
      result = await publishToTwitter(accessToken, content);
      break;
    case 'linkedin':
      result = await publishToLinkedIn(accessToken, content);
      break;
    default:
      result = { success: false, error: 'Unsupported platform' };
  }

  return {
    platform,
    success: result.success,
    postId: result.postId,
    error: result.error,
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = req.headers['x-user-id'] as string;
  const clientId = req.headers['x-client-id'] as string;

  try {
    if (req.method === 'POST') {
      const { platforms, content, scheduledAt }: PublishRequest = req.body;

      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({ success: false, error: 'No platforms specified' });
      }

      if (!content || !content.text) {
        return res.status(400).json({ success: false, error: 'No content provided' });
      }

      // If scheduled, we would queue this for later processing
      if (scheduledAt) {
        // TODO: Implement scheduling logic
        return res.status(501).json({ success: false, error: 'Scheduling not yet implemented' });
      }

      // Get platform integrations
      const { data: integrations, error: integrationsError } = await supabase
        .from('platform_integrations')
        .select('*')
        .eq('client_id', clientId || null)
        .eq('created_by', userId)
        .in('platform', platforms);

      if (integrationsError) {
        return res.status(500).json({ success: false, error: integrationsError.message });
      }

      const results: PublishResult[] = [];

      // Publish to each platform
      for (const platform of platforms) {
        const integration = integrations?.find(i => i.platform === platform);
        
        if (!integration || !integration.access_token) {
          results.push({
            platform,
            success: false,
            error: 'Platform not connected or token missing',
          });
          continue;
        }

        const result = await publishToPlatform(platform, integration.access_token, content);
        results.push(result);
      }

      // Log the publish attempt
      await supabase
        .from('campaign_analytics')
        .insert({
          platform: 'multi',
          date: new Date().toISOString().split('T')[0],
          client_id: clientId,
          raw_data: {
            publish_attempt: {
              platforms,
              content,
              results,
              timestamp: new Date().toISOString(),
            },
          },
        });

      return res.status(200).json({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        },
      });
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Publish API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);