# Hunch Product Plan and Development Phases

Version 1.1 - 18 July 2026

Hunch is a focused OJT and internship risk analyzer for students. This plan defines the product boundary, the full user flow, the technical approach, and a quality-first development sequence.

## 00. Executive brief

### Product in one sentence

Hunch gives students a fast, explainable second opinion on an OJT or internship listing before they apply, send sensitive documents, or pay money.

### Product decisions for the first release

- Primary audience: students actively hunting for OJT, internships, and entry-level placements.
- Core job: identify warning signals in a job post and turn them into cautious, practical next steps.
- Core experience: analyzer-first web app, not a general chatbot or job board.
- Primary artifact: a risk report containing a score, evidence, explanations, and a before-applying checklist.
- Input methods: pasted post text and readable public-link analysis.
- AI boundary: OpenAI improves classification explanations and checklist wording; deterministic rules remain visible and testable.
- Data boundary: anonymous analysis is supported; saving reports requires authentication and explicit user action.
- Visual direction: minimal dark interface, high contrast, compact dashboard layout, and restrained motion.

### Product promise

Your second opinion before applying.

### What Hunch does not promise

- It does not prove that a company or listing is legitimate.
- It does not make legal, employment, or financial decisions for the student.
- It does not guarantee that a low-risk listing is safe.
- It does not publicly accuse a company, recruiter, or individual of fraud.
- It does not replace a school coordinator, guardian, mentor, or independent verification.

## 01. Product definition and real problem

### The problem

Students searching for OJT often encounter listings through social media, messaging apps, school groups, and public career pages. These posts may be incomplete, informal, or intentionally deceptive. A student may not know whether a request for a fee, personal email, urgent reply, or sensitive document is normal.

The problem is not only detecting scams. It is helping a student pause, understand the signals, and choose a safer next action before the opportunity becomes costly.

### Problem-to-response map

| Observed problem | Why it matters | Hunch response |
| --- | --- | --- |
| Students see posts without enough context. | A quick decision can lead to money loss or exposed documents. | Surface missing information and recommend verification steps. |
| Warning signs are scattered across the post. | A student may notice one signal but miss a pattern. | Group findings into understandable red-flag categories. |
| A simple fake-or-real label is too confident. | False positives can reject valid opportunities; false negatives can create harm. | Show a risk estimate with evidence, uncertainty, and next actions. |
| Students find public listing pages. | Finding and comparing the relevant text adds friction. | Safely extract readable public HTML with a paste-text recovery path. |
| Students need to compare opportunities. | The safer-looking option may not be the most obvious one. | Save reports and compare scores, evidence, and missing details. |

### Sharp problem statement

Students need a fast way to identify and understand warning signals in OJT and internship listings before they apply. Hunch makes those signals visible and actionable without pretending to deliver certainty.

## 02. Users, jobs, and positioning

### Primary user

An individual student who is actively looking for an OJT placement and may be evaluating posts from Facebook, Messenger, email, LinkedIn, school groups, or forwarded messages.

### Secondary users

- A student comparing several opportunities before choosing where to apply.
- A school coordinator or mentor reviewing a listing with a student.
- A parent or guardian helping a student assess a suspicious request.

### Jobs to be done

- When I find an unfamiliar OJT post, help me check its visible warning signs quickly.
- When Hunch flags something, explain what in the post caused the warning.
- When the result is uncertain, tell me what to verify before I proceed.
- When I find several opportunities, help me compare their risk signals.
- When I return later, let me review the reports I intentionally saved.

### Positioning

| Hunch is | Hunch is not |
| --- | --- |
| A student safety and decision-support tool | A job board or recruiting marketplace |
| An explainable risk estimator | A fraud verdict or legal authority |
| A quick second opinion before applying | A replacement for independent verification |
| A structured checklist for safer next steps | A public company-rating or accusation platform |

## 03. End-to-end product workflow

The product should feel like a short, visible sequence. Analysis is the primary action; education and history support that action.

### Six-stage flow

