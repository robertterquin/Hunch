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

Run [`supabase/migrations/202607190001_initial_hunch.sql`](../supabase/migrations/202607190001_initial_hunch.sql) in the Supabase SQL Editor. It creates:

- `profiles`
- `analyses`
- `red_flags`
- `checklist_items`
- ownership indexes and row-level security policies
- a profile row trigger for new Auth users

The browser anon key cannot run migrations. A project owner must execute the migration in the dashboard or through a separately authenticated Supabase CLI workflow.

## Auth Redirects

Add these URLs under Supabase Auth URL Configuration:

- `http://localhost:5173/auth/sign-in`
- The deployed production callback URL when the app is published

Hunch uses email magic links. SMTP and email confirmation settings remain controlled by the Supabase project.

## Security Boundary

The anon key may be exposed to browser code. RLS is the protection boundary for private reports. Never expose a Supabase service-role key, database password, or OpenAI key through `VITE_*` variables.
