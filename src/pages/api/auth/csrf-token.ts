/**
 * CSRF Token API Endpoint
 * Provides CSRF tokens for client-side security
 */

import { handleCSRFToken } from '@/lib/csrf';
import { withAPIRateLimit } from '@/lib/rate-limiter';

// Apply rate limiting and handle CSRF token requests
export default withAPIRateLimit(handleCSRFToken);