| Stage | Student action | Hunch response |
| --- | --- | --- |
| 01. Submit | Paste a listing or enter a public link. | Accept the input and show what will be analyzed. |
| 02. Review | Inspect the rule-based result and evidence. | Make extraction limits and uncertainty visible before action. |
| 03. Analyze | Start the check. | Run deterministic rules, then request structured AI explanations. |
| 04. Understand | Read score, level, evidence, and missing details. | Explain each signal in plain language and show its effect on the score. |
| 05. Verify | Complete practical checks before applying. | Generate a checklist based on the actual findings. |
| 06. Save or compare | Save the report or compare it with another listing. | Persist only after explicit consent and keep the report private. |

### Detailed workflow contract

| Stage | Input | Output | Exit gate |
| --- | --- | --- | --- |
| 1. Analyzer intake | Pasted text, optional source label, or public link | Normalized text, source type, input quality state | User can see what will be analyzed. |
| 2. Link extraction | Static public HTML and page title | Readable text or manual-paste recovery | Unsafe or unreadable pages are never analyzed. |
| 3. Rule scan | Normalized listing text | Deterministic findings, categories, score impacts, matched evidence | Every rule result has a stable category and explanation key. |
| 4. AI explanation | Listing text plus rule findings | Summary, cautious interpretation, evidence mapping, tailored checklist | Structured response validates against the response schema. |
| 5. Result review | Score, findings, and context | Risk level, expanded warnings, missing information, next actions | Student can explain why the result received its level. |
| 6. Persistence | Accepted report and optional source URL | Private saved analysis with version metadata | RLS prevents access by other users. |
| 7. Comparison | Two or more saved reports | Side-by-side signal and score comparison | Comparison does not imply that the lower score is guaranteed safe. |

### Core UX rule

Never hide uncertainty behind a polished score. Label what was found in the text, what was inferred, what was not provided, and what the student should verify independently.

## 04. What Hunch produces

### Analysis report

Every report should contain:

- Risk score from 0 to 100.
- Risk level: Low risk (0-30), Caution (31-65), or High risk (66-100).
- Plain-language summary.
- Red flags grouped by category.
- Matched evidence from the submitted post.
- Score impact for each finding.
- Missing information that prevents stronger confidence.
- Recommended next actions.
- Before-applying checklist.
- Analysis version and timestamp.

### Red-flag object

Each red flag should be renderable as structured data:

```text
category, title, severity, explanation, evidence, scoreImpact,
confidence, nextAction, ruleId, source
```

`source` distinguishes `rule`, `ai-supported`, and `user-confirmed`. The UI should not present AI-supported findings as independently verified facts.

### Saved report

A saved report is a private snapshot of the analysis, not a live verdict. It should preserve the submitted text, score, findings, checklist state, analysis version, and created date so a later rule change does not silently rewrite history.

## 05. AI experience and architecture

### Recommended pattern

Use one server-side analysis workflow with several explicit stages. The stages can be separate model calls when needed, but the product should not present unnecessary autonomous agents.

| Stage | Responsibility | Structured result | Validation |
| --- | --- | --- | --- |
| Intake normalizer | Clean whitespace, identify source type, detect low-quality input. | `NormalizedInput` | Required text fields and input limits. |
| Rule engine | Detect known signals deterministically. | `RuleFinding[]` | Stable rule IDs and score bounds. |
| Risk interpreter | Explain the pattern without claiming certainty. | `RiskSummary` | Tone, evidence references, and risk vocabulary checks. |
| Checklist builder | Convert findings and missing details into actions. | `ChecklistItem[]` | Action must be specific and non-accusatory. |
| Critic pass | Find unsupported claims, mismatched evidence, or contradictions. | `ReviewFinding[]` | Critical issues block rendering or fall back safely. |

### Architecture principle

Keep accepted analysis state as structured data. Render the report from validated objects so the score, findings, checklist, and saved record cannot drift apart.

### Fallback order

1. Run deterministic rules.
2. Request structured AI interpretation.
3. Validate the response.
4. If the AI call fails, render the rule result with a short safe fallback summary.
5. If rule processing fails, show an input error and do not invent a result.

