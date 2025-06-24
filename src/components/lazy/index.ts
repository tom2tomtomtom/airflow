// Dynamic imports for code splitting
import dynamic from 'next/dynamic';

// Lazy load heavy components
const LazyDashboard = dynamic(() => import('./Dashboard'), {
  loading: () => null,
  ssr: false
});

const LazyChart = dynamic(() => import('./Chart'), {
  loading: () => null
});

// Route-based code splitting
const LazyClientPage = dynamic(() => import('../pages/clients'), {
  loading: () => null
});

// Conditional imports
const ConditionalComponent = dynamic(
  () => import('./ConditionalComponent'),
  { ssr: false }
);

export { LazyDashboard, LazyChart, LazyClientPage, ConditionalComponent };
