import type { RiskCategory, RedFlag } from '../types/analysis'

export interface RuleDefinition {
  id: string
  category: RiskCategory
  title: string
  severity: RedFlag['severity']
  scoreImpact: number
  rationale: string
  explanation: string
  nextAction: string
}

export const RULE_ENGINE_VERSION = 'rules-1.0.0'

export const RULE_CATALOG: RuleDefinition[] = [
  {
    id: 'payment-before-start',
    category: 'payment-request',
    title: 'Training or registration fee mentioned',
    severity: 'high',
    scoreImpact: 30,
    rationale: 'Payment before an OJT or internship starts is a strong signal that needs independent verification.',
    explanation: 'The listing asks for payment before the placement starts. Legitimate OJT arrangements usually should not require an upfront fee.',
    nextAction: 'Ask your school coordinator to verify the opportunity before paying anything.',
  },
  {
    id: 'personal-recruiter-email',
    category: 'suspicious-email',
    title: 'Recruiter uses a personal email',
    severity: 'medium',
    scoreImpact: 8,
    rationale: 'A personal inbox or domain mismatch makes the recruiting identity harder to verify.',
    explanation: 'A personal inbox or domain mismatch makes it harder to confirm that the message represents the stated organization.',
    nextAction: 'Compare the address with the company website and verify through an official channel.',
  },
  {
    id: 'vague-company-identity',
    category: 'vague-company',
    title: 'Company identity is unclear',
    severity: 'medium',
    scoreImpact: 10,
    rationale: 'Students need a named organization and an independent way to verify it before applying.',
    explanation: 'The post does not provide enough company information to independently verify who is offering the placement.',
    nextAction: 'Request the company name, website, address, and supervisor details before applying.',
  },
  {
    id: 'vague-role-details',
    category: 'vague-role',
    title: 'Role details are unclear',
    severity: 'medium',
    scoreImpact: 8,
    rationale: 'Broad duties without a schedule or supervision plan make the placement difficult to evaluate.',
    explanation: 'Broad descriptions make it difficult to know what work, schedule, and supervision the student should expect.',
    nextAction: 'Request a written role description, OJT hours, and reporting structure.',
  },
  {
    id: 'unclear-compensation',
    category: 'unrealistic-compensation',
    title: 'Compensation does not match the role details',
    severity: 'medium',
    scoreImpact: 10,
    rationale: 'Guaranteed or unusually high pay paired with unclear duties can create pressure to act before verifying the offer.',
    explanation: 'Guaranteed or unusually high compensation paired with vague duties can create pressure to act before verifying the offer.',
    nextAction: 'Ask how the allowance was determined and confirm it through the school or official company channel.',
  },
  {
    id: 'urgency-pressure',
    category: 'urgency-pressure',
    title: 'Urgency pressure detected',
    severity: 'medium',
    scoreImpact: 10,
    rationale: 'Instant hiring and limited-slot language can push students to skip normal verification steps.',
    explanation: 'Instant hiring, limited slots, or no-interview language can push students to skip normal verification steps.',
    nextAction: 'Slow down and verify the listing before sending money or personal information.',
  },
  {
    id: 'chat-only-application',
    category: 'chat-only-hiring',
    title: 'Hiring is limited to a chat app',
    severity: 'medium',
    scoreImpact: 7,
    rationale: 'An exclusive chat-only path makes the organization and application record harder to verify.',
    explanation: 'An exclusive chat-only application path makes it harder to confirm the organization and preserve a reliable application record.',
    nextAction: 'Ask for an official email, website, or school-approved application path.',
  },
  {
    id: 'early-sensitive-data',
    category: 'sensitive-information',
    title: 'Sensitive documents requested early',
    severity: 'high',
    scoreImpact: 25,
    rationale: 'Government IDs, bank details, passwords, and selfies should not be requested before an opportunity is verified.',
    explanation: 'Government IDs, bank details, passwords, or full personal documents should not be requested before the opportunity is verified.',
    nextAction: 'Do not send sensitive documents until the company and placement are independently confirmed.',
  },
]

export const RULE_CATALOG_BY_ID = Object.fromEntries(RULE_CATALOG.map((rule) => [rule.id, rule])) as Record<string, RuleDefinition>