## 06. OpenAI API plan

Use OpenAI on the server side to turn rule findings into careful explanations and tailored verification actions.

| Capability | Hunch use | Boundary |
| --- | --- | --- |
| Structured response | Return summary, findings, and checklist in a known schema. | Schema validity does not guarantee factual correctness. |
| Server-side request | Keep the API key away from the browser. | Never place the key in Vite client environment variables. |
| Streaming or progress | Show analysis stages only when backend events support them. | Do not fake precise progress percentages. |
| Public-link extraction | Server-side static HTML path after paste analysis is stable. | Let students analyze public pages with manual-paste recovery. |
| Safety review | Filter or soften unsupported accusations and sensitive-data handling. | Hunch should describe signals in a post, not label people criminals. |

### Request sequence

1. Normalize and limit the input.
2. Run local rules and calculate the initial score.
3. Send the post plus structured findings to the server-side OpenAI route.
4. Validate the structured response.
5. Reconcile AI wording with deterministic evidence.
6. Render the report and allow explicit save.

### Cost and reliability controls

- Set input and output length limits.
- Cache or reuse results only when the input and analysis version match.
- Do not call AI for empty or obviously invalid input.
- Log latency, failures, and schema-repair attempts without storing unnecessary sensitive content.
- Version prompts and response schemas together.
- Keep a deterministic sample result for demos and API outage fallback.

## 07. Supabase data and security plan

### Minimum data model

| Entity | Important fields | Purpose |
| --- | --- | --- |
| `profiles` | `id`, `display_name`, `created_at` | Optional account metadata. |
| `analyses` | `id`, `user_id`, `source_type`, `original_text`, `risk_score`, `risk_level`, `summary`, `analysis_version`, `created_at` | Private saved report snapshot. |
| `red_flags` | `id`, `analysis_id`, `rule_id`, `category`, `title`, `severity`, `explanation`, `evidence`, `score_impact`, `confidence` | Explainable findings. |
| `checklist_items` | `id`, `analysis_id`, `label`, `reason`, `completed`, `position` | Report-specific actions. |
| `analyses.source_url` | Canonical public source URL | Optional source context for a saved report. |
| `scam_patterns` | `id`, `category`, `title`, `description`, `example`, `safety_tip` | Curated Scam Guide content. |

### Security requirements

- Enable Row Level Security on every user-owned table.
- Require `auth.uid() = user_id` for reads, writes, updates, and deletes.
- Never expose service-role credentials in the frontend.
- Never automatically store extracted page content; persist only an explicitly saved report.
- Allow anonymous analysis without creating a saved database row.
- Provide a clear delete-data action for saved reports and assets.

## 08. MVP boundaries

### Build now

- Analyzer-first home screen.
- Pasted listing analysis for anonymous users.
- Deterministic red-flag detection.
- Explainable risk score and score breakdown.
- Server-side OpenAI summary and checklist generation.
- Sign in and save analysis.
- Private saved reports.
- Scam Guide and reusable checklist content.
- Responsive dark UI with loading, empty, error, and success states.

### Build after the core flow is stable

- Public-link extraction with static HTML and manual-paste recovery.
- Side-by-side comparison of saved reports.
- PDF report export for a school coordinator or mentor.
- Company-domain verification helper.
- Analytics about a student's own saved patterns.

### Explicitly out of scope for the first release

- Guaranteed fraud detection.
- Public company or recruiter ratings.
- Automatic outreach to employers or schools.
- Browser extension.
- Full job-search marketplace.
- Legal advice or employment-policy interpretation.
- Unmoderated public reports.
- Fine-tuning or a vector database before a measured dataset exists.

## 09. UI and visual direction

The first viewport must immediately communicate what Hunch does and let a student begin.

