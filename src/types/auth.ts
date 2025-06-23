export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  CLIENT = 'client'
}

export interface UserPermission {
  id: string;,
    name: string;,
    description: string;,
    scope: 'global' | 'client' | 'campaign' | 'asset';
}

// Define specific metadata interface
export interface UserMetadata {
  lastLoginDevice?: string;
  browserInfo?: string;
  ipAddress?: string;
  customFields?: Record<string, string | number | boolean>;
  [key: string]: string | number | boolean | undefined | Record<string, string | number | boolean>;
}

export interface User {
  id: string;,
    email: string;,
    name: string;,
    role: UserRole;,
    permissions: string[]; // IDs of permissions,
    clientIds: string[]; // IDs of clients user has access to,
    dateCreated: string;,
    lastLogin: string;,
    isActive: boolean;,
    preferences: UserPreferences;,
    metadata: UserMetadata;,
    tenantId: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';,
    notifications: {},
    email: boolean;,
    inApp: boolean;,
    approvals: boolean;,
    comments: boolean;,
    exports: boolean;
  };
  defaultClient?: string;
}

export interface AuthTokens {
  accessToken: string;,
    refreshToken: string;,
    expiresIn: number;
}

export interface LoginCredentials {
  email: string;,
    password: string;
}

export interface SignupData extends LoginCredentials {
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;,
    isAuthenticated: boolean;,
    loading: boolean;,
    error: string | null;,
    tokens: AuthTokens | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;,
    signup: (data: SignupData) => Promise<void>;,
    logout: () => void;,
    refreshToken: () => Promise<void>;,
    hasPermission: (permission: string) => boolean;,
    hasRole: (role: UserRole | UserRole[]) => boolean;,
    setError: (error: string | null) => void;
}

export interface JwtPayload {
  sub: string; // user ID,
    email: string;,
    role: UserRole;,
    permissions: string[];,
    clientIds: string[];,
    tenantId: string;,
    iat: number; // issued at,
    exp: number; // expiration time
}
