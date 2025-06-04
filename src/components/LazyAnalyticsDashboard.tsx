import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';
import { SkeletonLoaders } from './SkeletonLoaders';

// Dynamically import the AnalyticsDashboard with loading state
const AnalyticsDashboard = dynamic(
  () => import('./analytics/PerformanceDashboard'),
  {
    loading: () => <SkeletonLoaders variant="analytics" />,
    ssr: false, // Analytics components often use client-side data
  }
);

type AnalyticsDashboardProps = ComponentProps<typeof AnalyticsDashboard>;

export default function LazyAnalyticsDashboard(props: AnalyticsDashboardProps) {
  return <AnalyticsDashboard {...props} />;
}