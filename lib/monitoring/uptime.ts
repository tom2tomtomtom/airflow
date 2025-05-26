// Uptime monitoring configuration for Better Uptime or similar service

export interface Monitor {
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'HEAD';
  interval: number; // seconds
  timeout?: number; // seconds
  headers?: Record<string, string>;
  expectedStatus?: number[];
  keywords?: string[];
  alerts: ('email' | 'sms' | 'slack' | 'webhook')[];
}

// Production monitors configuration
export const monitors: Monitor[] = [
  {
    name: 'AIrWAVE Main Application',
    url: 'https://app.airwave.com',
    method: 'GET',
    interval: 60, // Check every minute
    timeout: 30,
    expectedStatus: [200],
    alerts: ['email', 'slack'],
  },
  {
    name: 'AIrWAVE API Health',
    url: 'https://app.airwave.com/api/health',
    method: 'GET',
    interval: 300, // Check every 5 minutes
    timeout: 10,
    expectedStatus: [200],
    keywords: ['healthy', 'degraded'], // Either is acceptable
    alerts: ['email', 'slack'],
  },
  {
    name: 'Render Service',
    url: 'https://app.airwave.com/api/render/health',
    method: 'GET',
    interval: 300,
    timeout: 10,
    expectedStatus: [200],
    alerts: ['email', 'slack'],
  },
  {
    name: 'WebSocket Service',
    url: 'wss://app.airwave.com/ws',
    method: 'GET',
    interval: 300,
    timeout: 10,
    expectedStatus: [101], // WebSocket upgrade
    alerts: ['email', 'slack'],
  },
  {
    name: 'Client Portal',
    url: 'https://app.airwave.com/client/test',
    method: 'HEAD',
    interval: 600, // Check every 10 minutes
    timeout: 10,
    expectedStatus: [200, 404], // 404 is ok for non-existent test client
    alerts: ['email'],
  },
];

// Status page configuration
export const statusPageConfig = {
  title: 'AIrWAVE Status',
  description: 'Real-time status of AIrWAVE services',
  url: 'https://status.airwave.com',
  
  // Group monitors by category
  categories: [
    {
      name: 'Core Services',
      monitors: ['AIrWAVE Main Application', 'AIrWAVE API Health'],
    },
    {
      name: 'Processing Services',
      monitors: ['Render Service', 'WebSocket Service'],
    },
    {
      name: 'Client Services',
      monitors: ['Client Portal'],
    },
  ],
  
  // Incident notification settings
  notifications: {
    email: {
      subscribers: ['ops@airwave.com', 'dev@airwave.com'],
      template: 'incident',
    },
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#alerts',
    },
  },
  
  // Maintenance window settings
  maintenanceWindows: {
    recurring: [
      {
        name: 'Weekly Maintenance',
        schedule: '0 3 * * 0', // Every Sunday at 3 AM
        duration: 60, // minutes
        services: ['all'],
      },
    ],
  },
};

// Alert escalation policy
export const escalationPolicy = {
  levels: [
    {
      level: 1,
      delay: 0, // Immediate
      contacts: ['oncall@airwave.com'],
      methods: ['email', 'slack'],
    },
    {
      level: 2,
      delay: 300, // 5 minutes
      contacts: ['oncall@airwave.com', 'backup-oncall@airwave.com'],
      methods: ['email', 'sms', 'slack'],
    },
    {
      level: 3,
      delay: 900, // 15 minutes
      contacts: ['oncall@airwave.com', 'backup-oncall@airwave.com', 'cto@airwave.com'],
      methods: ['email', 'sms', 'phone'],
    },
  ],
  
  // Auto-resolve settings
  autoResolve: {
    enabled: true,
    afterChecks: 3, // Resolve after 3 successful checks
  },
};

// Synthetic monitoring scripts
export const syntheticChecks = [
  {
    name: 'User Login Flow',
    interval: 3600, // Every hour
    script: `
      // Navigate to login page
      await page.goto('https://app.airwave.com/login');
      
      // Fill in credentials
      await page.fill('input[name="email"]', 'test@airwave.com');
      await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
      
      // Verify dashboard loaded
      await expect(page.locator('h1')).toContainText('Dashboard');
    `,
  },
  {
    name: 'Asset Upload Flow',
    interval: 7200, // Every 2 hours
    script: `
      // Login first
      await login(page);
      
      // Navigate to assets
      await page.goto('https://app.airwave.com/assets');
      
      // Upload test file
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles('./test-asset.jpg');
      
      // Wait for upload to complete
      await page.waitForSelector('.upload-success');
      
      // Verify asset appears in list
      await expect(page.locator('.asset-grid')).toContainText('test-asset.jpg');
    `,
  },
];
