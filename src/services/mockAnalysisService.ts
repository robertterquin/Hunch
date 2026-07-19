import { analysisFixtures, getFixtureById } from '../data/analysisFixtures'
import type {
  AnalysisFixture,
  AnalysisInput,
  AnalysisReport,
  Confidence,
  RedFlag,
  RiskCategory,
  RiskLevel,
  ResultState,
} from '../types/analysis'

const categoryDetails: Record<
  RiskCategory,
  { title: string; explanation: string; nextAction: string; severity: 'medium' | 'high' }
> = {
  'payment-request': {
    title: 'Training or registration fee mentioned',
    explanation: 'The listing asks for payment before the placement starts. Legitimate OJT arrangements usually should not require an upfront fee.',
    nextAction: 'Ask your school coordinator to verify the opportunity before paying anything.',
    severity: 'high',
  },
  'suspicious-email': {
    title: 'Recruiter uses a personal email',
    explanation: 'A personal inbox or domain mismatch makes it harder to confirm that the message represents the stated organization.',
    nextAction: 'Compare the address with the company website and verify through an official channel.',
    severity: 'medium',
  },
  'vague-company': {
    title: 'Company identity is unclear',
    explanation: 'The post does not provide enough company information to independently verify who is offering the placement.',
    nextAction: 'Request the company name, website, address, and supervisor details before applying.',
    severity: 'medium',
  },
  'vague-role': {
    title: 'Role details are unclear',
    explanation: 'Broad descriptions make it difficult to know what work, schedule, and supervision the student should expect.',
    nextAction: 'Request a written role description, OJT hours, and reporting structure.',
    severity: 'medium',
  },
  'unrealistic-compensation': {
    title: 'Compensation does not match the role details',
    explanation: 'Guaranteed or unusually high compensation paired with vague duties can create pressure to act before verifying the offer.',
    nextAction: 'Ask how the allowance was determined and confirm it through the school or official company channel.',
    severity: 'medium',
  },
  'urgency-pressure': {
    title: 'Urgency pressure detected',
    explanation: 'Instant hiring, limited slots, or no-interview language can push students to skip normal verification steps.',
    nextAction: 'Slow down and verify the listing before sending money or personal information.',
    severity: 'medium',
  },
  'chat-only-hiring': {
    title: 'Hiring is limited to a chat app',
    explanation: 'An exclusive chat-only application path makes it harder to confirm the organization and preserve a reliable application record.',
    nextAction: 'Ask for an official email, website, or school-approved application path.',
    severity: 'medium',
  },
  'sensitive-information': {
    title: 'Sensitive documents requested early',
    explanation: 'Government IDs, bank details, passwords, or full personal documents should not be requested before the opportunity is verified.',
    nextAction: 'Do not send sensitive documents until the company and placement are independently confirmed.',
    severity: 'high',
  },
}

