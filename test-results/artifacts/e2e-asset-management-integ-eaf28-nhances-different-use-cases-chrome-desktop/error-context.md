# Test info

- Name: Asset Management - Integrated Testing >> View Modes and Organization >> view mode switching enhances different use cases
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/asset-management-integrated.spec.ts:440:9

# Error details

```
Error: page.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
Call log:
  - waiting for locator('[data-testid="email-input"]')
    - locator resolved to <div data-testid="email-input" class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root mui-style-dzmwfx-MuiFormControl-root-MuiTextField-root">…</div>
    - fill("user@airwave-test.com")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

    at AuthHelper.login (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/utils/auth-helper.ts:93:21)
    at AuthHelper.loginAs (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/utils/auth-helper.ts:132:5)
    at AuthHelper.ensureAuthenticated (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/utils/auth-helper.ts:177:7)
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/asset-management-integrated.spec.ts:30:5
```

# Page snapshot

```yaml
- heading "AIrFLOW" [level=1]
- heading "AI-Powered Digital Asset Production" [level=6]
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Toggle password visibility"
- checkbox "Remember me"
- text: Remember me
- button "Sign In"
- paragraph:
  - link "Forgot your password?":
    - /url: /forgot-password
- paragraph:
  - text: Don't have an account?
  - link "Sign up":
    - /url: /signup
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | /**
   2 |  * Authentication helper for AIrWAVE testing
   3 |  * Handles login, role switching, and authentication state management
   4 |  */
   5 |
   6 | import { Page, Browser, BrowserContext } from '@playwright/test';
   7 | import fs from 'fs';
   8 | import path from 'path';
   9 |
   10 | export interface TestUser {
   11 |   email: string;
   12 |   password: string;
   13 |   role: 'admin' | 'user' | 'client';
   14 |   name: string;
   15 |   permissions: string[];
   16 | }
   17 |
   18 | export class AuthHelper {
   19 |   private page: Page;
   20 |   private testUsers: TestUser[];
   21 |
   22 |   constructor(page: Page) {
   23 |     this.page = page;
   24 |     this.testUsers = [
   25 |       {
   26 |         email: 'admin@airwave-test.com',
   27 |         password: 'TestPass123!',
   28 |         role: 'admin',
   29 |         name: 'Test Admin',
   30 |         permissions: ['all']
   31 |       },
   32 |       {
   33 |         email: 'user@airwave-test.com',
   34 |         password: 'TestPass123!',
   35 |         role: 'user',
   36 |         name: 'Test User',
   37 |         permissions: ['read', 'write']
   38 |       },
   39 |       {
   40 |         email: 'client@airwave-test.com',
   41 |         password: 'TestPass123!',
   42 |         role: 'client',
   43 |         name: 'Test Client',
   44 |         permissions: ['approve', 'review']
   45 |       }
   46 |     ];
   47 |   }
   48 |
   49 |   async setupTestUsers() {
   50 |     console.log('👥 Setting up test users...');
   51 |     
   52 |     for (const user of this.testUsers) {
   53 |       try {
   54 |         await this.createTestUser(user);
   55 |         console.log(`✅ Created test user: ${user.email}`);
   56 |       } catch (error) {
   57 |         console.log(`⚠️ User ${user.email} may already exist: ${error.message}`);
   58 |       }
   59 |     }
   60 |   }
   61 |
   62 |   async createTestUser(user: TestUser) {
   63 |     // Navigate to signup page
   64 |     await this.page.goto('/signup');
   65 |     await this.page.waitForLoadState('networkidle');
   66 |
   67 |     // Fill signup form
   68 |     await this.page.fill('[data-testid="email-input"]', user.email);
   69 |     await this.page.fill('[data-testid="password-input"]', user.password);
   70 |     await this.page.fill('[data-testid="name-input"]', user.name);
   71 |     
   72 |     // Submit form
   73 |     await this.page.click('[data-testid="signup-button"]');
   74 |     
   75 |     // Wait for success or handle existing user
   76 |     try {
   77 |       await this.page.waitForURL('/dashboard', { timeout: 10000 });
   78 |       console.log(`User ${user.email} created and logged in`);
   79 |       await this.logout();
   80 |     } catch (error) {
   81 |       // User might already exist, try logging in
   82 |       await this.page.goto('/login');
   83 |       await this.login(user.email, user.password);
   84 |       await this.logout();
   85 |     }
   86 |   }
   87 |
   88 |   async login(email: string, password: string): Promise<void> {
   89 |     await this.page.goto('/login');
   90 |     await this.page.waitForLoadState('networkidle');
   91 |
   92 |     // Fill login form
>  93 |     await this.page.fill('[data-testid="email-input"]', email);
      |                     ^ Error: page.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
   94 |     await this.page.fill('[data-testid="password-input"]', password);
   95 |     
   96 |     // Submit form
   97 |     await this.page.click('[data-testid="login-button"]');
   98 |     
   99 |     // Wait for successful login
  100 |     await this.page.waitForURL('/dashboard', { timeout: 15000 });
  101 |     
  102 |     // Verify login success
  103 |     await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
  104 |   }
  105 |
  106 |   async logout(): Promise<void> {
  107 |     try {
  108 |       // Click user menu
  109 |       await this.page.click('[data-testid="user-menu"]');
  110 |       
  111 |       // Click logout
  112 |       await this.page.click('[data-testid="logout-button"]');
  113 |       
  114 |       // Wait for redirect to login
  115 |       await this.page.waitForURL('/login', { timeout: 10000 });
  116 |     } catch (error) {
  117 |       console.warn('Logout may have failed, clearing storage:', error.message);
  118 |       await this.page.evaluate(() => {
  119 |         localStorage.clear();
  120 |         sessionStorage.clear();
  121 |       });
  122 |       await this.page.goto('/login');
  123 |     }
  124 |   }
  125 |
  126 |   async loginAs(role: 'admin' | 'user' | 'client'): Promise<void> {
  127 |     const user = this.testUsers.find(u => u.role === role);
  128 |     if (!user) {
  129 |       throw new Error(`No test user found for role: ${role}`);
  130 |     }
  131 |     
  132 |     await this.login(user.email, user.password);
  133 |   }
  134 |
  135 |   async saveAuthStates(): Promise<void> {
  136 |     const authDir = '.auth';
  137 |     if (!fs.existsSync(authDir)) {
  138 |       fs.mkdirSync(authDir, { recursive: true });
  139 |     }
  140 |
  141 |     for (const user of this.testUsers) {
  142 |       try {
  143 |         await this.login(user.email, user.password);
  144 |         
  145 |         // Save storage state
  146 |         const context = this.page.context();
  147 |         await context.storageState({ 
  148 |           path: path.join(authDir, `${user.role}.json`) 
  149 |         });
  150 |         
  151 |         console.log(`💾 Saved auth state for ${user.role}`);
  152 |         await this.logout();
  153 |       } catch (error) {
  154 |         console.error(`Failed to save auth state for ${user.role}:`, error);
  155 |       }
  156 |     }
  157 |   }
  158 |
  159 |   static getAuthState(role: 'admin' | 'user' | 'client'): string {
  160 |     return path.join('.auth', `${role}.json`);
  161 |   }
  162 |
  163 |   async switchToRole(role: 'admin' | 'user' | 'client'): Promise<void> {
  164 |     await this.logout();
  165 |     await this.loginAs(role);
  166 |   }
  167 |
  168 |   async ensureAuthenticated(): Promise<void> {
  169 |     try {
  170 |       // Check if we're already logged in
  171 |       await this.page.goto('/dashboard');
  172 |       await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
  173 |       console.log('Already authenticated');
  174 |     } catch (error) {
  175 |       // Not authenticated, login as default user
  176 |       console.log('Not authenticated, logging in as test user');
  177 |       await this.loginAs('user');
  178 |     }
  179 |   }
  180 |
  181 |   async verifyAuthenticationStatus(): Promise<boolean> {
  182 |     try {
  183 |       await this.page.goto('/dashboard');
  184 |       await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
  185 |       return true;
  186 |     } catch (error) {
  187 |       return false;
  188 |     }
  189 |   }
  190 |
  191 |   async waitForSessionExpiry(): Promise<void> {
  192 |     // Simulate session expiry by waiting and checking for redirect
  193 |     await this.page.waitForTimeout(60000); // Wait 1 minute
```