| Element | Direction | Guardrail |
| --- | --- | --- |
| Palette | Deep neutral background, cool blue actions, green/amber/red status colors. | Status color is paired with labels and icons. |
| Layout | Analyzer first, result panel beside or below it, compact dashboard density. | Do not make users navigate through a marketing landing page first. |
| Typography | Highly legible sans-serif with restrained hierarchy. | Avoid decorative type in analysis content. |
| Shape | Thin borders, modest 8px radius, limited elevation. | Avoid nested card stacks and ornamental glass effects. |
| Motion | Short input, analysis, score reveal, and expand/collapse transitions. | Motion communicates state; it does not disguise waiting. |
| Empty state | Sample post and clear paste/upload action. | Empty state should still make the analyzer actionable. |
| Result state | Score, level, summary, warnings, evidence, checklist. | Keep the score near the explanation, not isolated as decoration. |

## 10. Risks and mitigations

| Risk or hard question | Honest answer | MVP mitigation |
| --- | --- | --- |
| Is Hunch just ChatGPT with a score? | It will feel that way if every result is free-form. | Keep rules, score impacts, evidence, schemas, and checklist actions visible. |
| Can a low-risk result be trusted? | No. A post can omit information or use a new tactic. | Use risk estimate language and always show independent verification steps. |
| Will students overreact to false positives? | Some legitimate posts use informal channels or personal emails. | Explain evidence and confidence; do not use a single signal as a verdict. |
| Can AI invent a company fact? | Yes, if prompts allow open-ended claims. | Restrict explanations to submitted evidence and label missing information. |
| Could a public page expose sensitive data? | It may include names, contact details, or application instructions. | Do not cache pages and save only student-approved reports. |
| Is the scope too broad? | Link extraction, comparison, guides, and auth can slow the core analyzer. | Keep paste-text analysis as the release gate; add extensions only after it is reliable. |
| Does a risk score create false authority? | A number can look more certain than it is. | Show score methodology, ranges, evidence, uncertainty, and next actions together. |

## 11. Validation and success criteria

### Validation layers

| Layer | Method | Minimum evidence |
| --- | --- | --- |
| Problem | Talk to 5-8 students currently looking for OJT. | At least 4 describe repeated uncertainty or exposure to suspicious posts. |
| Workflow | Observe first-time users analyzing safe, suspicious, and incomplete listings. | At least 4 of 5 complete the core flow without facilitator rescue. |
| Detection | Run a labeled fixture set through the rule engine. | Expected high-signal warnings appear with stable categories and score bounds. |
| Explainability | Ask users to explain why a listing received its result. | Users can identify the evidence and the recommended next step. |
| Reliability | Simulate AI timeout, invalid JSON, empty input, and link extraction failure. | The app returns a useful fallback or clear recovery path every time. |

### Core metrics

- Time from opening the app to a readable result.
- Percentage of analyses with an explanation tied to visible evidence.
- Rule fixture precision and recall for the initial labeled sample set.
- Percentage of users who complete at least one recommended verification step.
- Save success rate and report retrieval success rate.
- Critical accessibility issues found in keyboard and mobile review.
- API failure rate and median analysis latency.

### Acceptance checklist

- A first-time student can paste a post and understand the result without prior explanation.
- Every score-changing finding has a category, evidence, explanation, and next action.
- High-risk wording never claims certainty or criminality.
- The AI route is server-side and schema-validated.
- Anonymous analysis works without saving private content.
- A signed-in user can save, reopen, compare, and delete their own report.
- The main flow works on a narrow mobile viewport without overlap or horizontal scrolling.

## 12. Build phases and team roles

The project is intentionally sequenced around proving the analyzer loop first. Each phase has a defined outcome, workstreams, deliverables, dependencies, and exit gate. Do not advance because the calendar says so; advance when the gate is met.

### Phase 1: Product definition and scope lock

Outcome: one stable product promise, target user, trust boundary, and MVP contract.

Workstreams:

- Confirm the student OJT scenario and the first three listing sources to support.
- Define risk terminology: estimate, signal, caution, and high risk.
- Decide what evidence is required for a finding to affect the score.
- Write the disclaimer, privacy expectations, and non-goals.
- Create 6-10 representative fixtures: safe-looking, suspicious, incomplete, and adversarial.