const categoryWeights: Record<RiskCategory, number> = {
  'payment-request': 30,
  'suspicious-email': 8,
  'vague-company': 10,
  'vague-role': 8,
  'unrealistic-compensation': 10,
  'urgency-pressure': 10,
  'chat-only-hiring': 7,
  'sensitive-information': 25,
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

function midpoint([minimum, maximum]: [number, number]): number {
  return Math.round((minimum + maximum) / 2)
}

function chooseFixture(input: AnalysisInput): AnalysisFixture {
  if (input.fixtureId) {
    const requestedFixture = getFixtureById(input.fixtureId)
    if (requestedFixture) return requestedFixture
  }

  const normalizedText = input.text.toLowerCase()
  const matchingFixtureId = normalizedText.includes('registration fee') || normalizedText.includes('bank account')
    ? 'suspicious-01'
    : normalizedText.includes('school placement') && normalizedText.includes('gmail')
      ? 'informal-01'
      : normalizedText.includes('supervisor') && normalizedText.includes('website')
        ? 'safe-01'
        : 'incomplete-01'

  return getFixtureById(matchingFixtureId) ?? analysisFixtures[0]
}

function makeFlags(fixture: AnalysisFixture): RedFlag[] {
  return (fixture.expected.evidence ?? []).map((match, index) => {
    const details = categoryDetails[match.category]
    return {
      id: `${fixture.id}-flag-${index + 1}`,
      category: match.category,
      title: details.title,
      severity: details.severity,
      explanation: details.explanation,
      evidence: match.text,
      scoreImpact: categoryWeights[match.category],
      confidence: fixture.expected.confidence,
      nextAction: details.nextAction,
    }
  })
}

function makeChecklist(fixture: AnalysisFixture): AnalysisReport['checklist'] {
  return fixture.expected.checklistThemes.map((theme, index) => {
    const relatedFlag = fixture.expected.findingCategories[index]
    return {
      id: `${fixture.id}-check-${index + 1}`,
      label: theme.charAt(0).toUpperCase() + theme.slice(1),
      reason: relatedFlag ? categoryDetails[relatedFlag].explanation : 'A practical verification step before applying.',
      completed: false,
      relatedCategory: relatedFlag,
    }
  })
}

export function createMockReport(
  fixture: AnalysisFixture,
  options: { id?: string; sourceType?: AnalysisInput['sourceType']; text?: string; createdAt?: string } = {},
): AnalysisReport {
  const { expected } = fixture
  const riskScore = midpoint(expected.scoreRange)
  const flags = makeFlags(fixture)
  const riskLevel = riskScoreToLevel(riskScore)

  return {
    id: options.id ?? `mock-${fixture.id}-${Date.now()}`,
    fixtureId: fixture.id,
    listingTitle: fixture.title,
    sourceType: options.sourceType ?? fixture.sourceType,
    originalText: options.text ?? fixture.text,
    riskScore,
    riskLevel,
    resultState: resultStateFor(riskLevel, expected.confidence, expected.missingInformation),
    confidence: expected.confidence,
    summary: summaryFor(fixture),
    uncertainty: uncertaintyFor(fixture),
    flags,
    missingInformation: expected.missingInformation,
    checklist: makeChecklist(fixture),
    analysisVersion: 'mock-phase-7.1',
    createdAt: options.createdAt ?? new Date().toISOString(),
  }
}

function resultStateFor(riskLevel: RiskLevel, confidence: Confidence, missingInformation: string[]): ResultState {
  if (confidence === 'low' || missingInformation.length > 3) return 'partial-uncertain'
  return riskLevel
}

export async function analyzeListing(input: AnalysisInput): Promise<AnalysisReport> {
  const normalizedText = input.text.trim()
  if (normalizedText.length < 40) {
    throw new Error('Paste at least 40 characters so Hunch has enough detail to analyze.')
  }

  await delay(320)
  const fixture = chooseFixture({ ...input, text: normalizedText })
  return createMockReport(fixture, { sourceType: input.sourceType, text: normalizedText })
}

function riskScoreToLevel(score: number): RiskLevel {
  if (score <= 30) return 'low-risk'
  if (score <= 65) return 'caution'
  return 'high-risk'
}

function summaryFor(fixture: AnalysisFixture): string {
  if (fixture.id === 'safe-01') return 'Few visible warning signals were found. Verify the company independently before applying.'
  if (fixture.id === 'suspicious-01') return 'This post contains several warning signals that should be verified before you proceed.'
  if (fixture.id === 'informal-01') return 'The post has a personal email signal, but it also includes a clear role and school application path.'
  return 'This post has missing details and some warning signals. Request more information before you proceed.'
}

function uncertaintyFor(fixture: AnalysisFixture): string {
  if (fixture.expected.missingInformation.length === 0) return 'This estimate is based on the visible details in the submitted post.'
  return `This estimate has ${fixture.expected.confidence} confidence because the post does not provide ${fixture.expected.missingInformation.slice(0, 2).join(' or ')}.`
}
