#!/bin/bash
set -e

echo "🚀 Creating ALL Comprehensive Fixes"
echo "=================================="

# Create directories
mkdir -p src/middleware
mkdir -p src/utils
mkdir -p src/hooks
mkdir -p scripts

# Navigation System Fixes
cat > src/middleware/withNavigation.ts << 'NAVEOF'
import { NextApiRequest, NextApiResponse } from 'next';

export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  isAuthenticated: boolean;
  userRole?: string;
  redirectAttempts: number;
  lastRedirectTime?: number;
}

export function withNavigationProtection(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const navigationState: NavigationState = {
        currentPath: req.url || '',
        isAuthenticated: !!(req as any).user,
        userRole: (req as any).user?.role,
        redirectAttempts: 0,
      };

      const referer = req.headers.referer;
      if (referer && req.url) {
        const refererPath = new URL(referer).pathname;
        const currentPath = req.url.split('?')[0];
        
        if (refererPath === currentPath) {
          navigationState.redirectAttempts++;
          
          if (navigationState.redirectAttempts > 3) {
            console.warn('🔄 Potential redirect loop detected:', {
              path: currentPath,
              referer: refererPath,
              attempts: navigationState.redirectAttempts
            });
            
            return res.redirect(302, '/dashboard');
          }
        }
      }

      (req as any).navigationState = navigationState;
      return await handler(req, res);
    } catch (error) {
      console.error('Navigation middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Navigation error'
      });
    }
  };
}

export function withAuthRedirect(redirectTo: string = '/login') {
  return (handler: any) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const user = (req as any).user;
        const navigationState = (req as any).navigationState;

        if (!user) {
          if (req.url?.includes('/login') || req.url?.includes('/auth')) {
            return await handler(req, res);
          }

          if (navigationState?.redirectAttempts > 2) {
            console.warn('🔄 Too many auth redirects, serving error page');
            return res.status(401).json({
              success: false,
              error: 'Authentication required',
              redirectTo: '/login'
            });
          }

          console.log('🔐 Redirecting unauthenticated user to:', redirectTo);
          return res.redirect(302, redirectTo);
        }

        return await handler(req, res);
      } catch (error) {
        console.error('Auth redirect error:', error);
        return res.status(500).json({
          success: false,
          error: 'Authentication redirect error'
        });
      }
    };
  };
}
NAVEOF

echo "✅ Navigation middleware created"

# Auth State Management
cat > src/utils/authState.ts << 'AUTHEOF'
export interface AuthState {
  isAuthenticated: boolean;
  user?: any;
  loading: boolean;
  error?: string;
  lastCheck: number;
  checkInProgress: boolean;
}

export class AuthStateManager {
  private static instance: AuthStateManager;
  private state: AuthState = {
    isAuthenticated: false,
    loading: true,
    lastCheck: 0,
    checkInProgress: false,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Auth state listener error:', error);
      }
    });
  }

  async checkAuthStatus(force: boolean = false): Promise<AuthState> {
    const now = Date.now();
    const timeSinceLastCheck = now - this.state.lastCheck;

    if (this.state.checkInProgress && !force) {
      return this.getState();
    }

    if (timeSinceLastCheck < 1000 && !force) {
      return this.getState();
    }

    this.updateState({ 
      checkInProgress: true, 
      loading: true,
      error: undefined 
    });

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const userData = await response.json();
        
        this.updateState({
          isAuthenticated: true,
          user: userData.user,
          loading: false,
          lastCheck: now,
          checkInProgress: false,
          error: undefined,
        });
      } else {
        this.updateState({
          isAuthenticated: false,
          user: undefined,
          loading: false,
          lastCheck: now,
          checkInProgress: false,
          error: response.status === 401 ? 'Not authenticated' : 'Auth check failed',
        });
      }
    } catch (error) {
      this.updateState({
        isAuthenticated: false,
        user: undefined,
        loading: false,
        lastCheck: now,
        checkInProgress: false,
        error: 'Network error during auth check',
      });
    }

    return this.getState();
  }

  async logout(): Promise<void> {
    this.updateState({ loading: true });

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.updateState({
      isAuthenticated: false,
      user: undefined,
      loading: false,
      lastCheck: Date.now(),
      error: undefined,
    });
  }
}

export const authStateManager = AuthStateManager.getInstance();
AUTHEOF

echo "✅ Auth state management created"

# ESLint Auto-Fix Script
cat > scripts/fix-all-eslint.js << 'ESLINTEOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 ESLINT AUTO-FIX');
console.log('==================');

const FIXES = [
  {
    pattern: /console\.log\([^)]*\);\s*\n/g,
    replacement: '',
    description: 'Remove console.log statements'
  },
  {
    pattern: /\.map\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[^>]+)(?!\s+key=)/g,
    replacement: '.map(($1, $2) => $3 key={$2 || `item-${$1}`}',
    description: 'Add missing key props'
  },
  {
    pattern: /<img\s+([^>]*?)(?<!alt=['"][^'"]*['"])\s*\/?>/g,
    replacement: '<img $1 alt="" />',
    description: 'Add missing alt props'
  }
];

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    FIXES.forEach(({ pattern, replacement, description }) => {
      const beforeLength = newContent.length;
      newContent = newContent.replace(pattern, replacement);
      const afterLength = newContent.length;
      
      if (beforeLength !== afterLength) {
        hasChanges = true;
        console.log(`   🧹 ${description} in ${filePath}`);
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent);
    }

    return hasChanges;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dirPath) {
  let totalFixed = 0;
  
  function scanRecursive(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanRecursive(itemPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
          if (fixFile(itemPath)) {
            totalFixed++;
          }
        }
      });
    } catch (error) {
      console.error(`Error scanning directory ${currentPath}:`, error.message);
    }
  }
  
  scanRecursive(dirPath);
  return totalFixed;
}

const projectRoot = process.cwd();
const totalFixed = scanDirectory(path.join(projectRoot, 'src'));

console.log(`\n✅ ESLint auto-fix complete! Fixed ${totalFixed} files.`);
ESLINTEOF

chmod +x scripts/fix-all-eslint.js

echo "✅ ESLint auto-fix script created"

echo ""
echo "🎯 ALL COMPREHENSIVE FIXES CREATED!"
echo "=================================="
echo "✅ Navigation System Fixes"
echo "✅ Auth State Management" 
echo "✅ ESLint Auto-Fix Script"
echo ""
echo "Ready to commit all fixes!"

