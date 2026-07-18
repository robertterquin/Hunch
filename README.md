# Hunch

Hunch is a student-focused web app for checking OJT and internship listings for visible scam signals before applying.

## Current Phase

Phase 6 establishes the React and TypeScript foundation: a typed domain model, route contract, responsive app shell, and a mock analysis service backed by the calibrated fixtures in `fixtures/hunch-analysis-fixtures.json`.

## Setup

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

The local app is served by Vite. Phase 6 uses synthetic fixture data only; Supabase and server-side analysis integrations are planned for later phases.

## Commands

```bash
npm run dev       # Start the local development server
npm run lint      # Run ESLint
npm run typecheck # Run the TypeScript project check
npm run build     # Run typecheck and create a production build
npm run preview   # Preview the production build locally
```

## Project Structure

- `src/app` contains the router and shared application shell.
- `src/pages` contains route-level screens.
- `src/types` contains the typed analysis contract.
- `src/data` and `src/services` expose the fixture-backed mock service.
- `fixtures` contains the Phase 3 calibration fixtures.
- `docs` contains the product, UX, visual, and implementation contracts.

## Route Foundation

The current route map includes `/analyze`, `/analyze/review`, `/saved`, `/saved/:analysisId`, `/compare`, `/guide`, `/guide/:patternId`, `/checklist`, `/settings`, and `/auth/:mode`. The root route redirects to `/analyze`.

## Environment Variables

No environment variables are required for Phase 6. Supabase URL and public anon key configuration belongs to the backend integration phase, and secrets must remain outside source control.
