import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add Sentry plugin for source maps only if properly configured
    ...(process.env.SENTRY_AUTH_TOKEN ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG || "your-sentry-org",
        project: process.env.SENTRY_PROJECT || "algiras-github-io",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      })
    ] : []),
  ],
  // Enable source map generation in production
  build: {
    sourcemap: true, // Generate source maps for production builds
  },
  base: process.env.NODE_ENV === 'production' ? './' : '/', // Use absolute path in dev, relative in prod
})