Deliverables:

- Product brief and one-sentence promise.
- MVP and future-scope list.
- Risk vocabulary and trust-boundary copy.
- Initial fixture set with expected findings.
- Draft acceptance checklist.

Dependencies: none.

Exit gate: the MVP can be explained in under one minute, every core feature has a reason to exist, and the fixture set covers the intended risk categories.

### Phase 2: Information architecture and user-flow contract

Outcome: a complete, reviewable map from opening Hunch to saving or discarding a result.

Workstreams:

- Map Analyze, Result, Saved, Compare, Scam Guide, Checklist, and Settings.
- Define anonymous and signed-in behavior.
- Define the public-link path separately from the paste-text path.
- List all input, loading, partial, empty, error, retry, save, delete, and sign-out states.
- Write the route and navigation contract before implementation.

Deliverables:

- Site map.
- User journey diagrams.
- Screen inventory.
- State matrix.
- Route and navigation notes.

Dependencies: Phase 1.

Exit gate: a student can explain what happens after each primary action and no screen depends on an undefined state.

### Phase 3: Research and fixture calibration

Outcome: the product language and initial detection categories reflect real student situations.

Workstreams:

- Conduct short interviews or reviews with students seeking OJT.
- Collect de-identified examples of normal, suspicious, and ambiguous listings.
- Separate observed signals from assumptions about legitimacy.
- Label each fixture with expected categories, evidence spans, and confidence.
- Review language for local context such as school requirements and common messaging channels.

Deliverables:

- De-identified fixture library.
- Category definitions and examples.
- Student vocabulary notes.
- Initial false-positive and false-negative risks.

Dependencies: Phase 1.

Exit gate: each initial rule has at least one positive example, one non-triggering example, and a documented reason for existing.

### Phase 4: UX wireframes and interaction contract

Outcome: the first-viewport analyzer and result report are understandable before visual polish.

Workstreams:

- Wire the analyzer with paste, upload, sample, clear, and analyze actions.
- Wire the result with score, summary, evidence, expandable warnings, and checklist.
- Design the saved report and comparison surfaces.
- Design public-link extraction and the manual-paste fallback.
- Check the layout at mobile, tablet, and desktop widths.

Deliverables:

- Low-fidelity wireframes.
- Annotated interaction flows.
- Responsive layout rules.
- Copy deck for key states.

Dependencies: Phases 1-3.

Exit gate: five-minute usability review shows that users can identify the input action, understand the risk level, and find the next step without narration.

### Phase 5: Visual design system and content design

Outcome: a minimal dark system that makes risk, evidence, and actions readable.

Workstreams:

- Finalize palette, typography, spacing, shape, borders, and elevation.
- Define accessible status colors and non-color indicators.
- Define score visualization for low risk, caution, and high risk.
- Write direct, non-alarmist UI copy.
- Define motion timing and reduced-motion behavior.
- Build a component inventory from the wireframes.

Deliverables:

- Token sheet.
- Component states and variants.
- Risk-status rules.
- Content and disclaimer rules.
- Annotated representative screen.

Dependencies: Phase 4.

Exit gate: the analyzer and result report look like one coherent product, and contrast/readability checks pass for core content.

### Phase 6: Frontend foundation and developer workflow

Outcome: a maintainable React and TypeScript base that can absorb the product flow.

Workstreams:

- Confirm Vite, TypeScript, routing, and styling conventions.
- Create folders for components, pages, services, domain rules, types, and test fixtures.
- Add linting, formatting, type checking, and build scripts.
- Define shared result types and client service interfaces.
- Add environment-variable examples without secrets.
- Establish a local mock service for analysis responses.

Deliverables:

- Working app shell and routes.
- TypeScript domain types.
- Mock analysis service.
- Lint, typecheck, and build commands.
- README setup notes.

Dependencies: Phases 1-5.

Exit gate: a new contributor can install, run, typecheck, lint, and build the project from the README.

