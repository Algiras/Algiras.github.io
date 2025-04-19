import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import './i18n/i18n' // Import i18n configuration
import * as Sentry from "@sentry/react";
import { initializeAnalytics } from './utils/analytics';
import { SENTRY_DSN, APP_VERSION } from './constants/config';

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
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
