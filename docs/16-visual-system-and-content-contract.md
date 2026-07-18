# Visual System and Content Contract

## Purpose

This document finalizes the Phase 5 visual and content decisions for Hunch. It is the implementation reference for Phase 6 components and styles.

The system should feel like a calm student safety tool: focused, compact, high-contrast, and evidence-first. It should not feel like a marketing page, a neon security dashboard, or a fear-based warning screen.

## Token Sheet

### Color tokens

```css
:root {
  --color-page: #070A12;
  --color-shell: #0B1020;
  --color-surface: #111827;
  --color-surface-2: #172033;
  --color-surface-input: #0F172A;
  --color-surface-elevated: #1E293B;

  --color-border: #2B364A;
  --color-border-muted: #334155;
  --color-text: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #94A3B8;
  --color-text-disabled: #64748B;

  --color-action: #4F8CFF;
  --color-action-hover: #79A7FF;
  --color-action-active: #2F6FE8;
  --color-action-text: #070A12;
  --color-action-surface: #10213F;
  --color-focus: #79A7FF;

  --color-risk-low-text: #86EFAC;
  --color-risk-low-surface: #10291B;
  --color-risk-low-border: #22C55E;
  --color-risk-caution-text: #FCD34D;
  --color-risk-caution-surface: #30240C;
  --color-risk-caution-border: #F59E0B;
  --color-risk-high-text: #FCA5A5;
  --color-risk-high-surface: #351416;
  --color-risk-high-border: #EF4444;

  --color-info-text: #93C5FD;
  --color-info-surface: #10213F;
  --color-info-border: #3B82F6;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
}
```

Usage rules:

- Neutral surfaces carry most of the interface.
- Brand blue is for primary actions, links, focus, and selected navigation.
- Primary action buttons use `--color-action-text` on the blue action surface; do not use primary white text on `--color-action` for normal-size labels.
- Risk colors are used for risk states and related evidence only.
- Every risk color is paired with a text label and a short explanation.
- High risk changes the panel surface and border, not the entire page background.
- Do not use gradients, glow effects, blurred blobs, or decorative neon accents.

### Typography tokens

```css
:root {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;

  --text-app-name: 24px;
  --text-page-title: 30px;
  --text-section-title: 20px;
  --text-card-title: 16px;
  --text-body: 15px;
  --text-label: 14px;
  --text-helper: 13px;
  --text-badge: 12px;
  --text-score: 48px;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 650;
  --weight-bold: 700;
}
```

Typography rules:

- Use the same type scale on desktop, tablet, and mobile.
- Use sentence case for headings, labels, and buttons.
- Keep explanations to one to three short sentences.
- Use tabular or monospace numerals for scores and score impacts when available.
- Do not use oversized hero text inside the application shell.

