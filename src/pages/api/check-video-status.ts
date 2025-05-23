import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import axios from 'axios';

const RUNWAY_API_URL = 'https://api.runwayml.com/v1';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { job_id, asset_id } = req.query;

  if (!job_id && !asset_id) {
    return res.status(400).json({
      success: false,
      message: 'Must provide either job_id or asset_id',
    });
  }

  try {
    let jobId = job_id as string;
    
    // If only asset_id provided, get job_id from asset metadata
    if (!jobId && asset_id) {
      const { data: asset, error } = await supabase
        .from('assets')
        .select('metadata')
        .eq('id', asset_id)
        .single();
        
      if (error || !asset?.metadata?.generation_job_id) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found or no generation job associated',
        });
      }
      
      jobId = asset.metadata.generation_job_id;
    }

    // Check job status from RunwayML
    const response = await axios.get(
      `${RUNWAY_API_URL}/generations/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${env.RUNWAY_API_KEY}`,
          'X-Runway-Version': '2024-01-01',
        },
      }
    );

    const job = response.data;
    
    // Get asset details if we have asset_id
    let asset = null;
    if (asset_id) {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('id', asset_id)
        .single();
      asset = data;
    }

    return res.status(200).json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress || 0,
        created_at: job.created_at,
        completed_at: job.completed_at,
        estimated_time_remaining: job.estimated_time_remaining,
        result: job.result,
        error: job.error,
      },
      asset,
      message: getStatusMessage(job.status, job.progress),
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to check video status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function getStatusMessage(status: string, progress?: number): string {
  switch (status) {
    case 'PENDING':
      return 'Your video is queued for generation...';
    case 'IN_PROGRESS':
      return `Generating your video... ${progress || 0}% complete`;
    case 'COMPLETED':
      return 'Your video is ready!';
    case 'FAILED':
      return 'Video generation failed. Please try again.';
    default:
      return 'Checking status...';
  }
}
