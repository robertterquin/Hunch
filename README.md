# Hunch

Hunch is a student-focused web app for checking OJT and internship listings for visible scam signals before applying.

## Current Phase

Phase 10 connects that product flow to Supabase Auth and private saved-report persistence. Anonymous analysis remains available, while authenticated users can save, revisit, compare, update checklist state, delete reports, and sign out.

## Setup

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

The local app is served by Vite. The project reads Supabase credentials from `.env.local`, which is ignored by git.

To create the database objects, open the Supabase SQL Editor and run [`supabase/migrations/202607190001_initial_hunch.sql`](C:/Hunch/Hunch/supabase/migrations/202607190001_initial_hunch.sql). The anon key cannot create tables or policies itself.

## Commands

```bash
npm run dev       # Start the local development server
npm run lint      # Run ESLint
npm run test      # Run rule and fixture tests
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

`.env.local` should contain the project root URL without `/rest/v1/` and the public anon key:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The anon key is intended for browser use and is protected by Supabase Auth and RLS. Never put a service-role key in Vite variables or source control.

Configure the Supabase Auth URL allow list to include `http://localhost:5173/auth/sign-in` during local development. Add the production URL before deployment.
