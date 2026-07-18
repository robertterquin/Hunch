# Fixture Calibration

## Purpose

This document defines the Phase 3 calibration set for Hunch. The fixtures are synthetic, de-identified examples used to align product language, rule behavior, UI states, and future tests.

They are not evidence about real companies or a measurement of scam frequency. A fixture describes visible signals in a submitted post; it does not establish whether a real opportunity is legitimate or fraudulent.

The machine-readable fixture library is stored in `fixtures/hunch-analysis-fixtures.json`.

## Fixture Inventory

| Fixture | Scenario | Expected result | Main use |
| --- | --- | --- | --- |
| `safe-01` | Clear company, role, schedule, supervisor, official domain, and no payment or sensitive-data request. | Low risk, high confidence. | Baseline non-triggering example for every category. |
| `suspicious-01` | Fee request, personal email, vague company and role, guaranteed income, urgency, WhatsApp-only hiring, and early sensitive-data request. | High risk, high confidence. | Positive example for every initial category. |
| `incomplete-01` | Forwarded post with missing company, role, schedule, and official application details. | Caution, medium confidence. | Partial evidence and uncertainty behavior. |
| `informal-01` | Personal email appears, but the role, public domain, school path, and privacy boundary are clear. | Low risk or low caution, medium confidence. | False-positive calibration for informal channels. |

All fixture text uses fictional names and `.example` domains. No fixture contains real personal contact information, government identifiers, or private screenshots.

## Student Vocabulary Notes

Use language students are likely to recognize:

- Use `OJT`, `internship`, `placement`, `listing`, `post`, `recruiter`, `supervisor`, `school coordinator`, and `application channel`.
- Say `pay before starting` instead of `upfront financial obligation`.
- Say `company identity is unclear` instead of `entity verification failure`.
- Say `the role details are missing` instead of `insufficient occupational metadata`.
- Say `verify through the official company or school channel` instead of `perform independent OSINT`.
- Say `risk signal`, `caution`, and `missing information` instead of `proof`, `fraud verdict`, or `malicious actor`.

Avoid claims such as `definitely a scam`, `definitely safe`, `criminal`, or `guaranteed legitimate`. The result should explain what was visible, what was not provided, and what the student should verify.

## Category Calibration Rules

Each initial category has one positive and one non-triggering example in the fixture library. The expected behavior is:

| Category | Positive behavior | Non-triggering behavior | Confidence rule |
| --- | --- | --- | --- |
| Payment request | Strong warning when payment is required before starting. | Do not flag an explicit no-fee statement. | High when a fee and pre-start timing are both present. |
| Suspicious email | Surface a personal or mismatched recruiter address. | Do not treat a personal email as proof of fraud. | Medium unless combined with other signals. |
| Vague company | Ask for company identity and official verification. | Accept a named company with a public domain as visible evidence. | Increase confidence when identity is absent across the post. |
| Vague role | Explain that duties, schedule, or supervisor details are missing. | Do not flag a specific responsibility list. | Medium when broad role language is the only evidence. |
| Unrealistic compensation | Flag guaranteed or unusually high compensation with unclear duties. | Do not use a fixed allowance amount alone as proof. | Increase when pay, urgency, and vague duties co-occur. |
| Urgency pressure | Flag instant hiring, limited slots, or no-interview pressure. | Do not flag a normal application deadline alone. | Medium unless combined with payment or data requests. |
| Chat-only hiring | Flag exclusive WhatsApp or Messenger hiring with no official path. | Do not flag optional chat questions when an official path exists. | Medium by itself; higher with payment or data requests. |
| Sensitive information | Strong warning for IDs, bank details, passwords, or full documents requested early. | Do not flag resume or school endorsement requests alone. | High when sensitive data is requested before verification. |

## Initial Risk Log

| Risk | Type | Mitigation |
| --- | --- | --- |
| The engine matches `fee` inside a sentence that says no fee is required. | False positive | Add negation fixtures and inspect matched text before scoring. |
| A legitimate small organization uses Gmail or a chat app. | False positive | Treat personal email and chat channels as verification signals, not standalone verdicts. |
| A forwarded post omits details that exist in the original listing. | False positive | Use caution language and ask the student to verify missing context. |
| A scam avoids the initial keyword list. | False negative | Keep a visible uncertainty statement and version the rule catalog for later additions. |
| A high allowance is normal for a specialized placement. | False positive | Require compensation ambiguity or mismatch with role details before escalating. |
| A legitimate employer requests documents during later onboarding. | False positive | Evaluate request timing and context, not document names alone. |
| A student treats a low score as approval. | Product risk | Keep the disclaimer, evidence, missing information, and verification checklist near the score. |

## Fixture Review Checklist

- Every category has a positive example.
- Every category has a non-triggering example.
- Positive examples include evidence text that can be highlighted.
- Non-triggering examples include known negation or context risks where relevant.
- Safe-looking fixtures do not use real company or personal data.
- Incomplete fixtures produce caution or uncertainty rather than an automatic high-risk verdict.
- Each expected result includes a score range, confidence, missing information, and checklist themes.
- Fixture language remains student-friendly and non-accusatory.

## Phase 3 Exit Gate

The initial fixture library is ready for Phase 4 and Phase 8 when the UI and future rule engine can demonstrate:

1. A low-risk result without claiming safety.
2. A high-risk result with evidence for every detected category.
3. An incomplete result that clearly exposes uncertainty.
4. A legitimate informal-channel example that tests false-positive restraint.
5. Stable expected categories and score ranges for repeatable tests.
