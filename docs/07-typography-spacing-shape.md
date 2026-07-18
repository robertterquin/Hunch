# Typography, Spacing, and Shape

## Typography Goals

The interface should be easy to scan while students are making quick decisions about OJT posts.

Use clear hierarchy, compact labels, and readable explanations.

The dark minimal design should use typography for structure instead of heavy decoration.

## Font Direction

Recommended font stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Type Scale

- App name: 24px, 700
- Page headline: 30px, 700
- Section title: 20px, 650
- Card title: 16px, 650
- Body text: 15px, 400
- Form label: 14px, 600
- Helper text: 13px, 400
- Badge text: 12px, 650
- Risk score number: 48px, 750

## Copy Rules

- Keep button labels short.
- Use plain verbs: Analyze, Save, Compare, Verify.
- Warning titles should be specific.
- Explanations should be one to three short sentences.

## Spacing Scale

Use an 8px-based system:

- 4px: tight inline gaps
- 8px: small element gaps
- 12px: compact card padding
- 16px: default spacing
- 24px: section spacing
- 32px: major layout spacing
- 48px: large desktop spacing

## Shape

- Cards: 8px radius
- Buttons: 8px radius
- Inputs: 8px radius
- Badges: 999px radius if pill-shaped
- Modals: 12px radius

Dark surfaces should use thin borders and subtle background shifts rather than large rounded decorative panels.

## Layout Density

Hunch should feel compact and useful, not sparse.

Use:

- Wide text area for pasted posts
- Tight warning cards
- Clear result panels
- Table-like comparison sections

Avoid:

- Oversized hero type inside dashboard panels
- Large decorative cards
- Too many nested cards
- Empty whitespace that pushes the analyzer below the first viewport
- Glow-heavy or neon styling
- Soft blurred background blobs

## Responsive Typography

- Do not scale font sizes directly with viewport width.
- Use the same type scale across breakpoints.
- Reflow layout instead of shrinking text too far.

## Phase 5 Implementation Reference

The finalized typography, spacing, shape, border, elevation, and motion tokens are defined in `docs/16-visual-system-and-content-contract.md`.
