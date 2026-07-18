# Color System

## Color Goals

The color system should help students quickly understand risk without making the app feel alarming or childish.

Use color to support labels, not replace them. Every risk color must appear with text such as "Low risk", "Caution", or "High risk".

The app should use a minimal dark theme by default. Colors should feel complementary: deep neutral backgrounds, cool blue actions, green confirmation, amber caution, and red danger.

## Suggested Palette

### Brand

- Brand blue: `#4F8CFF`
- Brand blue hover: `#79A7FF`
- Brand blue active: `#2F6FE8`
- Soft blue surface: `#10213F`

### Dark Neutral

- Page background: `#070A12`
- App shell: `#0B1020`
- Primary surface: `#111827`
- Secondary surface: `#172033`
- Input surface: `#0F172A`
- Elevated surface: `#1E293B`
- Border: `#2B364A`
- Muted border: `#334155`
- Primary text: `#F8FAFC`
- Secondary text: `#CBD5E1`
- Muted text: `#94A3B8`
- Disabled text: `#64748B`

### Risk

Low risk:

- Text: `#86EFAC`
- Background: `#10291B`
- Border: `#22C55E`

Medium risk:

- Text: `#FCD34D`
- Background: `#30240C`
- Border: `#F59E0B`

High risk:

- Text: `#FCA5A5`
- Background: `#351416`
- Border: `#EF4444`

Info:

- Text: `#93C5FD`
- Background: `#10213F`
- Border: `#3B82F6`

### Support

- Success accent: `#22C55E`
- Warning accent: `#F59E0B`
- Danger accent: `#EF4444`
- Focus ring: `#79A7FF`

## Usage Rules

- Use brand blue for primary actions such as Analyze and Save.
- Use risk colors only for risk states and warning categories.
- Do not fill the entire page with red for high risk.
- High-risk states should be noticeable but still readable.
- Low-risk states should never imply guaranteed safety.
- Keep most surfaces neutral so the analyzer and risk output remain the focus.
- Use borders and surface contrast instead of large shadows.

## Risk Labels

Use these labels consistently:

- `0-30`: Low risk
- `31-65`: Caution
- `66-100`: High risk

## Accessibility

- Do not communicate risk through color alone.
- Include icons, text labels, and short explanations.
- Keep contrast high for buttons, badges, and score text.
- Red, amber, and green text must appear on their matching dark-tinted surfaces or neutral surfaces with enough contrast.
