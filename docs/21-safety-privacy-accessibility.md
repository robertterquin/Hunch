# Phase 13 Safety, Privacy, Accessibility, and Abuse Review

This review records the Phase 13 hardening pass for Hunch. It covers safety language, privacy behavior, keyboard and screen-reader access, and anonymous abuse controls.

## Safety Claims

- Hunch remains a decision-support tool, not a fraud detector, job board, legal adviser, or background-check service.
- The deterministic rule engine remains authoritative for score, risk level, evidence, and visible signals.
- OpenAI explanations are evidence-bound and cannot change score, risk level, evidence, or detected rule findings.
- Low-risk reports must still tell the student to verify through a school coordinator, official company website, official company email, or another trusted channel.
- User-facing copy must avoid declaring a company definitely fake, definitely legitimate, legally liable, or externally verified.

## Privacy And Retention

- Anonymous students can analyze pasted text and public links without an account.
- Submitted text and public-link extracts stay in the active browser flow unless the student explicitly saves a report.
- Saved reports store report text, rule output, checklist state, and source URL only after the student chooses Save.
- Sign-out removes private saved-report data from the active session. It does not discard an unsaved current report.
- Delete all requires browser confirmation and removes saved reports from the signed-in account or local session, depending on Supabase configuration.
- OpenAI keys are server-side only. Supabase anon keys are browser-side by design and must be protected by RLS.

## Public-Link Boundary

- `api/extract-link.ts` fetches only public HTTP(S) HTML, sends no cookies or user-supplied headers, does not execute JavaScript, limits bodies to 1 MB, times out after ten seconds, and follows at most three redirects.
- The extractor resolves hostnames before the initial request and every redirect, rejecting loopback, private, link-local, multicast, reserved, and internal-network addresses.
- Unsupported pages return manual-paste recovery messages instead of attempting private, login-protected, JavaScript-only, non-HTML, or oversized extraction.

## Abuse Controls

- `api/analyze.ts` applies an in-memory per-connection limit of 12 explanation requests per minute.
- `api/extract-link.ts` applies an in-memory per-connection limit of 8 extraction requests per minute.
- Rate-limited responses return HTTP 429, a `Retry-After` header, and a generic recovery message.
- The limiter is intentionally lightweight for Phase 13. Production can later move this to Vercel KV, Upstash, Supabase edge rate limits, or another shared store if abuse volume grows.

## Accessibility Fixes

- The app shell includes a skip link to the main content area.
- Analyze status and success/error messages use live regions so screen readers receive state changes.
- Analyze inputs expose invalid state when validation or extraction fails.
- The active form exposes busy state during analysis.
- CSS honors `prefers-reduced-motion: reduce` for transitions and animations.
- Focus styling remains visible for links, buttons, form fields, and the skip link.

## Manual Review Checklist

- Tab from the browser chrome through the top navigation, Analyze form, primary action, result controls, and mobile navigation.
- Confirm the skip link appears on keyboard focus and moves focus to the main content.
- Check Analyze in paste mode with short text, valid text, OpenAI fallback, and save-required authentication.
- Check Analyze in public-link mode with invalid URL, private/internal URL, blocked/non-HTML page, and valid readable HTML.
- Confirm Settings sign-out keeps an unsaved active report but removes private saved reports from the session.
- Confirm Delete all requires confirmation and leaves no saved-report data in the current account/session.
- Review result copy for cautious language: no guaranteed safety, no external verification claim, no legal conclusion.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
