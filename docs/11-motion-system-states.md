# Motion System and States

## Motion Goals

Motion should make the analysis feel responsive and interactive without slowing the student down.

Use motion for:

- Progress
- State changes
- Result reveal
- Feedback

Avoid motion that feels decorative or distracting.

## Timing

- Fast hover/focus transitions: 120ms
- Panel reveal: 180ms
- Result update: 240ms
- Risk score count-up: 500ms max

## Analyzer States

### Empty

Show a clear prompt and optional sample post button.

### Input Ready

Enable the Analyze button once the post has enough detail.

### Analyzing

Show:

- Loading indicator
- Short status text
- Disabled Analyze button

Example status messages:

- "Checking recruiter details..."
- "Looking for payment requests..."
- "Preparing your risk report..."

### Complete

Reveal:

- Risk score
- Summary
- Warning cards
- Checklist

### Error

Show a calm error message and retry action.

## Screenshot States

- Idle upload
- File selected
- OCR processing
- Text extracted
- Extraction failed

If OCR fails, let the user paste manually.

## Result Reveal

Recommended sequence:

1. Score panel appears.
2. Warning count appears.
3. Warning cards reveal.
4. Checklist becomes available.

Keep the sequence quick.

## Microinteractions

- Warning cards expand smoothly.
- Checklist items show a completed state.
- Save button changes to Saved.
- Copy/export actions show confirmation.

## Empty States

Saved analyses empty state:

"No saved checks yet. Analyze an OJT post and save the report to compare it later."

Scam guide empty/error state:

"The guide could not load. You can still analyze a post."

## Loading State Rules

- Never leave users guessing.
- Show what is happening.
- Keep previous results visible when re-analyzing unless the user clears them.

## Phase 2 State Contract

The implementation should use explicit state groups so screens do not infer behavior from missing data.

### InputState

Allowed values: `empty`, `ready`, `too-short`, `screenshot-selected`, `ocr-review`, and `invalid`.

- Fewer than 40 characters produces `too-short` and blocks analysis.
- A selected screenshot moves to `/analyze/review` before scoring.
- Low-confidence or empty OCR remains in `ocr-review` until the student edits or confirms usable text.
- Invalid input keeps the entered content and shows a field-level recovery action.

### AnalysisState

Allowed values: `idle`, `loading`, `complete`, `uncertain`, `error`, and `rule-only-fallback`.

- `loading` shows the current stage and disables duplicate submission.
- `complete` reveals the score, warnings, evidence, and checklist in sequence.
- `uncertain` shows missing evidence and verification guidance rather than false confidence.
- `error` preserves the input and offers retry.
- `rule-only-fallback` renders deterministic findings when AI explanation fails.
- Rule failure is a hard error; the UI must never invent a report.

### ResultState

Allowed values: `low-risk`, `caution`, `high-risk`, and `partial-uncertain`.

Each result state includes a score, text label, summary, evidence, uncertainty language, and next action. Color alone must not communicate the state.

### SaveState

Allowed values: `unsaved`, `auth-required`, `saving`, `saved`, and `save-error`.

An auth-required state preserves the result and its return destination. A save error preserves the result and offers retry. A successful save confirms private persistence.

### SavedListState, AuthState, and DeleteState

- `SavedListState`: `loading`, `populated`, `empty`, `filtered-no-results`, `error`.
- `AuthState`: `signed-out`, `form`, `submitting`, `authenticated`, `error`.
- `DeleteState`: `idle`, `confirmation`, `deleting`, `deleted`, `error`.

Each state exposes a visible status, an available recovery action, and a valid destination as documented in the screen inventory state matrix.

## Transition Invariants

- AI explanation runs only after normalized input and deterministic rule scanning succeed.
- AI failure falls back to a usable rule-only report.
- OCR failure returns to manual paste without silently scoring missing text.
- Network, OpenAI, and Supabase failures keep recoverable user context.
- Delete requires confirmation and returns to the saved list or empty state.
- A lower risk score never becomes a claim that a listing is safe.
