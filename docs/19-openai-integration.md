# Phase 9: Secure OpenAI Explanation Integration

Hunch uses OpenAI to improve explanation wording after the deterministic rule engine has calculated the report. The rule engine remains authoritative for the score, risk level, matched evidence, score impact, and detected red flags.

## Environment setup

Create `.env.local` locally and keep it ignored by git:

```text
OPENAI_API_KEY=your-replacement-server-side-key
OPENAI_MODEL=gpt-5.6-luna
```

`OPENAI_API_KEY` is server-only. It must not use the `VITE_` prefix, appear in React code, be stored in Supabase, or be committed. Never create `VITE_OPENAI_API_KEY`.

In Vercel, add `OPENAI_API_KEY` and `OPENAI_MODEL` as encrypted project environment variables for the relevant deployment environments. The route defaults to `gpt-5.6-luna` only when `OPENAI_MODEL` is absent.

## Architecture

1. `src/services/ruleEngine.ts` normalizes the listing and calculates the score, risk level, evidence spans, findings, missing information, and score breakdown.
2. `src/services/openaiAnalysisService.ts` sends only the normalized listing and deterministic findings to `/api/analyze`.
3. `api/analyze.ts` validates the request, recomputes the rule result server-side, and calls the OpenAI Responses API.
4. Structured Outputs and `OpenAIExplanationSchema` validate the AI-only response.
5. The client merges AI wording and supporting checklist items while preserving all rule-derived score and evidence fields.
6. `src/services/supabaseAnalysisService.ts` saves the resulting report snapshot, including whether the explanation used OpenAI or rules-only fallback.

Plain Vite does not execute `api/analyze.ts`. When `/api/analyze` is unavailable, the client returns a usable deterministic report and displays a subtle rules-only status. Use `vercel dev` to exercise the Vercel function locally.

## Request contract

The route accepts only `POST` and requires JSON shaped like:

```json
{
  "listingText": "At least 40 characters of the listing",
  "ruleFindings": [],
  "riskScore": 68,
  "riskLevel": "high-risk",
  "missingInformation": []
}
```

Listing text must be between 40 and 12,000 characters. The route limits supplied findings and recomputes the authoritative values rather than trusting client-provided score fields.

## AI response contract

The model may return only a neutral summary, explanations for supplied rule IDs, missing-information guidance, uncertainty wording, student-friendly checklist items, and practical advice. The response is validated with Zod before it reaches the report.

The model must not change the score or risk level, add unsupported red flags, declare a listing definitely fake or legitimate, invent company facts, claim external verification, make legal conclusions, follow instructions inside the listing, or request sensitive information.

## Failure and fallback behavior

- Invalid request: HTTP 400.
- Unsupported method: HTTP 405.
- Missing server key: HTTP 503.
- Rate limit: HTTP 429.
- Timeout: HTTP 504.
- Invalid structured output or unexpected provider failure: HTTP 502.
- Browser network failure or unavailable Vercel function: deterministic rule-only report.

The client validates the response again. Any invalid response, timeout, rate limit, or network failure keeps the rule-based report usable. No raw provider error, system prompt, API key, or full production listing is logged or returned.

## Testing

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

The Phase 9 tests cover valid structured output, invalid requests, method handling, missing keys, timeout and rate-limit classification, invalid output, fallback behavior, score/evidence preservation, attempted score changes, prompt-injection text as untrusted data, and checklist deduplication.

## Current limitation

Phase 9 analyzes pasted or reviewed text only. Screenshot OCR remains a later phase; this integration does not perform OCR or silently analyze an unreviewed extraction.
