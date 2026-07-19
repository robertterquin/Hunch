# UX Wireframes and Interaction Contract

## Purpose

This document is the Phase 4 low-fidelity contract for Hunch. It turns the route contract, state matrix, visual foundation, and Phase 3 fixtures into reviewable screens and interactions before visual polish or backend integration.

The first-viewport job is simple: a student can identify where to paste a listing, understand what Analyze does, read the risk level, and find the next verification action without narration.

The canonical route and state definitions remain in:

- `docs/02-information-architecture.md`
- `docs/04-screen-inventory.md`
- `docs/11-motion-system-states.md`

## Wireframe Conventions

- The analyzer is always the primary action.
- Empty and result states share the same input context so a student does not lose the submitted post.
- The score stays beside its explanation; it is never shown as an isolated visual badge.
- Warning cards start collapsed and expand to show evidence, impact, and the next action.
- Supporting pages use the same shell but do not compete with Analyze for first-viewport attention.
- These are layout contracts, not final colors, typography, icons, or component markup.

## Site Flow

```text
Open /
  -> /analyze
      -> paste text -> validate -> analyze -> active result
      -> public link -> extract readable HTML -> active result
      -> save -> signed in? -> save report
                         no -> auth -> return to active result -> save report
      -> saved report -> /saved/:analysisId -> compare or start new analysis
      -> guide sample -> /analyze with sample text loaded
```

## Desktop Wireframes

Target: wide desktop viewport, approximately 1200px or wider.

### Analyze - empty and ready

```text
+----------------------------------------------------------------------------------+
| Hunch                         Analyze   Saved   Scam Guide   Checklist   Account |
| Your second opinion before applying.                              [New analysis] |
+----------------------------------------------------------------------------------+
|                                                                                  |
|  CHECK A LISTING                                          WHAT HUNCH CHECKS       |
|  Paste an OJT or internship post.                       [signal] Payment asks   |
|  We will look for visible risk signals.                  [signal] Email mismatch |
|                                                          [signal] Vague roles     |
|  Source                                                                       |
|  [ Facebook v ]                                                                |
|                                                                                |
|  Paste OJT or internship post                                                  |
|  +--------------------------------------------------------------------------+  |
|  |                                                                          |  |
|  |  Paste the listing, recruiter message, or forwarded post here.          |  |
|  |                                                                          |  |
|  +--------------------------------------------------------------------------+  |
|  0 characters                                              [Clear] [Analyze] |
|  [Paste text | Public link]  [Try a sample post]                              |
|                                                                                |
|  Hunch gives an estimate based on visible signals. It is not proof of safety. |
+----------------------------------------------------------------------------------+
```

Behavior:

- Analyze is disabled until the input contains at least 40 characters.
- `Try a sample post` loads `suspicious-01` but does not submit it automatically.
- `Public link` switches to a URL field and analyzes readable static HTML on submit.
- The right column is a compact preview, not a marketing panel.

### Analyze - active result

```text
+----------------------------------------------------------------------------------+
| Hunch                         Analyze   Saved   Scam Guide   Checklist   Account |
+----------------------------------------------------------------------------------+
|  INPUT                                                     RESULT                |
|  [ Facebook v ]                                            HIGH RISK             |
|  +--------------------------------------+                  82 / 100             |
|  | Submitted listing remains visible.   |                  8 warning signals    |
|  |                                      |                  [Save report]        |
|  +--------------------------------------+                                        |
|  [Start new analysis]                                   Summary                  |
|                                                         This post contains       |
|  RED FLAGS                                               several signals that   |
|  [!] Payment request                         [Expand]     should be verified      |
|  [!] Sensitive information                   [Expand]     before you proceed.    |
|  [!] Urgency pressure                        [Expand]                            |
|                                                         Missing information       |
|  SCORE BREAKDOWN                                        Company identity, role,   |
|  Payment request                         +30             and official website.    |
|  Sensitive information                   +25                                      |
|  Urgency pressure                        +10             BEFORE APPLYING          |
|  ...                                                     [ ] Verify the company  |
|                                                          [ ] Do not pay upfront   |
|  TRUST NOTE: A lower score is not a guarantee of safety. [ ] Confirm recruiter  |
+----------------------------------------------------------------------------------+
```

