# Rule Engine

Phase 8 establishes the deterministic baseline used before any AI explanation.

## Contract

`runRuleEngine(text)` returns:

- normalized text and the original input
- stable rule findings with `ruleId`, category, severity, evidence, start/end span, score impact, explanation, and next action
- a 0-100 score and risk level
- confidence and missing-information guidance
- a score breakdown, including the baseline context contribution
- the version `rules-1.0.0`

The report builder maps each finding to a visible red flag with `source: rule`. Phase 9 may add `ai-supported` wording, but AI does not become the source of truth for the score.

## Initial Rules

| Rule ID | Category | Impact | Detection boundary |
| --- | --- | ---: | --- |
| `payment-before-start` | Payment request | 30 | Fees or payment requested before starting, with explicit negation suppression. |
| `personal-recruiter-email` | Suspicious email | 8 | Personal inboxes are contextual; a public domain and school application path prevent a standalone warning. |
| `vague-company-identity` | Vague company | 10 | Generic company language or identity deferred/not provided. |
| `vague-role-details` | Vague role | 8 | Broad “easy office work” or task-only language without clear responsibilities. |
| `unclear-compensation` | Unrealistic compensation | 10 | Guaranteed or monthly compensation language tied to unclear role context. |
| `urgency-pressure` | Urgency pressure | 10 | Urgent, instant-hiring, limited-slot, no-interview, or same-day pressure. |
| `chat-only-application` | Chat-only hiring | 7 | Exclusive or informal chat application paths without an official route. |
| `early-sensitive-data` | Sensitive information | 25 | IDs, bank details, passwords, selfies, or full documents requested without negation. |

## Scoring

The engine starts with an 8-point baseline context contribution. A personal email that is balanced by a public domain and school route adds a 10-point context note without becoming a red flag. Each detected category contributes its catalog impact once. The final total is capped at 100.

This score is an estimate of visible signals. It is not proof that a listing is fraudulent or safe.

## Tests

`src/services/ruleEngine.test.ts` runs every calibrated fixture and checks risk range, risk level, confidence, categories, evidence, non-triggering categories, negation, informal-email restraint, normalization, empty input, long input, and score capping.
