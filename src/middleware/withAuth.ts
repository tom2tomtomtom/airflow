import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse, ErrorCode } from '@/utils/api';
import { UserRole } from '@/types/auth';
import { supabase } from '@/lib/supabase';

// Extended request with user information
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
    clientIds: string[];
    tenantId: string;
  };
}

// Handler type with authenticated request
export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

// Middleware to require authentication
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(
          res,
          ErrorCode.UNAUTHORIZED,
          'Authorization header missing or invalid',
          401
        );
      }

      // Extract token
      const token = authHeader.split(' ')[1];

      // Verify token with Supabase
      try {
        // Get user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
          return errorResponse(
            res,
            ErrorCode.INVALID_TOKEN,
            'Invalid token',
            401
          );
        }

        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          return errorResponse(
            res,
            ErrorCode.NOT_FOUND,
            'User profile not found',
            404
          );
        }

        // Get user's client access
        const { data: userClients, error: clientsError } = await supabase
          .from('user_clients')
          .select('client_id')
          .eq('user_id', user.id);

        if (clientsError) {
          console.error('Error fetching user clients:', clientsError);
        }

        // Add user info to request
        (req as AuthenticatedRequest).user = {
          id: user.id,
          email: user.email || '',
          role: (profile.role as UserRole) || UserRole.VIEWER,
          permissions: profile.permissions || [],
          clientIds: userClients?.map(uc => uc.client_id) || [],
          tenantId: profile.tenant_id || ''
        };

        // Call the handler
        return await handler(req as AuthenticatedRequest, res);
      } catch (error) {
        console.error('Token verification error:', error);
        return errorResponse(
          res,
          ErrorCode.INVALID_TOKEN,
          'Invalid token',
          401
        );
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return errorResponse(
        res,
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Internal server error',
        500
      );
    }
  };
}

// Middleware to require specific roles
export function withRoles(roles: UserRole | UserRole[]) {
  return (handler: AuthenticatedHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userRole = req.user?.role;

      if (!userRole) {
        return errorResponse(
          res,
          ErrorCode.UNAUTHORIZED,
          'User not authenticated',
          401
        );
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        return errorResponse(
          res,
          ErrorCode.FORBIDDEN,
          'Insufficient permissions',
          403
        );
      }

      return await handler(req, res);
    });
  };
}

// Middleware to require specific permissions
export function withPermissions(requiredPermissions: string | string[]) {
  return (handler: AuthenticatedHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userPermissions = req.user?.permissions || [];

      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasAllPermissions = permissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return errorResponse(
          res,
          ErrorCode.FORBIDDEN,
          'Insufficient permissions',
          403
        );
      }

      return await handler(req, res);
    });
  };
}

// Middleware to require client access
export function withClientAccess(clientIdParam: string = 'clientId') {
  return (handler: AuthenticatedHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userRole = req.user?.role;
      const userClientIds = req.user?.clientIds || [];

      // Admin can access all clients
      if (userRole === UserRole.ADMIN) {
        return await handler(req, res);
      }

      // Get client ID from request
      const clientId = req.query[clientIdParam] as string ||
                      req.body[clientIdParam] as string;

      if (!clientId) {
        return errorResponse(
          res,
          ErrorCode.VALIDATION_ERROR,
          'Client ID is required',
          400
        );
      }

      // Check if user has access to the client
      if (!userClientIds.includes(clientId)) {
        return errorResponse(
          res,
          ErrorCode.FORBIDDEN,
          'You do not have access to this client',
          403
        );
      }

      return await handler(req, res);
    });
  };
}
