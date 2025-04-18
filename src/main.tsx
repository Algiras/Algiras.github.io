import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import './i18n/i18n' // Import i18n configuration
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://43828e1e77df99cff727020a2bda77ef@o4509176327241728.ingest.de.sentry.io/4509176331173968",
    integrations: [],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    tracesSampleRate: 1.0,
    // Enable source maps for better error reporting
    release: "algiras-github-io@1.0.0", // Replace with your actual version
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
