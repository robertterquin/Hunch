# Information Architecture

## App Structure

Hunch should open directly to the analyzer. The homepage is the product experience, not a separate landing page.

Primary navigation:

- Analyze
- Saved
- Scam Guide
- Checklist
- Settings

## Primary Screens

### Analyze

The main screen where students paste an OJT post, upload a screenshot, or try a sample listing.

Content:

- Paste input
- Screenshot upload
- Source selector
- Analyze button
- Recent or sample risk indicators
- Results panel after analysis

### Analysis Result

Shows the generated safety report for one listing.

Content:

- Risk score
- Risk level
- Summary
- Red flag list
- Score breakdown
- Safe vs risky comparison
- Checklist
- Save report action

### Saved

A history page for signed-in users.

Content:

- Saved analyses
- Risk score
- Date analyzed
- Source channel
- Status tags
- Search and filters

### Scam Guide

An educational library of common OJT and internship scam patterns.

Content:

- Payment request scams
- Fake HR or recruiter messages
- WhatsApp-only recruitment
- Certificate-selling internships
- Unrealistic allowance or salary posts
- Vague company identity

### Checklist

A reusable pre-application checklist.

Content:

- Company verification
- Email/domain verification
- Role clarity checks
- Payment warning checks
- Document safety checks
- School or adviser confirmation

### Settings

Account and privacy controls.

Content:

- Profile
- Saved data preferences
- Delete saved analyses
- Sign out

## Core Data Objects

### User

- id
- email
- display_name
- created_at

### Analysis

- id
- user_id
- source_type
- original_text
- extracted_text
- risk_score
- risk_level
- summary
- created_at
- saved_status

### Red Flag

- id
- analysis_id
- category
- title
- explanation
- severity
- score_impact
- matched_text

### Checklist Item

- id
- analysis_id
- label
- reason
- completed

## Navigation Rules

- First-time visitors land on Analyze.
- Anonymous users can run an analysis.
- Saving an analysis requires sign in.
- Result pages should remain understandable even if the user has not created an account.
- The app shell should keep navigation minimal so the analyzer stays visually dominant.

## Phase 2 Route Contract

The route contract is framework-independent and must be established before frontend implementation.

| Route | Screen owner | Access | Primary purpose |
| --- | --- | --- | --- |
| `/` | Analyze | Public | Redirect to `/analyze`. |
| `/analyze` | Analyze and active result panel | Public | Accept pasted text, source selection, samples, and completed reports. |
| `/analyze/review` | Screenshot review | Public | Review and edit OCR text before analysis. |
| `/saved` | Saved analyses | Signed in | Browse, search, filter, and delete private reports. |
| `/saved/:analysisId` | Saved analysis detail | Signed in | Reopen one saved report with breadcrumbs. |
| `/compare` | Comparison | Signed in | Compare two or more selected saved reports. |
| `/guide` | Scam Guide | Public | Browse curated scam patterns. |
| `/guide/:patternId` | Scam pattern detail | Public | Read a pattern and send its sample to Analyze. |
| `/checklist` | Reusable checklist | Public | Complete general before-applying checks. |
| `/settings` | Settings | Signed in | Manage profile, privacy, deletion, and sign-out. |
| `/auth/sign-in` | Sign in | Public | Authenticate before private actions. |
| `/auth/sign-up` | Sign up | Public | Create an account for saved reports. |
| `/auth/reset` | Password reset | Public | Recover account access when supported. |

The anonymous result remains on `/analyze` as an active in-memory report. A persisted report is opened through `/saved/:analysisId` after authentication and explicit save consent.

## Screen Ownership and Access

| Action | Anonymous behavior | Signed-in behavior |
| --- | --- | --- |
| Analyze pasted text | Allowed without account. | Allowed without account requirement. |
| Review screenshot text | Allowed; low-confidence OCR requires review. | Same behavior. |
| View result | Full report remains available. | Full report remains available. |
| Save result | Open sign-in while preserving the report. | Save a private report snapshot. |
| Saved reports | Redirect to sign-in with return destination. | List, open, filter, search, and delete own reports. |
| Compare reports | Redirect to sign-in. | Require two or more selected saved reports. |
| Scam Guide | Browse and use samples. | Same behavior. |
| General checklist | Available. | Available and reusable. |
| Analysis-specific checklist | Available while the active result exists. | Saved with the report after consent. |
| Sign out | Not available. | Clear private session data but preserve any unsaved active result. |

## Navigation Invariants

- Hunch opens directly on Analyze; there is no marketing landing page before the tool.
- Every primary action either has a route, changes a documented state, or shows an actionable error.
- Guide samples populate Analyze but never bypass input review or analysis validation.
- A lower risk score is never described as proof of safety.
- Saved analysis details use `Saved > report title > Analysis report` breadcrumbs.