Behavior:

- The input remains available while the result is reviewed.
- Score, risk label, summary, warning count, and uncertainty are visible together.
- The first warning is not expanded automatically; the student chooses what to inspect.
- Focus moves to the result heading after analysis completes.
- Checklist completion updates immediately and confirms with a non-critical toast.

### Public-link extraction

Behavior:

- The link remains on Analyze while the server safely reads static public HTML.
- Private, blocked, JavaScript-only, non-HTML, short, or oversized pages show manual-paste recovery.
- The canonical source URL is shown on the result and stored only with an explicit saved report.

### Saved and comparison surfaces

```text
+----------------------------------------------------------------------------------+
| Hunch                         Analyze   Saved   Scam Guide   Checklist   Account |
+----------------------------------------------------------------------------------+
| SAVED CHECKS                                                        [Compare]   |
| [Search company or post] [Risk: All v] [Source: All v]                         |
|                                                                                |
| +------------------------------+  +-----------------------------------------+ |
| | Brightline Digital Services  |  | Selected reports                         | |
| | Low risk       18 / 100      |  | Choose two or more reports to compare.  | |
| | School group   Jul 18        |  | [ ] Brightline Digital Services        | |
| +------------------------------+  | [ ] Northstar Student Tech Lab         | |
| | Northstar Student Tech Lab   |  |                         [Compare]       | |
| | Caution        42 / 100      |  +-----------------------------------------+ |
| | School referral Jul 17       |                                             |
| +------------------------------+                                             |
+----------------------------------------------------------------------------------+
```

Comparison behavior:

- The compare action is disabled until two reports are selected.
- The comparison shows score, findings, missing information, and checklist progress in rows.
- The copy states that a lower score is not proof of safety.
- Delete opens confirmation before removing the private snapshot.

## Tablet Wireframe Rules

Target: approximately 700px to 1199px wide.

- Keep the top bar and primary navigation visible, allowing secondary items to collapse when needed.
- Stack the analyzer and result panel vertically: input first, result second.
- Keep the score panel at the top of the result section.
- Place warnings, score breakdown, and checklist in one readable column.
- Keep the mode selector and URL field readable at every tablet width.
- Turn comparison rows into grouped sections instead of allowing a wide table to overflow.
- Keep the text area tall enough for pasted posts and keep the Analyze action visible after the input.

## Mobile Wireframe Rules

Target: below 700px wide.

```text
+--------------------------------------+
| Hunch                         [Menu] |
+--------------------------------------+
| CHECK A LISTING                      |
| Paste an OJT or internship post.     |
| [ Facebook v ]                       |
| +----------------------------------+ |
| | Paste text here...               | |
| |                                  | |
| +----------------------------------+ |
| [Paste text | Public link]          |
| [Try a sample post]                 |
|                         [Analyze]   |
|--------------------------------------|
| RESULT                               |
| CAUTION                              |
| 48 / 100                             |
| Summary and uncertainty              |
| [Expand warning]                     |
| [ ] Verify company                   |
+--------------------------------------+
| Analyze | Saved | Guide | Checklist  |
+--------------------------------------+
```

- Use a single column: input, Analyze, result, warnings, checklist.
- Use a compact top bar and a bottom navigation for secondary destinations.
- Use a minimum 44px interactive target for buttons, checkboxes, and rows.
- Keep the textarea at least 220px tall for pasted posts.
- Do not use side-by-side comparison tables; stack each report and comparison row.
- Keep risk score text at its defined scale and never shrink it to fit a card.
- Allow long evidence to wrap; never truncate the evidence needed to understand a warning.
- Preserve the active result when navigating to sign-in or returning from a failure.

## Interaction Contract

