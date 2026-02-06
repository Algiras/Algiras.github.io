# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio/CV website with financial calculators, document tools, and games. Built with React 18 + TypeScript + Mantine 8 UI library, bundled with Vite, deployed to GitHub Pages.

## Commands

```bash
yarn dev              # Start dev server
yarn build            # Type-check (tsc) then build (vite build)
yarn test             # Run Jest tests (uses --experimental-vm-modules)
yarn lint             # ESLint with zero warnings allowed
yarn lint:fix         # ESLint with auto-fix
yarn format           # Prettier format src files
yarn format:check     # Prettier check only
yarn type-check       # TypeScript check without emitting
yarn clean:all        # Organize imports + lint fix + format
```

## Architecture

**Routing:** React Router v7 with `HashRouter` (required for GitHub Pages — do not switch to BrowserRouter). Routes defined in `src/App.tsx`. Tool/calculator pages are wrapped in `ToolWrapper` which provides consistent layout with breadcrumbs.

**State management:**
- Local component state and Mantine Form for calculators
- `useLocalStorage` hook (in `src/hooks/`) with cross-tab sync for persistence
- XState v5 state machines for the Akotchi pet game (`src/games/akotchi/machine.ts`)
- `ThemeContext` (`src/context/`) for light/dark theme with OS preference detection

**Styling:** Mantine component library with theme configuration in `src/theme.ts`. Custom CSS in `src/styles/` (animations, theme overrides, mobile). Uses Mantine CSS variables (e.g., `var(--mantine-color-blue-6)`), not raw colors.

**Key directories:**
- `src/components/projects/` — Financial calculators (mortgage, investment, ROI, debt, etc.)
- `src/games/akotchi/` — Tamagotchi-like pet game with XState machine
- `src/components/documents/` — Document tools (Markdown to PDF)
- `src/pages/` — Hub pages (Home, Finance, Games, Documents)
- `src/hooks/` — Custom hooks including `useLocalStorage`, `useCalculatorPersistence`
- `src/lib/` — Utility libraries

## Tech Stack Details

- **Package manager:** Yarn 3.6.4 (use `yarn` not `npm`)
- **Path alias:** `src/*` maps to `./src/*` (configured in tsconfig.json)
- **TypeScript:** Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
- **Icons:** Lucide React
- **Charts:** Recharts
- **Error tracking:** Sentry (conditional on `SENTRY_AUTH_TOKEN` env var)
- **Analytics:** Google Analytics 4 via react-ga4 with consent management

## Deployment

GitHub Actions CI/CD (`.github/workflows/deploy.yml`): tests on Node 18.x/20.x, deploys to GitHub Pages on push to main. Vite is configured with relative base path (`./`) for GitHub Pages compatibility.
