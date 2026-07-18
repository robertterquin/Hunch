# User Journeys

## Journey 1: Paste an OJT Post

1. Student opens Hunch.
2. The analyzer is visible immediately.
3. Student pastes a Facebook, LinkedIn, email, or group chat OJT post.
4. Student clicks Analyze.
5. Hunch shows a risk score, red flags, explanations, and next steps.
6. Student checks the pre-application checklist.
7. Student saves the analysis if they want to compare it later.

Success outcome:

The student knows whether the listing deserves caution before applying.

## Journey 2: Upload a Screenshot

1. Student uploads a screenshot from Messenger, Facebook, LinkedIn, email, or a school group chat.
2. Hunch extracts readable text through OCR.
3. Student reviews or edits the extracted text.
4. Student runs the analysis.
5. Hunch displays the same report format as pasted text.

Success outcome:

The student can evaluate posts without manually retyping them.

## Journey 3: Understand a Warning

1. Student sees a medium or high-risk result.
2. Student opens a warning card.
3. Hunch explains the warning in plain language.
4. Hunch suggests a verification action.

Example:

- Warning: "Training fee mentioned"
- Explanation: "Legitimate OJT placements usually should not require students to pay a fee before starting."
- Next step: "Ask your school coordinator or verify through the company's official website."

Success outcome:

The student learns how to spot the same warning in future posts.

## Journey 4: Save and Compare Listings

1. Student analyzes multiple OJT posts.
2. Student saves promising or suspicious listings.
3. Student opens the Saved page.
4. Student compares risk scores, red flags, and checklist progress.

Success outcome:

The student can choose safer opportunities and avoid risky ones.

## Journey 5: Use Hunch Before Applying

1. Student finds a listing they want to apply to.
2. Student runs Hunch.
3. Student completes the checklist.
4. Student verifies the company, recruiter email, application method, and role details.
5. Student decides whether to apply, ask for more information, or avoid the listing.

Success outcome:

Hunch becomes a fast safety habit before sending applications or personal information.

## Edge Cases

- Empty or very short post: ask for more details before scoring.
- Low-quality screenshot: show OCR confidence and allow manual editing.
- Ambiguous result: show medium risk and explain missing evidence.
- Safe-looking post with missing details: show low or medium risk with verification reminders.
- User tries to save while signed out: prompt sign in without losing the result.

## Phase 2 Transition Contract

### Paste path

| Current state | Student action | Hunch response | Next state or route |
| --- | --- | --- | --- |
| Analyze, empty | Focus or paste text | Show input guidance. | Analyze, typing. |
| Analyze, typing | Enter fewer than 40 characters | Explain that more detail is required; keep Analyze disabled. | Analyze, too-short. |
| Analyze, ready | Select source and click Analyze | Preserve input and start the analysis stage. | Analyze, loading. |
| Analyze, loading | Wait or attempt another action | Show the current analysis stage and disable duplicate submission. | Analyze, complete or error. |
| Analyze, complete | Read report, expand warning, or complete checklist | Keep the submitted text beside the report. | Analyze, active result. |
| Analyze, active result | Click Save | Save directly if signed in; otherwise preserve the report and open auth. | Saved detail or `/auth/sign-in`. |

### Screenshot path

1. The student starts on `/analyze` and selects a screenshot.
2. Hunch moves to `/analyze/review` and shows the file, extraction status, and confidence.
3. OCR text is editable before analysis.
4. Low-confidence or empty extraction blocks scoring until the student confirms or corrects the text.
5. A failed extraction offers manual paste recovery and does not silently analyze missing text.
6. Confirmed text returns to `/analyze` and follows the same analysis and result path as pasted text.

### Result understanding path

1. The result panel shows score, risk label, summary, uncertainty, and warning count together.
2. Opening a warning reveals its category, matched evidence, explanation, score impact, and next action.
3. Missing information remains visible so the student can distinguish evidence from uncertainty.
4. The checklist is generated from the detected signals and can be completed without leaving the report.

### Save, authentication, and comparison path

1. An anonymous save attempt opens `/auth/sign-in` with the active result and return destination preserved.
2. Successful sign-in returns the student to the unsaved result instead of losing the report.
3. Saving creates a private snapshot and opens `/saved/:analysisId` or confirms the saved state on `/analyze`.
4. `/saved` supports search, filtering, status tags, opening, and deletion.
5. `/compare` requires at least two selected reports and explains that a lower score is not a safety guarantee.

### Failure and recovery path

- Input validation failure keeps the text and identifies how to fix it.
- Rule processing failure shows an input error and does not invent a report.
- AI failure renders a useful rule-only report and labels the reduced explanation state.
- Network or save failure keeps the active report and offers retry.
- OCR failure returns the student to manual paste without deleting the selected context.
- Delete failure keeps the report in the saved list and provides a retry action.
