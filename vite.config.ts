import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add Sentry plugin for source maps
    sentryVitePlugin({
      org: "your-sentry-org", // Replace with your Sentry organization
      project: "algiras-github-io", // Replace with your Sentry project name
      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and should be stored in environment variables
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  // Enable source map generation in production
  build: {
    sourcemap: true, // Generate source maps for production builds
  },
  base: process.env.NODE_ENV === 'production' ? './' : '/', // Use absolute path in dev, relative in prod
})
