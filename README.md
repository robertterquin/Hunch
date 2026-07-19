# Hunch

Hunch is a student-focused web app for checking OJT and internship listings for visible scam signals before applying.

## Current Phase

Phase 11 adds browser-only screenshot OCR with an editable review gate. Hunch analyzes only text the student has reviewed; uploaded screenshots are not stored. Secure OpenAI explanations, Supabase password accounts, and private saved-report persistence are also present.

## Setup

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

The local app is served by Vite. The project reads Supabase credentials from `.env.local`, which is ignored by git.

To create the database objects, run `supabase/master.sql` in the Supabase SQL Editor. The anon key cannot create tables or policies itself.

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
- `api/analyze.ts` is the server-side Vercel function for OpenAI explanations.
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

### Screenshot OCR

Hunch accepts PNG and JPG screenshots up to 10 MB. OCR runs locally in the browser with Tesseract.js, crop selection, image preprocessing, and an editable review gate. Low-confidence OCR can optionally use a consent-based Google Cloud Vision fallback; configure `GOOGLE_CLOUD_VISION_API_KEY` server-side only. See [`docs/20-screenshot-ocr.md`](C:/Hunch/Hunch/docs/20-screenshot-ocr.md).

### OpenAI explanation setup

OpenAI is optional. The rule engine remains the source of truth for the score, risk level, evidence, and red flags.

For local server-side configuration, add these variables to `.env.local` without committing the file:

```text
OPENAI_API_KEY=your-server-side-key
OPENAI_MODEL=gpt-5.6-luna
```

Never use `VITE_OPENAI_API_KEY`. The API key must not be in browser code, Supabase, source control, or a public environment variable. Configure the same variables as encrypted environment variables in Vercel for deployed explanations.

Vite alone serves the React app and does not execute `api/analyze.ts`. Running `npm run dev` without a Vercel function automatically falls back to the deterministic rule-only report. Use a Vercel-compatible local server such as `vercel dev` when you need to exercise the OpenAI route locally.

See [`docs/19-openai-integration.md`](C:/Hunch/Hunch/docs/19-openai-integration.md) for the request contract, fallback behavior, security rules, and test instructions.
