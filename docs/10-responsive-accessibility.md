# Responsive and Accessibility

## Responsive Goals

Hunch should work well for students using laptops, tablets, and phones. Many students may check OJT posts directly from a phone screenshot or chat message.

## Desktop

Use a two-column layout when space allows:

- Left: analyzer input
- Right: risk result or preview

Below the main area:

- Red flags
- Score breakdown
- Checklist
- Safe vs risky comparison

## Tablet

Use a stacked layout with wider cards:

- Analyzer
- Risk score
- Warnings
- Checklist

## Mobile

Use a single-column layout:

- Top bar
- Analyzer input
- Upload button
- Analyze button
- Risk result
- Warning cards
- Checklist

Mobile rules:

- Buttons must be easy to tap.
- Text area should be tall enough for pasted posts.
- Risk score should stay readable.
- Avoid side-by-side comparison tables that overflow.

## Accessibility Rules

- Every input needs a visible label.
- Upload controls need keyboard access.
- Buttons need clear focus states.
- Risk colors must include text labels.
- Warning icons must not be the only indicator.
- Error messages should explain how to fix the problem.
- Toast messages should not contain critical information only.

## Keyboard Support

Required keyboard behavior:

- Tab through input, upload, analyze, results, and checklist.
- Enter or Space toggles checklist items.
- Escape closes dialogs.
- Focus moves to results after analysis completes.

## Screen Reader Support

Important labels:

- Text area: "Paste OJT or internship post"
- Upload: "Upload screenshot of OJT post"
- Analyze button: "Analyze post for risk signals"
- Risk score: include score and risk level in text.

## Error Accessibility

Errors should be attached to the relevant field.

Examples:

- "Paste at least 40 characters so Hunch has enough text to analyze."
- "We could not read the screenshot. Try a clearer image or paste the text manually."

## Content Accessibility

Use plain language and avoid shame-based wording.

Good:

- "This post has several warning signs."

Avoid:

- "You almost got scammed."
