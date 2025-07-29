import React from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';

interface TestProvidersProps {
  children: React.ReactNode;
}

export function TestProviders({ children }: TestProvidersProps) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}

export default TestProviders;