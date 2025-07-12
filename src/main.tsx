import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as Sentry from '@sentry/react';
import { initializeAnalytics } from './utils/analytics';
import { SENTRY_DSN, APP_VERSION } from './constants/config';

// Mantine CSS imports
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Mantine imports
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [],
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: 1.0,
  // Enable source maps for better error reporting
  release: APP_VERSION,
});

// Initialize Google Analytics if user has given consent
initializeAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="dark" />
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} limit={5} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
