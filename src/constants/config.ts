/**
 * Application configuration constants
 */

// Google Analytics
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-6G7EBCDPQW';

// Sentry
export const SENTRY_DSN =
  'https://43828e1e77df99cff727020a2bda77ef@o4509176327241728.ingest.de.sentry.io/4509176331173968';

// Feature flags
export const ENABLE_ANALYTICS =
  process.env.NODE_ENV === 'production' ||
  import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// App version
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'development';
