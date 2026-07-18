# Domain Rules Affecting UX

## Risk Model

Hunch should combine rule-based signals with AI-generated explanations.

The score should represent risk, not certainty.

Suggested scoring:

- 0-30: Low risk
- 31-65: Caution
- 66-100: High risk

## Red Flag Categories

### Payment Request

Signals:

- Training fee
- Registration fee
- Processing fee
- Security deposit
- Pay before starting

UX:

- Always show as a strong warning.
- Explain that legitimate OJT placements usually should not require upfront payment.

### Suspicious Email

Signals:

- Gmail, Yahoo, Outlook, or other personal email used as recruiter contact
- Email domain does not match company website
- Misspelled company domain

UX:

- Show matched email.
- Suggest verifying through official company channels.

### Vague Company Identity

Signals:

- No company name
- Generic "our company" wording
- No website, address, or official page
- Company name changes across the post

UX:

- Ask the user to verify company existence before applying.

### Vague Role

Signals:

- No clear responsibilities
- No department/team
- Broad claims like "office work", "online tasks", or "easy job"
- No required schedule or OJT hours

UX:

- Explain that legitimate OJT posts usually include role details and expectations.

### Unrealistic Compensation

Signals:

- Very high allowance for unclear work
- Guaranteed income
- "Earn fast" language
- Salary without clear role or hours

UX:

- Flag as caution or high risk depending on other signals.

### Urgency Pressure

Signals:

- Apply now only
- Limited slots
- Instant hiring
- No interview needed
- Start immediately after payment or document submission

UX:

- Explain pressure tactics and suggest slowing down to verify.

### WhatsApp or Chat-Only Hiring

Signals:

- WhatsApp-only application
- Messenger-only recruiter
- No official email or application page

UX:

- Flag as caution unless combined with payment or document requests.

### Sensitive Information Request

Signals:

- Bank details
- Government ID
- Passwords
- Full personal documents before interview or offer

UX:

- Show as high severity.
- Recommend not sending sensitive documents until legitimacy is verified.

## AI Explanation Rules

AI output should:

- Use plain student-friendly language.
- Explain why each warning matters.
- Suggest a verification step.
- Avoid saying "definitely scam" or "definitely safe".
- Mention uncertainty when evidence is incomplete.

## Checklist Generation Rules

Every analysis should produce checklist items based on detected risks.

Examples:

- Verify company website and official pages.
- Check whether recruiter email matches company domain.
- Ask your OJT coordinator before paying any fee.
- Request a clear job description and supervisor details.
- Do not send IDs or bank details too early.

## Disclaimer

Hunch provides an automated risk assessment based on visible signals in the submitted post. It is not legal advice and cannot guarantee whether an opportunity is legitimate or fraudulent.
