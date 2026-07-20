# Screen Inventory

## Analyze Screen

Purpose:

Let students immediately check an OJT or internship post.

Primary actions:

- Paste post
- Public-link mode
- Try sample post
- Analyze

Required states:

- Empty input
- Typing/pasted text
- Link entered
- Link extraction in progress
- Analysis loading
- Result ready
- Error

## Analysis Result Screen

Purpose:

Show the complete risk report for a submitted listing.

Primary actions:

- Expand warning explanations
- Review score breakdown
- Complete checklist
- Save analysis
- Start new analysis

Required states:

- Low risk
- Medium risk
- High risk
- Partial/uncertain analysis
- Save success
- Save requires sign in

## Saved Analyses Screen

Purpose:

Let users revisit and compare previous analyses.

Primary actions:

- Open saved analysis
- Filter by risk level
- Search by company or post content
- Tag status
- Delete saved report

Required states:

- Empty saved list
- Loading
- Filtered no results
- Saved list

## Scam Guide Screen

Purpose:

Teach students common OJT and internship scam patterns.

Primary actions:

- Browse categories
- Open a scam pattern
- Use sample text in analyzer

Required states:

- Category list
- Pattern detail
- Related checklist items

## Checklist Screen

Purpose:

Give students a reusable before-applying checklist.

Primary actions:

- Mark item complete
- Reset checklist
- Use checklist from a specific analysis

Required states:

- General checklist
- Analysis-specific checklist
- Completed checklist

## Authentication Screens

Purpose:

Allow users to save and sync analyses.

Primary actions:

- Sign up
- Sign in
- Sign out
- Password reset if supported

Required states:

- Auth form
- Loading
- Error
- Redirect back to unsaved result

## Settings Screen

Purpose:

Manage account and saved data.

Primary actions:

- Update profile
- Delete saved analyses
- Sign out

Required states:

- Account loaded
- No saved data
- Confirmation dialog

## Shared System States

- Loading analysis
- Link extraction failed
- OpenAI/API failed
- Network unavailable
- Supabase save failed
- Permission or auth required
- Form validation error

## Phase 2 State Matrix

Every state must expose visible feedback, valid actions, and a recoverable next destination.

Phase 4 wireframes, responsive rules, interaction behavior, and state copy are defined in `docs/15-ux-wireframes-and-interaction-contract.md`.

### Input and analysis states

| State group | State | Visible feedback | Available actions | Next destination |
| --- | --- | --- | --- | --- |
| InputState | Empty | Prompt, source selector, public-link mode, sample action, and disabled Analyze button. | Paste, choose source, use a public link, or use a sample. | Typing, Link ready, or Guide sample. |
| InputState | Ready | Character count and enabled Analyze button. | Edit, clear, change source, analyze. | Loading or Empty. |
| InputState | Too-short | Inline message requiring at least 40 characters. | Add text, use sample, clear. | Ready or Empty. |
| InputState | Link-ready | Valid public URL and Analyze link action. | Edit URL, change mode, analyze. | Loading, error, or result. |
| InputState | Link-error | Clear extraction failure and manual-paste recovery. | Edit URL or switch to paste. | Link-ready or paste input. |
| InputState | Invalid | Field-level explanation of the input problem. | Correct, clear, or paste manually. | Ready, Empty, or `/analyze`. |
| AnalysisState | Idle | No active analysis status. | Edit input, sample, switch input mode, analyze. | Input state. |
| AnalysisState | Loading | Current stage text and disabled duplicate submission. | Wait or cancel when supported. | Complete, fallback, or Error. |
| AnalysisState | Complete | Score, label, summary, evidence, warnings, and checklist. | Expand warnings, complete checklist, save, new analysis. | Active result, saved detail, or Analyze. |
| AnalysisState | Uncertain | Medium-risk or partial result with missing-information explanation. | Review evidence, verify independently, complete checklist. | Active result or Analyze. |
| AnalysisState | Error | Calm error message preserving submitted input. | Retry, use rule-only fallback when available, edit input. | Loading, Complete, or Ready. |
| AnalysisState | Rule-only fallback | Rule findings and a clear reduced-explanation notice. | Review findings, complete checklist, retry AI, save. | Active result or Saved detail. |

### Result and persistence states

| State group | State | Visible feedback | Available actions | Next destination |
| --- | --- | --- | --- | --- |
| ResultState | Low-risk | Low risk label, score, evidence, and verification reminder. | Review, checklist, save, new analysis. | Active result, auth, or Analyze. |
| ResultState | Caution | Caution label, warnings, uncertainty, and next steps. | Expand, checklist, save, new analysis. | Active result, auth, or Analyze. |
| ResultState | High-risk | High risk label, evidence, strong caution, and safe next actions. | Expand, checklist, save, new analysis. | Active result, auth, or Analyze. |
| ResultState | Partial/uncertain | Incomplete evidence notice and missing details. | Add context, review, retry, checklist. | Ready, Loading, or Active result. |
| SaveState | Unsaved | Save action is available with privacy explanation. | Save, new analysis. | Saving or `/auth/sign-in`. |
| SaveState | Auth-required | Sign-in prompt explains that the report will be preserved. | Sign in, sign up, cancel. | Auth route or Active result. |
| SaveState | Saving | Progress feedback and disabled duplicate save. | Wait or retry after failure. | Saved or Save error. |
| SaveState | Saved | Confirmation and private persistence message. | Open report, compare, new analysis. | `/saved/:analysisId`, `/compare`, or `/analyze`. |
| SaveState | Save-error | Error explains that the report remains available locally. | Retry, sign in again, dismiss. | Saving, Auth-required, or Active result. |

### History, authentication, and deletion states

| State group | State | Visible feedback | Available actions | Next destination |
| --- | --- | --- | --- | --- |
| SavedListState | Loading | History loading indicator. | Wait. | Populated, Empty, or Error. |
| SavedListState | Populated | Searchable and filterable saved reports. | Open, select for compare, filter, delete. | Detail, Compare, or Confirmation. |
| SavedListState | Empty | No saved checks message with Analyze action. | Analyze a post. | `/analyze`. |
| SavedListState | Filtered-no-results | Filter explanation and clear-filter action. | Clear filters, search again, analyze. | Populated, Empty, or `/analyze`. |
| SavedListState | Error | History load failure. | Retry, go to Analyze. | Populated, Empty, or `/analyze`. |
| AuthState | Signed-out | Public access with sign-in affordance for private actions. | Analyze, sign in, sign up. | Public route or auth route. |
| AuthState | Form | Labeled auth form and return context. | Submit, cancel, reset password. | Submitting, Error, or return route. |
| AuthState | Submitting | Disabled form and progress feedback. | Wait. | Authenticated or Error. |
| AuthState | Authenticated | User menu and private navigation available. | Saved, settings, sign out. | Private route or Signed-out. |
| AuthState | Error | Field-level auth error with recovery guidance. | Correct, retry, reset password. | Form, Submitting, or Authenticated. |
| DeleteState | Idle | No confirmation shown. | Select delete. | Confirmation. |
| DeleteState | Confirmation | Explains what report and optional assets will be removed. | Confirm or cancel. | Deleting or Idle. |
| DeleteState | Deleting | Disabled duplicate delete and progress message. | Wait. | Deleted or Error. |
| DeleteState | Deleted | Confirmation that the private report was removed. | Analyze, browse remaining reports. | Empty or Populated. |
| DeleteState | Error | Deletion failure with data-preservation notice. | Retry, cancel. | Deleting, Confirmation, or Populated. |