Implementation note: this foundation is now present in `src/app`, `src/pages`, `src/services`, `src/types`, and `src/data`, with the fixture-backed mock flow documented in the repository README. Supabase and server-side OpenAI integration remain intentionally deferred to their later phases.

### Phase 7: Static UI and interaction build

Outcome: the complete product flow works with controlled mock data.

Workstreams:

- Build analyzer-first home screen.
- Build result report with score and expandable red flags.
- Build checklist interactions and completion state.
- Build Saved, Compare, Scam Guide, and Settings views with realistic content.
- Implement responsive behavior and keyboard focus states.
- Add loading, empty, error, retry, and no-results states.

Deliverables:

- Clickable frontend flow.
- Mock fixtures for safe, caution, high-risk, and incomplete results.
- Responsive component states.
- Visual regression screen captures for key screens.

Dependencies: Phase 6.

Exit gate: a reviewer can demo the full journey without backend services and no core state is represented only by a happy-path screen.

Implementation note: Phase 7 now provides a controlled mock-data journey across Analyze, Saved, Compare, Scam Guide, Checklist, Settings, and Auth. Report evidence, checklist completion, filters, comparison selection, deletion confirmation, and authentication preservation are represented as interactive client states; backend persistence and public-link extraction remain deferred to Phases 10 and 11.

### Phase 8: Rule-based detection engine

Outcome: Hunch has a transparent, testable baseline for risk scoring.

Workstreams:

- Implement normalized text preprocessing.
- Add rules for fees, personal or mismatched emails, vague company identity, vague role, unrealistic compensation, urgency, chat-only hiring, and early sensitive-document requests.
- Define category severity, score impact, evidence matching, and deduplication.
- Cap and normalize the final score to 0-100.
- Record rule version and matched text spans.
- Add unit and fixture tests.

Deliverables:

- Rule engine module.
- Rule catalog with IDs and rationale.
- Score calculation and breakdown.
- Fixture test suite.
- Deterministic sample reports.

Dependencies: Phases 1, 3, 6, and 7.

Exit gate: every score-changing result is explainable, known fixtures trigger expected findings, and the engine behaves safely on empty or very long input.

Implementation note: the deterministic engine is implemented in `src/services/ruleEngine.ts` with the catalog in `src/data/ruleCatalog.ts`. It normalizes text, records matched spans, suppresses explicit negation, handles personal-email context, deduplicates categories, caps scores at 100, and is covered by executable fixture calibration tests.

### Phase 9: OpenAI analysis API

Outcome: AI adds useful, evidence-bound explanation without becoming the source of truth for the score.

Workstreams:

- Create a secure Vercel serverless route.
- Define request and response schemas.
- Send normalized text and rule findings, not unsupported external claims.
- Generate summary, uncertainty statement, evidence explanations, and tailored checklist items.
- Validate output and repair or fall back when invalid.
- Add timeout, rate, and input-length handling.
- Log non-sensitive operational metadata.

Deliverables:

- Server-side OpenAI service.
- Versioned prompts and schemas.
- Validated response mapper.
- Rule-only fallback path.
- API failure fixtures and tests.

Dependencies: Phases 6-8 and current official OpenAI API documentation checked at implementation time.

Exit gate: API keys never reach the browser, invalid or unavailable AI output leaves the report usable, and AI explanations cite only available evidence.

Implementation note: Phase 9 is implemented in `api/analyze.ts`, `src/services/openaiAnalysisService.ts`, and `src/services/openaiAnalysisSchema.ts`. The server recomputes the deterministic result, uses Responses Structured Outputs, and returns only schema-safe AI explanation content. The client preserves the rule score and evidence and falls back automatically when the route or provider is unavailable. Public-link extraction follows in Phase 11.

### Phase 10: Supabase authentication and persistence

Outcome: students can privately save and revisit analysis reports.

Workstreams:

- Create Supabase project and environment configuration.
- Add Auth with a low-friction sign-in path.
- Create tables, indexes, foreign keys, and migration files.
- Add RLS policies and test them with multiple users.
- Save report snapshots, checklist state, and analysis version.
- Add delete report and delete optional asset flows.

