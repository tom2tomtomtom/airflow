/**
 * Authentication helper for AIrWAVE testing
 * Handles login, role switching, and authentication state management
 */

import { Page, Browser, BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'user' | 'client';
  name: string;
  permissions: string[];
}

export class AuthHelper {
  private page: Page;
  private testUsers: TestUser[];

  constructor(page: Page) {
    this.page = page;
    this.testUsers = [
      {
        email: 'admin@airwave-test.com',
        password: 'TestPass123!',
        role: 'admin',
        name: 'Test Admin',
        permissions: ['all']
      },
      {
        email: 'user@airwave-test.com',
        password: 'TestPass123!',
        role: 'user',
        name: 'Test User',
        permissions: ['read', 'write']
      },
      {
        email: 'client@airwave-test.com',
        password: 'TestPass123!',
        role: 'client',
        name: 'Test Client',
        permissions: ['approve', 'review']
      }
    ];
  }

  async setupTestUsers() {
    console.log('👥 Setting up test users...');
    
    for (const user of this.testUsers) {
      try {
        await this.createTestUser(user);
        console.log(`✅ Created test user: ${user.email}`);
      } catch (error) {
        console.log(`⚠️ User ${user.email} may already exist: ${error.message}`);
      }
    }
  }

  async createTestUser(user: TestUser) {
    // Navigate to signup page
    await this.page.goto('/signup');
    await this.page.waitForLoadState('networkidle');

    // Fill signup form
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.fill('[data-testid="name-input"]', user.name);
    
    // Submit form
    await this.page.click('[data-testid="signup-button"]');
    
    // Wait for success or handle existing user
    try {
      await this.page.waitForURL('/dashboard', { timeout: 10000 });
      console.log(`User ${user.email} created and logged in`);
      await this.logout();
    } catch (error) {
      // User might already exist, try logging in
      await this.page.goto('/login');
      await this.login(user.email, user.password);
      await this.logout();
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('http://localhost:3000/login');
    await this.page.waitForLoadState('networkidle');

    // Fill login form
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    
    // Submit form
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await this.page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Verify login success
    await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
  }

  async logout(): Promise<void> {
    try {
      // Click user menu
      await this.page.click('[data-testid="user-menu"]');
      
      // Click logout
      await this.page.click('[data-testid="logout-button"]');
      
      // Wait for redirect to login
      await this.page.waitForURL('/login', { timeout: 10000 });
    } catch (error) {
      console.warn('Logout may have failed, clearing storage:', error.message);
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await this.page.goto('/login');
    }
  }

  async loginAs(role: 'admin' | 'user' | 'client'): Promise<void> {
    const user = this.testUsers.find(u => u.role === role);
    if (!user) {
      throw new Error(`No test user found for role: ${role}`);
    }
    
    await this.login(user.email, user.password);
  }

  async saveAuthStates(): Promise<void> {
    const authDir = '.auth';
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    for (const user of this.testUsers) {
      try {
        await this.login(user.email, user.password);
        
        // Save storage state
        const context = this.page.context();
        await context.storageState({ 
          path: path.join(authDir, `${user.role}.json`) 
        });
        
        console.log(`💾 Saved auth state for ${user.role}`);
        await this.logout();
      } catch (error) {
        console.error(`Failed to save auth state for ${user.role}:`, error);
      }
    }
  }

  static getAuthState(role: 'admin' | 'user' | 'client'): string {
    return path.join('.auth', `${role}.json`);
  }

  async switchToRole(role: 'admin' | 'user' | 'client'): Promise<void> {
    await this.logout();
    await this.loginAs(role);
  }

  async ensureAuthenticated(): Promise<void> {
    try {
      // Check if we're already logged in
      await this.page.goto('/dashboard');
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
      console.log('Already authenticated');
    } catch (error) {
      // Not authenticated, login as default user
      console.log('Not authenticated, logging in as test user');
      await this.loginAs('user');
    }
  }

  async verifyAuthenticationStatus(): Promise<boolean> {
    try {
      await this.page.goto('/dashboard');
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForSessionExpiry(): Promise<void> {
    // Simulate session expiry by waiting and checking for redirect
    await this.page.waitForTimeout(60000); // Wait 1 minute
    
    // Try to navigate to protected page
    await this.page.goto('/dashboard');
    
    // Should redirect to login
    await this.page.waitForURL('/login', { timeout: 10000 });
  }

  async testConcurrentSessions(): Promise<void> {
    // Test maximum concurrent session limit
    const contexts: BrowserContext[] = [];
    
    try {
      const browser = this.page.context().browser()!;
      
      // Create multiple contexts and login
      for (let i = 0; i < 6; i++) { // More than the 5 session limit
        const context = await browser.newContext();
        const page = await context.newPage();
        const authHelper = new AuthHelper(page);
        
        try {
          await authHelper.loginAs('user');
          contexts.push(context);
        } catch (error) {
          console.log(`Session ${i + 1} rejected (expected for session limit)`);
        }
      }
    } finally {
      // Cleanup contexts
      for (const context of contexts) {
        await context.close();
      }
    }
  }
}