# Component System

## Analyzer Input

Purpose:

Accept pasted OJT posts, recruiter messages, or extracted screenshot text.

Elements:

- Text area
- Placeholder
- Character count
- Source selector
- Analyze button
- Clear button

States:

- Empty
- Typing
- Ready
- Too short
- Loading
- Error

## Screenshot Uploader

Purpose:

Allow students to upload screenshots from Facebook, Messenger, LinkedIn, email, or group chats.

Elements:

- Upload dropzone
- File preview
- OCR status
- Extracted text review

States:

- Idle
- Dragging
- Uploading
- OCR processing
- OCR success
- OCR failed

## Risk Score Panel

Purpose:

Summarize the result at a glance.

Elements:

- Score number
- Risk label
- Short summary
- Warning count
- Save action

Variants:

- Low risk
- Caution
- High risk
- Uncertain

## Red Flag Card

Purpose:

Explain one detected warning.

Elements:

- Category
- Severity
- Title
- Explanation
- Matched evidence
- Suggested action
- Score impact

States:

- Collapsed
- Expanded
- Highlighted

## Score Breakdown

Purpose:

Show how the score was calculated.

Elements:

- Signal name
- Score impact
- Severity
- Explanation

## Safe vs Risky Comparison

Purpose:

Compare the submitted post with safer listing traits.

Rows:

- Company identity
- Recruiter email
- Role clarity
- Salary or allowance
- Application method
- Payment request
- Document request

## Checklist Item

Purpose:

Help students verify before applying.

Elements:

- Checkbox
- Label
- Reason
- Optional related warning

States:

- Incomplete
- Complete
- Disabled

## Saved Analysis Row

Purpose:

Show one saved report in history.

Elements:

- Title or detected company
- Risk level
- Score
- Source
- Date
- Status tag

## Badges

Types:

- Low risk
- Caution
- High risk
- Payment request
- Personal email
- Vague role
- Urgent pressure
- WhatsApp-only

## Toasts

Use to confirm:

- Analysis saved
- Checklist updated
- Screenshot text extracted
- Error occurred

## Phase 5 Implementation Reference

The component variants, semantic risk treatment, interaction rules, content guidance, and representative screen are defined in `docs/16-visual-system-and-content-contract.md`.
