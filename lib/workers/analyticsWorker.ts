import { Worker, Job } from 'bullmq';
import { connection } from '@/lib/queue/connection';
import { AnalyticsJobData } from '@/lib/queue/bullQueue';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Process analytics job
async function processAnalyticsJob(job: Job<AnalyticsJobData>) {
  const { event, userId, clientId, properties, timestamp } = job.data;
  
  try {
    console.log(`Processing analytics event: ${event}`);
    
    // Store event in database for internal analytics
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: event,
        user_id: userId,
        client_id: clientId,
        properties,
        timestamp,
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      throw error;
    }
    
    // Aggregate metrics based on event type
    switch (event) {
      case 'Asset Uploaded':
        await updateAssetMetrics(clientId, properties);
        break;
      
      case 'Render Completed':
        await updateRenderMetrics(clientId, properties);
        break;
      
      case 'Campaign Created':
        await updateCampaignMetrics(clientId, properties);
        break;
    }
    
    return {
      success: true,
      event,
      timestamp,
    };
  } catch (error) {
    console.error('Analytics processing failed:', error);
    throw error;
  }
}

// Update asset metrics
async function updateAssetMetrics(clientId?: string, properties?: any) {
  if (!clientId) return;
  
  const { error } = await supabase.rpc('increment_client_metric', {
    p_client_id: clientId,
    p_metric: 'total_assets',
    p_value: 1,
  });
  
  if (error) {
    console.error('Failed to update asset metrics:', error);
  }
}

// Update render metrics
async function updateRenderMetrics(clientId?: string, properties?: any) {
  if (!clientId || !properties) return;
  
  const metrics = {
    total_renders: 1,
    total_render_time: properties.duration_ms || 0,
    successful_renders: properties.success ? 1 : 0,
  };
  
  for (const [metric, value] of Object.entries(metrics)) {
    const { error } = await supabase.rpc('increment_client_metric', {
      p_client_id: clientId,
      p_metric: metric,
      p_value: value,
    });
    
    if (error) {
      console.error(`Failed to update ${metric}:`, error);
    }
  }
}

// Update campaign metrics
async function updateCampaignMetrics(clientId?: string, properties?: any) {
  if (!clientId) return;
  
  const { error } = await supabase.rpc('increment_client_metric', {
    p_client_id: clientId,
    p_metric: 'total_campaigns',
    p_value: 1,
  });
  
  if (error) {
    console.error('Failed to update campaign metrics:', error);
  }
}

// Create analytics worker
export const analyticsWorker = new Worker(
  'analytics',
  processAnalyticsJob,
  {
    connection,
    concurrency: parseInt(process.env.ANALYTICS_WORKER_CONCURRENCY || '10'),
    removeOnComplete: { count: 10000 },
    removeOnFail: { count: 5000 },
  }
);

// Worker event handlers
analyticsWorker.on('completed', (job) => {
  console.log(`Analytics job ${job.id} processed successfully`);
});

analyticsWorker.on('failed', (job, error) => {
  console.error(`Analytics job ${job?.id} failed:`, error);
  Sentry.captureException(error, {
    tags: {
      job_type: 'analytics',
      job_id: job?.id,
      event: job?.data.event,
    },
  });
});

analyticsWorker.on('error', (error) => {
  console.error('Analytics worker error:', error);
  Sentry.captureException(error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing analytics worker...');
  await analyticsWorker.close();
});
