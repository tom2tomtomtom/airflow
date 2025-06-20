import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { supabase } from '@/lib/supabase';
import { errorResponse } from '@/utils/api';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED'));
  }

  try {
    const { queueId, action } = req.query;

    if (!queueId || typeof queueId !== 'string') {
      return res.status(400).json(errorResponse('Queue ID is required', 'MISSING_QUEUE_ID'));
    }

    if (!action || typeof action !== 'string') {
      return res.status(400).json(errorResponse('Action is required', 'MISSING_ACTION'));
    }

    // Parse queue ID to get matrix_id and campaign_id
    const [matrixId, campaignId] = queueId.split('-');

    if (!matrixId || !campaignId) {
      return res.status(400).json(errorResponse('Invalid queue ID format', 'INVALID_QUEUE_ID'));
    }

    // Get executions for this queue
    const { data: executions, error: fetchError } = await supabase
      .from('executions')
      .select('id, status')
      .eq('matrix_id', matrixId)
      .eq('campaign_id', campaignId);

    if (fetchError) {
      console.error('Error fetching executions:', fetchError);
      return res.status(500).json(errorResponse('Failed to fetch executions', 'DATABASE_ERROR'));
    }

    if (!executions || executions.length === 0) {
      return res.status(404).json(errorResponse('No executions found for this queue', 'QUEUE_NOT_FOUND'));
    }

    let updateData: any = {};
    let statusFilter: string[] = [];

    switch (action) {
      case 'pause':
        updateData = { status: 'paused' };
        statusFilter = ['pending', 'processing'];
        break;
      case 'resume':
        updateData = { status: 'pending' };
        statusFilter = ['paused'];
        break;
      case 'stop':
        updateData = { status: 'cancelled' };
        statusFilter = ['pending', 'processing', 'paused'];
        break;
      case 'retry':
        updateData = { 
          status: 'pending',
          retry_count: supabase.raw('COALESCE(retry_count, 0) + 1'),
          error_message: null
        };
        statusFilter = ['failed'];
        break;
      default:
        return res.status(400).json(errorResponse('Invalid action', 'INVALID_ACTION'));
    }

    // Filter executions that can be affected by this action
    const targetExecutions = executions.filter(e => statusFilter.includes(e.status));

    if (targetExecutions.length === 0) {
      return res.status(400).json(errorResponse(
        `No executions in appropriate status for ${action}`, 
        'NO_APPLICABLE_EXECUTIONS'
      ));
    }

    // Update executions
    const executionIds = targetExecutions.map(e => e.id);
    const { error: updateError } = await supabase
      .from('executions')
      .update(updateData)
      .in('id', executionIds);

    if (updateError) {
      console.error('Error updating executions:', updateError);
      return res.status(500).json(errorResponse('Failed to update executions', 'UPDATE_ERROR'));
    }

    // Log the queue action
    await supabase
      .from('execution_logs')
      .insert({
        execution_id: null, // Queue-level action
        action: `queue_${action}`,
        details: {
          queue_id: queueId,
          matrix_id: matrixId,
          campaign_id: campaignId,
          affected_executions: executionIds.length,
          execution_ids: executionIds
        },
        created_at: new Date().toISOString()
      });

    res.status(200).json({
      success: true,
      message: `Queue ${action} completed successfully`,
      data: {
        queue_id: queueId,
        action,
        affected_executions: executionIds.length
      }
    });
  } catch (error) {
    console.error('Error in queue action API:', error);
    res.status(500).json(errorResponse('Internal server error', 'INTERNAL_ERROR'));
  }
}

export default withAuth(handler);
