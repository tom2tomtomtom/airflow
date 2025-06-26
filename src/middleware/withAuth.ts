import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { errorResponse, ErrorCode } from '@/utils/api';
import { UserRole } from '@/types/auth';
import { loggers } from '@/lib/logger';
import { env } from '@/lib/env';

// User data structure
interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  clientIds: string[];
  tenantId: string;
}

// Extended request with user information
export interface AuthenticatedRequest extends NextApiRequest {
  user: AuthUser;
}

// Handler type with authenticated request
export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

// User profile from database
interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  permissions: string[];
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

// Create Supabase client for server-side authentication
function createAuthClient(req: NextApiRequest) {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return req.cookies[name];
      },
      set(name: string, value: string, options: CookieOptions) {
        // API routes don't need to set cookies
      },
      remove(name: string, options: CookieOptions) {
        // API routes don't need to remove cookies
      },
    },
  });
}

// Validate user authentication
async function validateAuthentication(req: NextApiRequest): Promise<{
  user: any;
  supabase: any;
} | null> {
  const supabase = createAuthClient(req);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      loggers.auth.warn('Authentication failed', {
        error: error?.message,
        hasUser: !!user,
      });
      return null;
    }

    return { user, supabase };
  } catch (error) {
    loggers.auth.error('Authentication validation error', error);
    return null;
  }
}

// Get user profile from database
async function getUserProfile(supabase: any, userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      loggers.auth.error('Error fetching user profile', error);
      return null;
    }

    return profile;
  } catch (error) {
    loggers.auth.error('Profile fetch exception', error);
    return null;
  }
}

// Get user's client access
async function getUserClientAccess(supabase: any, userId: string): Promise<string[]> {
  try {
    const { data: userClients, error } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', userId);

    if (error) {
      loggers.auth.error('Error fetching user clients', error);
      return [];
    }

    return userClients?.map((uc: { client_id: string }) => uc.client_id) || [];
  } catch (error) {
    loggers.auth.error('Client access fetch exception', error);
    return [];
  }
}

// Main authentication middleware
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Validate authentication
      const authResult = await validateAuthentication(req);
      if (!authResult) {
        return errorResponse(res, ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
      }

      const { user: authUser, supabase } = authResult;

      // Get user profile
      const profile = await getUserProfile(supabase, authUser.id);
      if (!profile) {
        loggers.auth.warn('User profile not found', { userId: authUser.id });
        return errorResponse(res, ErrorCode.UNAUTHORIZED, 'User profile not found', 401);
      }

      // Get user's client access
      const clientIds = await getUserClientAccess(supabase, authUser.id);

      // Build authenticated user object
      const user: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        role: profile.role,
        permissions: profile.permissions || [],
        clientIds,
        tenantId: profile.tenant_id || '',
      };

      // Add user to request
      (req as AuthenticatedRequest).user = user;

      loggers.auth.info('User authenticated successfully', {
        userId: user.id,
        role: user.role,
        clientCount: clientIds.length,
      });

      // Call the handler
      return await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      loggers.auth.error('Authentication middleware error', error);
      return errorResponse(
        res,
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Authentication service error',
        500
      );
    }
  };
}

// Middleware to require specific roles
export function withRoles(roles: UserRole | UserRole[]) {
  return (handler: AuthenticatedHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userRole = req.user.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        loggers.auth.warn('Insufficient role permissions', {
          userId: req.user.id,
          userRole,
          requiredRoles: allowedRoles,
        });
        return errorResponse(res, ErrorCode.FORBIDDEN, 'Insufficient permissions', 403);
      }

      return await handler(req, res);
    });
  };
}

// Middleware to require specific permissions
export function withPermissions(requiredPermissions: string | string[]) {
  return (handler: AuthenticatedHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userPermissions = req.user.permissions;
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasAllPermissions = permissions.every(
        permission => userPermissions.includes(permission) || userPermissions.includes('*')
      );

      if (!hasAllPermissions) {
        loggers.auth.warn('Insufficient permissions', {
          userId: req.user.id,
          userPermissions,
          requiredPermissions: permissions,
        });
        return errorResponse(res, ErrorCode.FORBIDDEN, 'Insufficient permissions', 403);
      }

      return await handler(req, res);
    });
  };
}

// Middleware to require client access
export function withClientAccess(clientIdParam: string = 'clientId') {
  return (handler: AuthenticatedHandler) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userRole = req.user.role;
      const userClientIds = req.user.clientIds;

      // Admin can access all clients
      if (userRole === UserRole.ADMIN) {
        return await handler(req, res);
      }

      // Get client ID from request
      const clientId =
        (req.query[clientIdParam] as string) ||
        (req.body[clientIdParam] as string) ||
        (req.headers['x-client-id'] as string);

      if (!clientId) {
        return errorResponse(res, ErrorCode.VALIDATION_ERROR, 'Client ID is required', 400);
      }

      // Check if user has access to the client
      if (!userClientIds.includes(clientId)) {
        loggers.auth.warn('Client access denied', {
          userId: req.user.id,
          requestedClientId: clientId,
          userClientIds,
        });
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
