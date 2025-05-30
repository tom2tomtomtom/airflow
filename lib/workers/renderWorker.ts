import { Worker, Job } from 'bullmq';
import { connection } from '@/lib/queue/connection';
import { RenderJobData } from '@/lib/queue/bullQueue';
import { sendRenderCompleteEmail } from '@/lib/email/resend';
import { S3Storage } from '@/lib/storage/s3Storage';
import { createClient } from '@supabase/supabase-js';
import { AppError, ExternalServiceError } from '@/lib/errors/errorHandler';
import * as Sentry from '@sentry/node';
import { broadcastRenderProgress, broadcastRenderComplete } from '@/pages/api/realtime/events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreatomateRenderResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
}

// Process render job
async function processRenderJob(job: Job<RenderJobData>) {
  const { executionId, matrixId, templateId, assets, userId, clientId, isPreview } = job.data;
  
  try {
    // Update job progress and broadcast
    await job.updateProgress(10);
    broadcastRenderProgress(executionId, 10, userId);
    
    // 1. Prepare render request for Creatomate
    const renderRequest = {
      template_id: templateId,
      modifications: assets,
      options: {
        quality: isPreview ? 'preview' : 'high',
        format: 'mp4',
      },
    };
    
    await job.updateProgress(20);
    broadcastRenderProgress(executionId, 20, userId);
    
    // 2. Submit to Creatomate API
    const creatomateResponse = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderRequest),
    });
    
    if (!creatomateResponse.ok) {
      const error = await creatomateResponse.text();
      throw new ExternalServiceError('Creatomate', new Error(error));
    }
    
    const renderData: CreatomateRenderResponse = await creatomateResponse.json();
    
    await job.updateProgress(30);
    broadcastRenderProgress(executionId, 30, userId);
    
    // 3. Poll for render completion
    let renderStatus = renderData.status;
    let renderUrl: string | undefined;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    
    while (renderStatus === 'pending' || renderStatus === 'processing') {
      if (attempts >= maxAttempts) {
        throw new Error('Render timeout: exceeded maximum wait time');
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.creatomate.com/v1/renders/${renderData.id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new ExternalServiceError('Creatomate', new Error('Failed to check render status'));
      }
      
      const statusData: CreatomateRenderResponse = await statusResponse.json();
      renderStatus = statusData.status;
      renderUrl = statusData.url;
      
      attempts++;
      const currentProgress = 30 + (attempts / maxAttempts) * 40;
      await job.updateProgress(currentProgress);
      broadcastRenderProgress(executionId, Math.round(currentProgress), userId);
    }
    
    if (renderStatus === 'failed') {
      throw new Error(`Render failed: ${renderData.error || 'Unknown error'}`);
    }
    
    if (!renderUrl) {
      throw new Error('Render completed but no URL provided');
    }
    
    await job.updateProgress(70);
    broadcastRenderProgress(executionId, 70, userId);
    
    // 4. Download and upload to S3
    const response = await fetch(renderUrl);
    if (!response.ok) {
      throw new Error('Failed to download rendered video');
    }
    
    const videoBuffer = Buffer.from(await response.arrayBuffer());
    const filename = `render-${executionId}-${Date.now()}.mp4`;
    
    const storage = new S3Storage(clientId);
    const uploadedFile = await storage.upload(videoBuffer, filename, {
      contentType: 'video/mp4',
      metadata: {
        executionId,
        matrixId,
        templateId,
        isPreview: isPreview ? 'true' : 'false',
      },
    });
    
    await job.updateProgress(85);
    broadcastRenderProgress(executionId, 85, userId);
    
    // 5. Update database with render result
    const { error: updateError } = await supabase
      .from('executions')
      .update({
        status: 'completed',
        output_url: uploadedFile.cdnUrl || uploadedFile.url,
        metadata: {
          ...job.data,
          renderId: renderData.id,
          renderUrl: uploadedFile.cdnUrl || uploadedFile.url,
          completedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);
    
    if (updateError) {
      throw new Error(`Failed to update execution: ${updateError.message}`);
    }
    
    await job.updateProgress(95);
    broadcastRenderProgress(executionId, 95, userId);
    
    // 6. Get user email for notification
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!userError && userData) {
      // Send completion email
      await sendRenderCompleteEmail({
        to: userData.email || '',
        campaignName: `Execution ${executionId}`,
        renderCount: 1,
        successCount: 1,
        failedCount: 0,
        downloadUrl: uploadedFile.cdnUrl || uploadedFile.url,
        completedAt: new Date().toISOString(),
      });
    }
    
    await job.updateProgress(100);
    broadcastRenderProgress(executionId, 100, userId);
    
    // Broadcast completion
    broadcastRenderComplete(executionId, renderData.id, renderUrl, userId);
    
    // Return result
    return {
      success: true,
      executionId,
      renderUrl: uploadedFile.cdnUrl || uploadedFile.url,
      renderId: renderData.id,
    };
    
  } catch (error) {
    // Update execution as failed
    await supabase
      .from('executions')
      .update({
        status: 'failed',
        metadata: {
          ...job.data,
          error: error instanceof Error ? error.message : 'Unknown error',
          failedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', executionId);
    
    // Re-throw for job retry logic
    throw error;
  }
}

// Create render worker
export const renderWorker = new Worker(
  'render',
  processRenderJob,
  {
    connection,
    concurrency: parseInt(process.env.RENDER_WORKER_CONCURRENCY || '3'),
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
);

// Worker event handlers
renderWorker.on('completed', (job) => {
  console.log(`Render job ${job.id} completed successfully`);
});

renderWorker.on('failed', (job, error) => {
  console.error(`Render job ${job?.id} failed:`, error);
  Sentry.captureException(error, {
    tags: {
      job_type: 'render',
      job_id: job?.id,
      execution_id: job?.data.executionId,
    },
  });
});

renderWorker.on('error', (error) => {
  console.error('Render worker error:', error);
  Sentry.captureException(error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing render worker...');
  await renderWorker.close();
});
