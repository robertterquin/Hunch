# Phase 11 Replacement: Public-Link Analyzer

Hunch can analyze a student-supplied public HTTP or HTTPS listing page without requiring an account. The browser sends the URL to `api/extract-link.ts`; the server fetches readable HTML, extracts text and a page title, then sends that text to the existing rule-first analysis pipeline.

## Student Flow

1. Select **Public link** on Analyze and enter one public listing URL.
2. Hunch fetches the page without cookies, credentials, user headers, or JavaScript execution.
3. If enough readable HTML text is available, Hunch analyzes it immediately.
4. The result shows the canonical source URL. Saving a report stores the source URL and extracted text only after the student chooses Save.

Private, login-protected, JavaScript-only, bot-blocked, non-HTML, unavailable, short, or excessively long pages are intentionally unsupported. Each outcome tells the student to use **Paste text** instead.

## Server Boundary

`api/extract-link.ts` accepts POST only and validates one URL. It permits only public HTTP(S) pages, follows at most three redirects, applies a ten-second timeout, and reads no more than 1 MB. Before each request and redirect it resolves the hostname and rejects loopback, private, link-local, multicast, reserved, and internal-network addresses. It sends no cookies, credentials, or browser-supplied headers.

The route accepts HTML only and parses static readable content with `linkedom` and `@mozilla/readability`. It never runs page JavaScript. Extracted text must be between 40 and 12,000 characters; Hunch does not cache link content.

## Analysis Boundary

The deterministic rule engine remains authoritative for score, risk level, evidence, findings, and score breakdown. The public-link client passes extracted text to `analyzeListingWithExplanation`; OpenAI is limited to the existing evidence-bound explanation. If OpenAI is unavailable, Hunch still returns the deterministic rule-only report.

## Persistence and Privacy

`analyses.source_url` stores the canonical URL for a saved report. The title is used as the saved-report title when the page provides one. Existing Supabase projects must re-run [`supabase/master.sql`](../supabase/master.sql) to add the idempotent `source_url` column. RLS continues to restrict reports to their owner.

No scraping provider, image-text service, image storage, or additional provider key is used. Only server-side Vercel functions can run the link extractor; Vite alone will not serve `/api/extract-link`.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

The extractor tests cover HTML extraction, short/long pages, unsupported URLs, local/private/reserved addresses, and client recovery. Exercise a public static HTML page through `vercel dev` before deployment.