| Control | Trigger | State change | Feedback | Recovery |
| --- | --- | --- | --- | --- |
| Source selector | Select a source | Update `sourceType`. | Selected label remains visible. | Return to previous source. |
| Text area | Type or paste | `empty` -> `ready` or `too-short`. | Character count and field guidance update. | Edit or clear. |
| Clear | Click or activate with keyboard | Reset input and active result after confirmation only when a result exists. | Return to empty state. | Cancel confirmation. |
| Try a sample | Click | Load a named fixture into the text area. | Show the loaded source and text count. | Edit or clear before analysis. |
| Public link | Enter one URL and analyze | `link-ready` -> `link-loading` -> result or error. | Show extraction state and canonical source URL. | Edit URL or switch to paste text. |
| Analyze | Click with valid input | `ready` -> `loading` -> result or error. | Stage text, disabled duplicate action, then focus result. | Retry or edit preserved input. |
| Warning card | Click or press Enter/Space | Collapsed <-> expanded. | Reveal evidence, score impact, explanation, next action. | Collapse without losing scroll position. |
| Checklist item | Click or press Enter/Space | Incomplete <-> complete. | Checkbox state and brief toast. | Toggle again or reset checklist. |
| Save report | Click | Unsaved -> saving or auth-required. | Private persistence notice or sign-in prompt. | Retry; preserve result. |
| Sign in | Submit valid form | Auth form -> submitting -> authenticated. | Return to original result and save intent. | Field-level error and retry. |
| Delete report | Click delete | Idle -> confirmation -> deleting -> deleted. | Explain what is removed. | Cancel or retry failure. |
| New analysis | Click | Return to empty Analyze state. | Clear only after confirmation when input/result exists. | Cancel and preserve current work. |
| Guide sample | Click use sample | Navigate to Analyze with sample loaded. | State that the sample is ready for review. | Edit or clear. |

## Loading and Failure Copy

| State | Copy |
| --- | --- |
| Empty | `Paste an OJT or internship post to check for risk signals.` |
| Helper | `Hunch gives an estimate based on visible signals. It does not prove whether a listing is legitimate.` |
| Too short | `Paste at least 40 characters so Hunch has enough detail to analyze.` |
| Link extraction | `Hunch is reading the public page before checking its visible signals.` |
| Link unavailable | `We could not read that public page. Paste the listing text manually instead.` |
| Analyzing | `Checking recruiter details...` |
| Analyzing | `Looking for payment requests...` |
| Analyzing | `Preparing your risk report...` |
| Rule-only fallback | `The full explanation is unavailable, so this report uses visible rule-based signals only.` |
| Analysis error | `We could not complete this check. Your post is still here. Try again or edit the text.` |
| Low risk | `Few visible warning signals were found. Verify the company independently before applying.` |
| Caution | `This post has some warning signals or missing details. Verify them before you proceed.` |
| High risk | `This post contains several warning signals. Do not pay or send sensitive information before verification.` |
| Partial result | `The available details are incomplete, so this estimate has lower confidence.` |
| Save auth required | `Sign in to save this report. Your current result will be preserved.` |
| Save error | `The report was not saved, but your current result is still available. Try again.` |
| Saved empty | `No saved checks yet. Analyze an OJT post and save the report to compare it later.` |
| Delete confirmation | `Delete this private report?` |
| Network error | `We could not connect. Check your connection and try again.` |

## Accessibility and Usability Review

- Every input has a visible label and a connected error message.
- The Analyze button has the accessible name `Analyze post for risk signals`.
- The public-link action has the accessible name `Analyze public listing link`.
- The result heading receives focus after analysis completes.
- Loading messages use a polite live region and do not claim fake percentage progress.
- Risk score text includes both the numeric score and risk label.
- Warning expansion works with keyboard focus and Enter/Space.
- Dialogs close with Escape and return focus to the triggering control.
- Color is paired with text labels and icons or structural labels.
- Reduced-motion preferences disable score count-up and panel reveal animation.

## Five-Minute Usability Review

Use the four Phase 3 fixtures and ask a reviewer to complete these tasks without narration:

1. Find where to paste an OJT post.
2. Load and analyze `suspicious-01`.
3. Identify the risk level and one piece of evidence.
4. Expand a warning and find its next action.
5. Complete one checklist item.
6. Explain how to save the report without losing it.
7. Load `incomplete-01` and identify what information is missing.

The Phase 4 exit gate passes when the reviewer can identify the input action, explain the result at a basic level, and find a next verification step within five minutes without facilitator rescue.
