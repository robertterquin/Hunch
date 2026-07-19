export type RiskLevel = 'low-risk' | 'caution' | 'high-risk'

export type ResultState =
  | 'low-risk'
  | 'caution'
  | 'high-risk'
  | 'partial-uncertain'

export type Confidence = 'low' | 'medium' | 'high'

export type RiskCategory =
  | 'payment-request'
  | 'suspicious-email'
  | 'vague-company'
  | 'vague-role'
  | 'unrealistic-compensation'
  | 'urgency-pressure'
  | 'chat-only-hiring'
  | 'sensitive-information'

export type SourceType =
  | 'facebook'
  | 'linkedin'
  | 'email'
  | 'messenger'
  | 'school-group'
  | 'school-referral'
  | 'student-group-chat'
  | 'messenger-forward'
  | 'other'
  | 'screenshot'

export interface EvidenceMatch {
  category: RiskCategory
  text: string
}

export interface FixtureExpectedResult {
  riskLevel: RiskLevel
  scoreRange: [number, number]
  confidence: Confidence
  findingCategories: RiskCategory[]
  nonTriggeringCategories?: RiskCategory[]
  evidence?: EvidenceMatch[]
  missingInformation: string[]
  checklistThemes: string[]
  calibrationNote?: string
  reviewNotes?: string[]
}

export interface AnalysisFixture {
  id: string
  kind: string
  sourceType: SourceType
  title: string
  text: string
  expected: FixtureExpectedResult
}

export interface AnalysisInput {
  text: string
  sourceType: SourceType
  fixtureId?: string
}

export interface RedFlag {
  id: string
  category: RiskCategory
  title: string
  severity: 'medium' | 'high'
  explanation: string
  evidence: string
  scoreImpact: number
  confidence: Confidence
  nextAction: string
}

export interface ChecklistItem {
  id: string
  label: string
  reason: string
  completed: boolean
  relatedCategory?: RiskCategory
}

export interface AnalysisReport {
  id: string
  fixtureId: string
  listingTitle?: string
  sourceType: SourceType
  originalText: string
  riskScore: number
  riskLevel: RiskLevel
  resultState: ResultState
  confidence: Confidence
  summary: string
  uncertainty: string
  flags: RedFlag[]
  missingInformation: string[]
  checklist: ChecklistItem[]
  analysisVersion: string
  createdAt: string
}
