import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { supabase } from '@/lib/supabase';
import { errorResponse } from '@/utils/api';

interface ExecutionStats {
  total_executions: number;
  pending_executions: number;
  processing_executions: number;
  completed_executions: number;
  failed_executions: number;
  success_rate: number;
  average_completion_time: number;
  total_processing_time: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED'));
  }

  try {
    const { client_id } = req.query;

    if (!client_id || typeof client_id !== 'string') {
      return res.status(400).json(errorResponse('Client ID is required', 'MISSING_CLIENT_ID'));
    }

    // Get execution statistics
    const { data: executions, error: executionsError } = await supabase
      .from('executions')
      .select(`
        id,
        status,
        created_at,
        completed_at,
        matrices!inner(
          client_id
        )
      `)
      .eq('matrices.client_id', client_id);

    if (executionsError) {
      console.error('Error fetching executions:', executionsError);
      return res.status(500).json(errorResponse('Failed to fetch executions', 'DATABASE_ERROR'));
    }

    const totalExecutions = executions?.length || 0;
    const pendingExecutions = executions?.filter(e => e.status === 'pending').length || 0;
    const processingExecutions = executions?.filter(e => e.status === 'processing').length || 0;
    const completedExecutions = executions?.filter(e => e.status === 'completed').length || 0;
    const failedExecutions = executions?.filter(e => e.status === 'failed').length || 0;

    // Calculate success rate
    const finishedExecutions = completedExecutions + failedExecutions;
    const successRate = finishedExecutions > 0 ? completedExecutions / finishedExecutions : 0;

    // Calculate average completion time (in minutes)
    const completedWithTimes = executions?.filter(e => 
      e.status === 'completed' && e.created_at && e.completed_at
    ) || [];

    let averageCompletionTime = 0;
    let totalProcessingTime = 0;

    if (completedWithTimes.length > 0) {
      const completionTimes = completedWithTimes.map(e => {
        const created = new Date(e.created_at).getTime();
        const completed = new Date(e.completed_at).getTime();
        return (completed - created) / (1000 * 60); // Convert to minutes
      });

      totalProcessingTime = completionTimes.reduce((sum, time) => sum + time, 0);
      averageCompletionTime = totalProcessingTime / completionTimes.length;
    }

    const stats: ExecutionStats = {
      total_executions: totalExecutions,
      pending_executions: pendingExecutions,
      processing_executions: processingExecutions,
      completed_executions: completedExecutions,
      failed_executions: failedExecutions,
      success_rate: successRate,
      average_completion_time: averageCompletionTime,
      total_processing_time: totalProcessingTime,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in execution stats API:', error);
    res.status(500).json(errorResponse('Internal server error', 'INTERNAL_ERROR'));
  }
}

export default withAuth(handler);
