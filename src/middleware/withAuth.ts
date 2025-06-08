import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse, ErrorCode } from '@/utils/api';
import { UserRole } from '@/types/auth';
import { createServerClient } from '@supabase/ssr';

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
    // REMOVED: Temporary development bypass - auth is now restored
    
    try {
      // Create Supabase server client with proper cookie handling
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies[name];
            },
            set(name: string, value: string, options: any) {
              // We don't need to set cookies in API routes
            },
            remove(name: string, options: any) {
              // We don't need to remove cookies in API routes
            },
          },
        }
      );

      // Get user from Supabase using cookies
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.log('Supabase auth error:', error?.message || 'No user found');
        return errorResponse(
          res,
          ErrorCode.UNAUTHORIZED,
          'Authentication required',
          401
        );
      }

      console.log('Authenticated user:', user.id, user.email);

      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('Profile error:', profileError.message, 'Code:', profileError.code);
        // If profile doesn't exist, create a basic one or use defaults
        if (profileError.code === 'PGRST116') {
          console.log('Profile does not exist, creating one...');
          try {
            const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
            const nameParts = userName.split(' ');
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                first_name: nameParts[0] || userName,
                last_name: nameParts.slice(1).join(' ') || '',
                role: 'user',
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              // If profile creation fails, use a minimal profile for API access
              profile = {
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                role: 'user',
                permissions: [],
                tenant_id: null
              };
            } else {
              profile = newProfile;
            }
          } catch (err) {
            console.error('Profile creation exception:', err);
            // Use minimal profile as fallback
            profile = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              role: 'user',
              permissions: [],
              tenant_id: null
            };
          }
        } else {
          console.error('Unexpected profile error:', profileError);
          // Use minimal profile as fallback
          profile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'user',
            permissions: [],
            tenant_id: null
          };
        }
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
        role: (profile?.role as UserRole) || UserRole.VIEWER,
        permissions: profile?.permissions || [],
        clientIds: userClients?.map((uc: { client_id: string }) => uc.client_id) || [],
        tenantId: profile?.tenant_id || ''
      };

      // Call the handler
      return await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      const message = getErrorMessage(error);
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
