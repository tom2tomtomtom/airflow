// Dynamic imports for code splitting
import dynamic from 'next/dynamic';

// Lazy load heavy components that actually exist
const LazyMonitoringDashboard = dynamic(() => import('../monitoring/MonitoringDashboard'), {
  loading: () => null,
  ssr: false,
});

const LazyAnalyticsDashboard = dynamic(() => import('../LazyAnalyticsDashboard'), {
  loading: () => null,
  ssr: false,
});

const LazyAdvancedAnalytics = dynamic(() => import('../AdvancedAnalytics').then(mod => ({ default: mod.AdvancedAnalytics })), {
  loading: () => null,
  ssr: false,
});

// Commented out missing components - can be added when they're created
// const LazyDashboard = dynamic(() => import('./Dashboard'), {
//   loading: () => null,
//   ssr: false
// });

// const LazyChart = dynamic(() => import('./Chart'), {
//   loading: () => null
// });

// const LazyClientPage = dynamic(() => import('../pages/clients'), {
//   loading: () => null
// });

// const ConditionalComponent = dynamic(
//   () => import('./ConditionalComponent'),
//   { ssr: false }
// );

export { LazyMonitoringDashboard, LazyAnalyticsDashboard, LazyAdvancedAnalytics };