### Spacing, shape, and elevation tokens

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  --radius-control: 8px;
  --radius-card: 8px;
  --radius-modal: 12px;
  --radius-pill: 999px;

  --border-thin: 1px solid var(--color-border);
  --border-muted: 1px solid var(--color-border-muted);
  --shadow-panel: 0 6px 16px rgba(0, 0, 0, 0.16);
  --shadow-modal: 0 16px 32px rgba(0, 0, 0, 0.28);
}
```

Shape and elevation rules:

- Controls and cards use an 8px radius.
- Modals may use a 12px radius.
- Pills are reserved for compact status badges.
- Prefer borders and surface contrast over shadows.
- Use `--shadow-panel` only for focused or elevated tools; most panels remain flat.
- Do not nest cards inside cards unless the inner item is an individual warning, checklist item, or saved row.

## Risk Status System

### Risk bands

| Score | Label | Text treatment | Required explanation |
| --- | --- | --- | --- |
| 0-30 | Low risk | Green text, dark green surface, green border. | Few visible warning signals were found; verify independently. |
| 31-65 | Caution | Amber text, dark amber surface, amber border. | Some warning signals or missing details need verification. |
| 66-100 | High risk | Red text, dark red surface, red border. | Several warning signals are present; do not pay or send sensitive data before verification. |

### Score visualization

Use a horizontal segmented meter with three labeled bands: `Low risk`, `Caution`, and `High risk`. Place a position marker on the 0-100 track and show the numeric score beside it.

The meter must also include:

- A visible risk label.
- A short summary.
- Warning count.
- A statement about uncertainty or missing information.
- Evidence links or expandable warning cards nearby.

Do not use a circular gauge without labels, color-only dots, or a score displayed without explanation.

### Non-color indicators

- Low risk uses the text label `Low risk` and a check-style status marker.
- Caution uses the text label `Caution` and a warning-style status marker.
- High risk uses the text label `High risk` and an alert-style status marker.
- Uncertain uses the text label `Partial result` or `Lower confidence` and an information marker.
- The marker, label, score, and explanation must remain understandable in grayscale.

## Component Inventory

| Component | Variants | Required content | Interaction rule |
| --- | --- | --- | --- |
| App shell | Desktop, tablet, mobile | Wordmark, primary nav, account action, New Analysis. | Active navigation is visible through text and blue emphasis. |
| Analyzer input | Empty, ready, too-short, loading, error | Label, source selector, textarea, count, upload, sample, clear, Analyze. | Analyze is disabled below 40 characters. |
| Source selector | Facebook, LinkedIn, email, Messenger, school group, other | Visible label and selected source. | Changing source does not delete text. |
| Screenshot uploader | Idle, selected, processing, review, failed | Dropzone, file name, preview, OCR status, privacy note. | Keyboard-accessible and never silently scores failed OCR. |
| Risk summary | Low risk, Caution, High risk, Partial result | Score, risk label, summary, warning count, uncertainty, Save. | Score stays beside explanation. |
| Risk meter | Low, caution, high, partial | Labeled 0-100 bands and position marker. | Never communicates meaning through color alone. |
| Warning card | Collapsed, expanded, highlighted | Category, severity, title, explanation, evidence, impact, next action. | Enter and Space toggle; expanded evidence remains readable. |
| Score breakdown | Default, expanded | Signal, score impact, severity, explanation. | Uses the same category names as warning cards. |
| Missing information | None, one or more items | Missing field and verification suggestion. | Appears near the score, not hidden below the fold. |
| Checklist item | Incomplete, complete, disabled | Checkbox, action label, reason, related warning. | Keyboard toggle and immediate visual confirmation. |
| Saved row | Default, selected, deleting | Title, risk, score, source, date, status, selection control. | Selection supports Compare; delete requires confirmation. |
| Comparison surface | Empty, selected, populated | Two or more report columns or stacked groups, evidence rows, caution note. | Lower score is never framed as guaranteed safety. |
| Auth prompt | Sign-in required, form, error, success | Reason, form, return context, recovery action. | Preserve the active result across authentication. |
| Toast | Success, info, error | Short non-critical confirmation. | Never contains the only copy of critical information. |
| Confirmation dialog | Delete, start over | Consequence, confirm, cancel. | Escape closes and restores focus to the trigger. |

## Content Rules

### Voice

Hunch is calm, direct, protective, and honest about uncertainty.

Use:

- `Check this before applying.`
- `Training fee detected.`
- `The company identity is unclear.`
- `Verify the recruiter email through an official channel.`
- `This result is an estimate based on visible signals.`

Avoid:

- `This is definitely a scam.`
- `This opportunity is safe.`
- `We caught a criminal.`
- `Our AI guarantees your safety.`
- Long cybersecurity, legal, or HR jargon without explanation.

### Labels and button verbs

Use short verbs: `Analyze`, `Save`, `Compare`, `Verify`, `Review`, `Clear`, `Retry`, `Delete`, `Cancel`, and `Start new analysis`.

Use specific warning titles: `Training fee mentioned`, `Recruiter uses a personal email`, `Company identity is missing`, `Role details are unclear`, `Urgency pressure`, `Sensitive documents requested early`.

### Disclaimer placement

Show a short trust note near the analyzer and the result score:

`Hunch provides an automated risk estimate based on visible signals. It is not legal advice and cannot guarantee whether an opportunity is legitimate or fraudulent.`

The disclaimer must remain visible in result states without overwhelming the primary action.

## Motion Tokens

```css
:root {
  --motion-fast: 120ms;
  --motion-panel: 180ms;
  --motion-result: 240ms;
  --motion-score: 500ms;
  --motion-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

Motion rules:

- Use 120ms for hover, focus, and button state changes.
- Use 180ms for warning expansion and panel reveal.
- Use 240ms for result updates.
- Keep score count-up at 500ms or less.
- Motion must communicate a state change, not disguise waiting.
- Under `prefers-reduced-motion`, remove score count-up and reveal movement while preserving state changes.

## Annotated Representative Screen

The primary visual reference is the desktop Analyze screen with the `suspicious-01` result loaded.

```text
+----------------------------------------------------------------------------+
| Hunch   Analyze   Saved   Scam Guide   Checklist       [Account] [New]      |
+----------------------------------------------------------------------------+
|                                                                            |
|  [1] INPUT                             [5] RESULT                         |
|  Source: [Messenger v]                  [HIGH RISK] 82 / 100              |
|  +-------------------------------+      [6] Several warning signals     |
|  | submitted post remains        |      [Save report]                    |
|  | visible and editable          |                                        |
|  +-------------------------------+      [7] Summary and uncertainty      |
|  248 characters [Clear] [Analyze]       Plain-language explanation.       |
|                                                                            |
|  [2] Upload screenshot  [3] Sample      [8] Warning cards                 |
|                                           Payment request [Expand]        |
|  [4] Trust note                            Personal email [Expand]        |
|                                           Sensitive data [Expand]          |
|                                                                            |
|                                           [9] Checklist                   |
|                                           [ ] Verify company               |
|                                           [ ] Do not pay before checking   |
+----------------------------------------------------------------------------+
```

Annotations:

1. The input is the dominant action and remains visible after analysis.
2. Screenshot upload is a secondary input path, never the only path.
3. Sample content makes the empty state immediately testable.
4. The trust note sets expectations before scoring.
5. Score and label are adjacent and use semantic status treatment.
6. Save is available but does not imply that the report is a verdict.
7. Summary and uncertainty appear before the warning list.
8. Warning cards expose evidence and impact without requiring a separate page.
9. Checklist actions convert concern into a next step.

## Core Readability and Contrast Gate

Before Phase 6 is accepted:

- Primary text and labels must remain readable on every neutral surface.
- Action text must remain readable on blue buttons in default, hover, and disabled states.
- Risk text must remain readable on its tinted surface and when printed or viewed in grayscale.
- Focus rings must be visible against both dark surfaces and colored controls.
- Long evidence and warning titles must wrap without clipping or overlapping adjacent content.
- The first viewport must show the analyzer action and a result preview without horizontal scrolling.
