// Dynamic imports for code splitting
import dynamic from 'next/dynamic';

// Lazy load heavy components
const LazyDashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <div>Loading dashboard...</div>,
  ssr: false });

const LazyChart = dynamic(() => import('./Chart'), {
  loading: () => <div>Loading chart...</div> });

// Route-based code splitting
const LazyClientPage = dynamic(() => import('../pages/clients'), {
  loading: () => <div>Loading clients...</div> });

// Conditional imports
const ConditionalComponent = dynamic(
  () => import('./ConditionalComponent'),
  { ssr: false  }
);

export { LazyDashboard, LazyChart, LazyClientPage, ConditionalComponent };
