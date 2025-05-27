#!/usr/bin/env node

/**
 * Main worker process that runs all background job workers
 * 
 * Usage:
 *   npm run workers
 *   npm run workers -- --only=render,email
 *   npm run workers -- --exclude=webhook
 */

import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

// Load environment variables
dotenv.config();

// Initialize Sentry for worker processes
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const onlyWorkers = args
  .find(arg => arg.startsWith('--only='))
  ?.split('=')[1]
  ?.split(',') || [];
const excludeWorkers = args
  .find(arg => arg.startsWith('--exclude='))
  ?.split('=')[1]
  ?.split(',') || [];

// Available workers
const availableWorkers = {
  render: () => import('@/lib/workers/renderWorker'),
  email: () => import('@/lib/workers/emailWorker'),
  webhook: () => import('@/lib/workers/webhookWorker'),
  fileCleanup: () => import('@/lib/workers/fileCleanupWorker'),
  analytics: () => import('@/lib/workers/analyticsWorker'),
};

// Determine which workers to run
let workersToRun = Object.keys(availableWorkers);

if (onlyWorkers.length > 0) {
  workersToRun = workersToRun.filter(worker => onlyWorkers.includes(worker));
} else if (excludeWorkers.length > 0) {
  workersToRun = workersToRun.filter(worker => !excludeWorkers.includes(worker));
}

// Start workers
async function startWorkers() {
  console.log('Starting workers:', workersToRun.join(', '));
  
  const runningWorkers: any[] = [];
  
  for (const workerName of workersToRun) {
    try {
      console.log(`Starting ${workerName} worker...`);
      const workerModule = await availableWorkers[workerName as keyof typeof availableWorkers]();
      runningWorkers.push(workerModule);
      console.log(`${workerName} worker started successfully`);
    } catch (error) {
      console.error(`Failed to start ${workerName} worker:`, error);
      Sentry.captureException(error, {
        tags: { worker: workerName },
      });
    }
  }
  
  console.log(`All workers started. Running ${runningWorkers.length} workers.`);
  
  // Keep process alive
  process.stdin.resume();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down workers...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down workers...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  Sentry.captureException(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  Sentry.captureException(reason);
  process.exit(1);
});

// Start the workers
startWorkers().catch((error) => {
  console.error('Failed to start workers:', error);
  Sentry.captureException(error);
  process.exit(1);
});
