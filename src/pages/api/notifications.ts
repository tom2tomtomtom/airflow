import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import { z } from 'zod';

const NotificationSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']),
  category: z.enum(['execution', 'approval', 'campaign', 'system', 'user']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  client_id: z.string().uuid(),
  action_url: z.string().url().optional(),
  action_label: z.string().max(50).optional(),
  target_user_ids: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.any()).optional(),
});

const NotificationUpdateSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const user = (req as any).user;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, user);
      case 'POST':
        return handleCreate(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Notifications API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  const { 
    client_id, 
    category, 
    read, 
    priority, 
    limit = '50', 
    offset = '0',
    search
  } = req.query;

  try {
    // Get user's accessible clients
    const { data: userClients } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id);
    
    if (!userClients || userClients.length === 0) {
      return res.json({ data: [], count: 0 });
    }

    const clientIds = userClients.map(uc => uc.client_id);

    let query = supabase
      .from('notifications')
      .select(`
        *,
        clients(id, name)
      `)
      .eq('user_id', user.id)
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (client_id && clientIds.includes(client_id as string)) {
      query = query.eq('client_id', client_id);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (read === 'true') {
      query = query.eq('read', true);
    } else if (read === 'false') {
      query = query.eq('read', false);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    // Get summary statistics
    const { data: summaryData } = await supabase
      .from('notifications')
      .select('category, priority, read')
      .eq('user_id', user.id)
      .in('client_id', clientIds);

    const summary = {
      total: summaryData?.length || 0,
      unread: summaryData?.filter(n => !n.read).length || 0,
      by_category: summaryData?.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      by_priority: summaryData?.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    return res.json({ 
      data: notifications || [],
      count: count || 0,
      summary
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error in handleGet:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function handleCreate(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  const validationResult = NotificationSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Invalid notification data',
      details: validationResult.error.issues
    });
  }

  const data = validationResult.data;

  try {
    // Verify user has access to the client
    const { data: clientAccess } = await supabase
      .from('user_clients')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('client_id', data.client_id)
      .single();

    if (!clientAccess) {
      return res.status(403).json({ error: 'Access denied to this client' });
    }

    // Determine target users
    let targetUserIds = data.target_user_ids || [];
    
    if (!data.target_user_ids || data.target_user_ids.length === 0) {
      // Send to all users with access to this client
      const { data: clientUsers } = await supabase
        .from('user_clients')
        .select('user_id')
        .eq('client_id', data.client_id);
      
      targetUserIds = clientUsers?.map(u => u.user_id) || [];
    }

    // Create notifications for each target user
    const notificationPromises = targetUserIds.map(async (targetUserId: string) => {
      const notificationData = {
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        priority: data.priority,
        client_id: data.client_id,
        user_id: targetUserId,
        action_url: data.action_url,
        action_label: data.action_label,
        metadata: data.metadata,
        read: false,
        archived: false,
        created_by: user.id,
      };

      return supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
    });

    const results = await Promise.all(notificationPromises);
    const successfulNotifications = results.filter(r => !r.error).map(r => r.data);

    // Trigger real-time updates
    await triggerRealTimeNotifications(successfulNotifications);

    return res.status(201).json({ 
      message: 'Notifications created successfully',
      data: successfulNotifications,
      count: successfulNotifications.length
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Failed to create notification' });
  }
}

// Helper function to trigger real-time notifications
async function triggerRealTimeNotifications(notifications: any[]): Promise<void> {
  try {
    // Import the SSE broadcast functions
    const { broadcastToUser, broadcastNotification } = await import('./realtime/events');
    
    notifications.forEach(notification => {
      // Broadcast to specific user
      broadcastToUser(notification.user_id, 'notification', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        action_url: notification.action_url,
        action_label: notification.action_label,
        timestamp: new Date(notification.created_at).getTime(),
      });
    });
  } catch (error) {
    console.error('Error triggering real-time notifications:', error);
  }
}

export default withAuth(withSecurityHeaders(handler));