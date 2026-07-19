# Supabase Setup

Phase 10 uses Supabase Auth and Postgres for private saved reports.

## Local Configuration

Create `.env.local` in the project root:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Use the project root URL. Do not append `/rest/v1/`; the Supabase JavaScript client builds REST and Auth requests from the root URL.

## Database

Run [`supabase/master.sql`](../supabase/master.sql) in the Supabase SQL Editor. This is the single, idempotent master query for a clean project and also brings an existing project up to the current Phase 11 schema. It creates:

- `profiles`
- `analyses`
- `red_flags`
- `checklist_items`
- ownership indexes and row-level security policies
- authenticated-role table and sequence permissions, with RLS still enforcing ownership
- a profile row trigger for new Auth users
- the Phase 9 AI explanation fields on saved reports
- the optional Phase 11 `analyses.source_url` field for saved public-link reports

The numbered files in `supabase/migrations/` remain the historical migration record. Use `master.sql` for manual Supabase Dashboard setup; do not run both approaches on a fresh project.

The browser anon key cannot run migrations. A project owner must execute the migration in the dashboard or through a separately authenticated Supabase CLI workflow.

## Auth Redirects

Add these URLs under Supabase Auth URL Configuration:

- `http://localhost:5173/auth/sign-in`
- The deployed production callback URL when the app is published

## Email/Password Authentication

Hunch uses Supabase email/password accounts. In Supabase Dashboard > Authentication > Providers, enable the Email provider and disable **Confirm email** so a newly registered student can sign in immediately. Hunch stores the required full name in Auth metadata and `profiles.display_name`.

Add the following Redirect URLs in Supabase Dashboard > Authentication > URL Configuration:

- `http://localhost:3000/auth/reset` when using `npx vercel dev`
- `http://localhost:5173/auth/reset` when using Vite directly
- `https://your-production-domain/auth/reset`

Password reset emails return to Hunch's reset route, where the student chooses a new password. SMTP remains controlled by the Supabase project.

## Security Boundary

The anon key may be exposed to browser code. RLS is the protection boundary for private reports. Never expose a Supabase service-role key, database password, or OpenAI key through `VITE_*` variables.