Deliverables:

- Database migrations.
- Auth screens and session handling.
- Save/open/delete services.
- RLS policy tests.
- Privacy and retention copy.

Dependencies: Phases 6-9.

Exit gate: anonymous users can analyze, signed-in users can save and reopen, and a second user cannot read or modify the first user's reports.

Implementation note: the browser client, email magic-link flow, saved-report mapper, child red-flag/checklist persistence, delete/sign-out handling, local environment template, and initial RLS migration are now present. The migration must be run in the Supabase SQL Editor before remote persistence can succeed.

### Phase 11: Public-link analyzer

Outcome: students can analyze readable public listing pages without relying on image-text extraction.

Workstreams:

- Add a public HTTP/HTTPS link mode beside pasted text.
- Fetch static readable HTML through a server-only route.
- Reject private, login-protected, non-HTML, oversized, and unavailable pages with manual-paste recovery.
- Preserve canonical source URLs and page titles when a report is saved.
- Test redirect, SSRF, extraction, and deterministic-analysis behavior.

Deliverables:

- Public-link input flow.
- Server-side readable-HTML extraction.
- SSRF and redirect protections.
- Source-link persistence.
- Link failure recovery tests.

Dependencies: Phases 7, 8, and 10.

Exit gate: only public static HTML is analyzed, unsafe or unreadable pages recover cleanly to pasted text, and saved source URLs remain private under RLS.

Implementation note: Phase 11 uses `api/extract-link.ts` with static HTML parsing, a 10-second timeout, a 1 MB limit, redirect limits, and private-network blocking. No image uploads, image-text services, or scraping-provider keys are used. See `docs/20-public-link-analyzer.md`.

### Phase 12: Comparison, Scam Guide, and checklist depth

Outcome: Hunch supports the decision after the first score without expanding into a job board.

Workstreams:

- Add saved-report filters and sorting by risk level, source, and date.
- Build side-by-side comparison of score, findings, missing information, and completed checks.
- Write curated Scam Guide content from the rule catalog.
- Add reusable checklist templates and report-specific items.
- Keep comparison language cautious and evidence-based.

Deliverables:

- Saved report list and detail views.
- Comparison view.
- Scam Guide entries.
- Checklist templates and completion state.

Dependencies: Phases 8 and 10.

Exit gate: a student can compare two saved listings without interpreting the lower score as a guarantee of safety.

Implementation note: Phase 12 uses the existing saved-report, rule-finding, and checklist data. It adds saved-report search, filters, and sorting; comparison of two or more selected reports; all rule-catalog Scam Guide entries; a reusable session checklist; and report-specific checklist progress. No Supabase schema change is required.

### Phase 13: Safety, privacy, accessibility, and abuse review

Outcome: the product handles uncertainty and sensitive content responsibly.

Workstreams:

- Review every user-facing claim about legitimacy, fraud, and safety.
- Check prompt behavior for unsupported company claims or invented facts.
- Review public-link and text retention behavior.
- Add rate limits and abuse controls appropriate for anonymous analysis.
- Test keyboard navigation, focus order, contrast, labels, reduced motion, and mobile text wrapping.
- Review deletion, sign-out, and error recovery.

Deliverables:

- Safety review log.
- Privacy and deletion copy.
- Accessibility findings and fixes.
- Abuse and rate-limit notes.
- Final disclaimer and help content.

Dependencies: Phases 9-12.

Exit gate: the app gives cautious guidance, protects user-owned data, and has no critical keyboard, contrast, privacy, or unsupported-claim issue.

Implementation note: Phase 13 adds server-side abuse controls for anonymous OpenAI explanation and public-link extraction requests, clarifies privacy/deletion copy, adds skip-link and live-status accessibility support, honors reduced-motion preferences, and records the safety review in [`docs/21-safety-privacy-accessibility.md`](21-safety-privacy-accessibility.md). No Supabase schema change is required.

### Phase 14: Testing, QA, deployment, and portfolio proof

