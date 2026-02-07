import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { APP_VERSION, SENTRY_DSN } from './constants/config';
import './index.css';
import { initializeAnalytics } from './utils/analytics';

// Mantine CSS imports
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Calculator enhancement CSS
import './styles/calculator-animations.css';

// Mantine imports
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider } from './context/ThemeContext';
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

const Root = () => {
  const systemScheme = useColorScheme();
  const [scheme] = useLocalStorage<'light' | 'dark'>({
    key: 'color-scheme',
    defaultValue: systemScheme === 'dark' ? 'dark' : 'dark',
  });
  return (
    <React.StrictMode>
      <ColorSchemeScript defaultColorScheme={scheme} />
      <MantineProvider theme={theme} defaultColorScheme={scheme}>
        <ThemeProvider>
          <Notifications position="top-right" zIndex={1000} limit={5} />
          <App />
        </ThemeProvider>
      </MantineProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
