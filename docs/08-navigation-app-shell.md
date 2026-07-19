# Navigation and App Shell

## Shell Goal

The app shell should keep Hunch focused on the analyzer. Navigation should be helpful but quiet.

The shell should use a minimal dark theme with clear surface separation, restrained borders, and a compact header.

## Desktop Layout

Recommended structure:

- Top navigation bar
- Main analyzer area
- Result panel beside the analyzer when space allows
- Secondary content below
- Dark page background with slightly lighter panels

Top navigation items:

- Hunch logo/name
- Analyze
- Saved
- Scam Guide
- Checklist
- Sign in or user menu

Primary action:

- New Analysis

## Mobile Layout

Recommended structure:

- Compact top bar
- Analyzer first
- Results below input
- Bottom or collapsed menu for secondary pages

Mobile priorities:

1. Paste/upload input
2. Analyze button
3. Risk result
4. Red flag explanations
5. Checklist

## First Viewport Requirements

The first screen must include:

- Hunch name
- Tagline: "Your second opinion before applying."
- Paste input
- Public-link input mode
- Analyze button
- A compact preview of what Hunch checks
- A result preview or empty risk panel that makes the analysis flow obvious

The first screen should not require scrolling before the student can analyze a post.

## Active States

- The active navigation item should be visually distinct.
- Use text labels in navigation.
- Use icons only when they improve scanning.

## Breadcrumbs

Use breadcrumbs only on saved analysis details.

Example:

Saved > Facebook OJT post > Analysis report

## Empty Signed-Out State

Anonymous users can analyze posts.

When they try to save:

- Show a sign-in prompt.
- Preserve their current analysis result.
- Explain that saving lets them compare listings later.

## Header Actions

Use the header for:

- New analysis
- Sign in/sign out
- User profile menu

Do not overload the header with marketing links.

## Dark Shell Rules

- Header background should blend with the page, separated by a subtle border.
- Active navigation should use brand blue text or a small underline.
- Analyzer and result panels should be visible through surface contrast, not heavy shadows.
- Primary buttons should be bright enough to stand out on dark backgrounds.
- Avoid large gradients, neon effects, and decorative background shapes.

## Phase 2 Route and Navigation Contract

The shell owns the global navigation and keeps the active analysis context available while the student moves through supporting tools.

| Navigation item | Route | Active behavior | Access |
| --- | --- | --- | --- |
| Hunch wordmark | `/analyze` | Starts a new analysis only when the current result is not at risk of being lost; otherwise preserve the active result. | Public |
| Analyze | `/analyze` | Active for intake and the in-memory result panel. | Public |
| Saved | `/saved` | Active for saved list and saved detail routes. | Sign in required |
| Scam Guide | `/guide` | Active for guide list and pattern details. | Public |
| Checklist | `/checklist` | Active for the reusable checklist. | Public |
| Settings | `/settings` | Active for profile and privacy controls. | Sign in required |
| New Analysis | `/analyze` | Clears only when the student confirms starting over. | Public |
| Account action | Auth routes or sign-out | Preserves return destination for authentication. | Public or signed in |

The root route `/` redirects to `/analyze`. Saved detail uses `/saved/:analysisId`; comparison uses `/compare` and requires at least two selected private reports. Public-link extraction remains within `/analyze`.

## Auth and Privacy Navigation

- Anonymous users can complete the full analyze, result, warning, and checklist flow.
- A save attempt while signed out opens `/auth/sign-in` and preserves the active result in session state.
- Successful authentication returns to the saved result rather than the navigation home.
- Saved, compare, and settings routes require authentication and return to the requested destination after sign-in.
- Sign-out clears private session data from the shell but does not discard an unsaved active analysis.
- Delete actions require an explicit confirmation and return to the saved list or its empty state.

## Navigation Recovery Rules

- A failed navigation or data load keeps the student on the last usable screen and offers retry.
- Guide samples populate Analyze without bypassing input validation.
- Re-analysis keeps the previous report visible until the replacement result is ready.
- Breadcrumbs appear only on saved analysis details and never replace the primary navigation.
