# Test info

- Name: Authentication Flow - Integrated Testing >> Login Experience >> login errors are helpful and clear
- Location: /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:94:9

# Error details

```
Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
Call log:
  - waiting for locator('[data-testid="email-input"]')
    - locator resolved to <div data-testid="email-input" class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root mui-style-dzmwfx-MuiFormControl-root-MuiTextField-root">…</div>
    - fill("wrong@email.com")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

    at AuthPage.login (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/pages/auth-page.ts:119:27)
    at AuthPage.loginAndExpectError (/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/pages/auth-page.ts:144:5)
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:101:9
    at /Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/tests/e2e/auth-flow-integrated.spec.ts:100:7
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
   19 |   
   20 |   // Signup page elements
   21 |   readonly signupForm: Locator;
   22 |   readonly nameInput: Locator;
   23 |   readonly confirmPasswordInput: Locator;
   24 |   readonly signupButton: Locator;
   25 |   readonly loginLinkFromSignup: Locator;
   26 |   readonly termsCheckbox: Locator;
   27 |   
   28 |   // Error and success messages
   29 |   readonly errorMessage: Locator;
   30 |   readonly successMessage: Locator;
   31 |   readonly validationErrors: Locator;
   32 |   
   33 |   // Loading states
   34 |   readonly loadingSpinner: Locator;
   35 |   readonly submitButtonLoading: Locator;
   36 |   
   37 |   // MFA elements
   38 |   readonly mfaForm: Locator;
   39 |   readonly mfaCodeInput: Locator;
   40 |   readonly mfaVerifyButton: Locator;
   41 |   readonly mfaResendButton: Locator;
   42 |   
   43 |   // Password reset elements
   44 |   readonly resetForm: Locator;
   45 |   readonly resetEmailInput: Locator;
   46 |   readonly resetSubmitButton: Locator;
   47 |   readonly resetSuccessMessage: Locator;
   48 |   
   49 |   // Social login (if implemented)
   50 |   readonly googleLoginButton: Locator;
   51 |   readonly microsoftLoginButton: Locator;
   52 |
   53 |   constructor(page: Page) {
   54 |     this.page = page;
   55 |     
   56 |     // Login elements
   57 |     this.loginForm = page.locator('[data-testid="login-form"]');
   58 |     this.emailInput = page.locator('[data-testid="email-input"]');
   59 |     this.passwordInput = page.locator('[data-testid="password-input"]');
   60 |     this.loginButton = page.locator('[data-testid="login-button"]');
   61 |     this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
   62 |     this.signupLink = page.locator('[data-testid="signup-link"]');
   63 |     this.rememberMeCheckbox = page.locator('[data-testid="remember-me-checkbox"]');
   64 |     
   65 |     // Signup elements
   66 |     this.signupForm = page.locator('[data-testid="signup-form"]');
   67 |     this.nameInput = page.locator('[data-testid="name-input"]');
   68 |     this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');
   69 |     this.signupButton = page.locator('[data-testid="signup-button"]');
   70 |     this.loginLinkFromSignup = page.locator('[data-testid="login-link"]');
   71 |     this.termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
   72 |     
   73 |     // Messages
   74 |     this.errorMessage = page.locator('[data-testid="error-message"]');
   75 |     this.successMessage = page.locator('[data-testid="success-message"]');
   76 |     this.validationErrors = page.locator('[data-testid="validation-error"]');
   77 |     
   78 |     // Loading states
   79 |     this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
   80 |     this.submitButtonLoading = page.locator('[data-testid="button-loading"]');
   81 |     
   82 |     // MFA elements
   83 |     this.mfaForm = page.locator('[data-testid="mfa-form"]');
   84 |     this.mfaCodeInput = page.locator('[data-testid="mfa-code-input"]');
   85 |     this.mfaVerifyButton = page.locator('[data-testid="mfa-verify-button"]');
   86 |     this.mfaResendButton = page.locator('[data-testid="mfa-resend-button"]');
   87 |     
   88 |     // Password reset
   89 |     this.resetForm = page.locator('[data-testid="reset-form"]');
   90 |     this.resetEmailInput = page.locator('[data-testid="reset-email-input"]');
   91 |     this.resetSubmitButton = page.locator('[data-testid="reset-submit-button"]');
   92 |     this.resetSuccessMessage = page.locator('[data-testid="reset-success-message"]');
   93 |     
   94 |     // Social login
   95 |     this.googleLoginButton = page.locator('[data-testid="google-login-button"]');
   96 |     this.microsoftLoginButton = page.locator('[data-testid="microsoft-login-button"]');
   97 |   }
   98 |
   99 |   // Navigation
  100 |   async gotoLogin(): Promise<void> {
  101 |     await this.page.goto('/login');
  102 |     await this.loginForm.waitFor({ state: 'visible' });
  103 |   }
  104 |
  105 |   async gotoSignup(): Promise<void> {
  106 |     await this.page.goto('/signup');
  107 |     await this.signupForm.waitFor({ state: 'visible' });
  108 |   }
  109 |
  110 |   async gotoForgotPassword(): Promise<void> {
  111 |     await this.page.goto('/forgot-password');
  112 |     await this.resetForm.waitFor({ state: 'visible' });
  113 |   }
  114 |
  115 |   // Login functionality
  116 |   async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
  117 |     await this.gotoLogin();
  118 |     
> 119 |     await this.emailInput.fill(email);
      |                           ^ Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
  120 |     await this.passwordInput.fill(password);
  121 |     
  122 |     if (rememberMe) {
  123 |       await this.rememberMeCheckbox.check();
  124 |     }
  125 |     
  126 |     await this.loginButton.click();
  127 |     
  128 |     // Wait for navigation or error
  129 |     await Promise.race([
  130 |       this.page.waitForURL('/dashboard', { timeout: 15000 }),
  131 |       this.errorMessage.waitFor({ state: 'visible', timeout: 15000 })
  132 |     ]);
  133 |   }
  134 |
  135 |   async loginAndExpectSuccess(email: string, password: string): Promise<void> {
  136 |     await this.login(email, password);
  137 |     await this.page.waitForURL('/dashboard');
  138 |     
  139 |     // Verify we're actually logged in
  140 |     await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  141 |   }
  142 |
  143 |   async loginAndExpectError(email: string, password: string, expectedError?: string): Promise<void> {
  144 |     await this.login(email, password);
  145 |     
  146 |     await expect(this.errorMessage).toBeVisible();
  147 |     
  148 |     if (expectedError) {
  149 |       await expect(this.errorMessage).toContainText(expectedError);
  150 |     }
  151 |   }
  152 |
  153 |   async loginWithMFA(email: string, password: string, mfaCode: string): Promise<void> {
  154 |     await this.login(email, password);
  155 |     
  156 |     // Should show MFA form
  157 |     await this.mfaForm.waitFor({ state: 'visible' });
  158 |     await this.mfaCodeInput.fill(mfaCode);
  159 |     await this.mfaVerifyButton.click();
  160 |     
  161 |     await this.page.waitForURL('/dashboard');
  162 |   }
  163 |
  164 |   // Signup functionality
  165 |   async signup(name: string, email: string, password: string, confirmPassword?: string): Promise<void> {
  166 |     await this.gotoSignup();
  167 |     
  168 |     await this.nameInput.fill(name);
  169 |     await this.emailInput.fill(email);
  170 |     await this.passwordInput.fill(password);
  171 |     
  172 |     if (confirmPassword) {
  173 |       await this.confirmPasswordInput.fill(confirmPassword);
  174 |     } else {
  175 |       await this.confirmPasswordInput.fill(password);
  176 |     }
  177 |     
  178 |     // Accept terms if checkbox exists
  179 |     if (await this.termsCheckbox.isVisible()) {
  180 |       await this.termsCheckbox.check();
  181 |     }
  182 |     
  183 |     await this.signupButton.click();
  184 |     
  185 |     // Wait for success or error
  186 |     await Promise.race([
  187 |       this.successMessage.waitFor({ state: 'visible', timeout: 10000 }),
  188 |       this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }),
  189 |       this.page.waitForURL('/dashboard', { timeout: 15000 })
  190 |     ]);
  191 |   }
  192 |
  193 |   async signupAndExpectSuccess(name: string, email: string, password: string): Promise<void> {
  194 |     await this.signup(name, email, password);
  195 |     
  196 |     // Either redirect to dashboard or show success message
  197 |     const isOnDashboard = this.page.url().includes('/dashboard');
  198 |     const hasSuccessMessage = await this.successMessage.isVisible();
  199 |     
  200 |     expect(isOnDashboard || hasSuccessMessage).toBeTruthy();
  201 |   }
  202 |
  203 |   async signupAndExpectError(name: string, email: string, password: string, expectedError?: string): Promise<void> {
  204 |     await this.signup(name, email, password);
  205 |     
  206 |     await expect(this.errorMessage).toBeVisible();
  207 |     
  208 |     if (expectedError) {
  209 |       await expect(this.errorMessage).toContainText(expectedError);
  210 |     }
  211 |   }
  212 |
  213 |   // Password reset functionality
  214 |   async requestPasswordReset(email: string): Promise<void> {
  215 |     await this.gotoForgotPassword();
  216 |     
  217 |     await this.resetEmailInput.fill(email);
  218 |     await this.resetSubmitButton.click();
  219 |     
```