Outcome: a stable, explainable, live project that can be evaluated in a short demo.

Workstreams:

- Run unit, integration, end-to-end, and manual fixture tests.
- Test fresh-browser setup, auth boundaries, API outages, link extraction failure, and delete flows.
- Check desktop and mobile screen captures for overlap, clipping, and unreadable content.
- Configure Vercel, Supabase production settings, secrets, and redirects.
- Deploy and run a clean-browser smoke test.
- Write README, architecture notes, screen captures, demo script, and known limitations.

Deliverables:

- QA checklist and issue log.
- Production deployment.
- Environment and rollback notes.
- Portfolio README and screen captures.
- Three-minute demo path plus deterministic fallback.

Dependencies: all prior phases.

Exit gate: a first-time reviewer can analyze a fixture, understand the result, review the checklist, and see the product's technical boundaries within five minutes.

## 13. Team roles and working cadence

For a solo student project, these are hats rather than separate people.

| Role | Owns | Focus |
| --- | --- | --- |
| Product and research | Scope, student interviews, fixtures, acceptance criteria | Keep the problem narrow and grounded. |
| Frontend and design | App flow, dark system, responsive states, content | Make the analyzer feel immediate and trustworthy. |
| AI and backend | Rules, prompts, schemas, API route, fallback | Make analysis explainable and observable. |
| Data and security | Supabase schema, RLS, storage, deletion | Protect private reports and source URLs. |
| QA and demo | Fixtures, failure tests, screen captures, README, rehearsal | Prove the product works beyond the happy path. |

### Engineering checkpoints

- Keep at least three golden fixtures: safe-looking, suspicious, and incomplete.
- Version rule IDs, prompt versions, response schemas, and saved report format together.
- Test malformed input, empty input, long input, model timeout, invalid JSON, and partial persistence.
- Keep a deterministic sample result for the live demo.
- Review privacy copy before enabling public-link persistence.
- Make the result understandable with AI disabled.

## 14. Demo story and portfolio narrative

### Three-minute demo

| Time | Action | What the audience learns |
| --- | --- | --- |
| 0:00-0:20 | Open Hunch and show the analyzer immediately. | The product starts with the student's real task. |
| 0:20-0:45 | Paste a suspicious OJT post containing a fee request and vague role. | Hunch accepts realistic, messy input. |
| 0:45-1:15 | Run analysis and reveal the risk score. | The score is only the beginning of the explanation. |
| 1:15-1:55 | Expand warnings to show matched evidence and score impact. | The result is traceable rather than a black-box label. |
| 1:55-2:25 | Complete verification checklist items. | Hunch turns concern into safer next actions. |
| 2:25-2:45 | Save the report and compare it with a lower-risk listing. | The product supports a real decision, not just one scan. |
| 2:45-3:00 | Show architecture and limitations. | The project uses AI carefully and does not claim certainty. |

### Portfolio proof points

- A staged AI workflow with structured output and fallback behavior.
- A deterministic detection layer that makes the score explainable.
- Supabase Auth, Postgres, RLS, and optional private storage.
- A responsive analyzer-first interface with clear state design.
- Safety, privacy, accessibility, and uncertainty handled as product requirements.

## 15. Decision log and implementation notes

| Decision | Reason |
| --- | --- |
| React + TypeScript | Strong fit for a typed, interactive frontend and portfolio demonstration. |
| Supabase | Provides Auth, Postgres, RLS, and storage without building a custom backend from scratch. |
| OpenAI through a server route | Adds structured explanation while keeping secrets and control on the server. |
| Vercel | Fits the React frontend and serverless API deployment model. |
| Rule engine before AI | Creates a transparent baseline and prevents the score from depending on prose generation. |
| Paste text before public links | Proves the core product loop before adding remote content extraction complexity. |
| Private saved reports | Gives history value without creating a public accusation system. |

### Final scope test

If a feature does not help a student analyze a listing, understand the evidence, choose a safer next step, or review a private decision later, it should not be part of the first Hunch release.
