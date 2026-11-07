import { getFixtureTitle } from './analysisFixtures'
import { RULE_CATALOG } from './ruleCatalog'
import type { AnalysisReport, SourceType } from '../types/analysis'

const guideFixtures: Partial<Record<string, string>> = {
  'payment-request': 'suspicious-01',
  'suspicious-email': 'informal-01',
  'vague-company': 'incomplete-01',
  'vague-role': 'incomplete-01',
  'unrealistic-compensation': 'suspicious-01',
  'urgency-pressure': 'suspicious-01',
  'chat-only-hiring': 'suspicious-01',
  'sensitive-information': 'suspicious-01',
}

export const guideEntries = RULE_CATALOG.map((rule) => ({
  id: rule.category,
  title: rule.title,
  description: rule.explanation,
  rationale: rule.rationale,
  safetyTip: rule.nextAction,
  fixtureId: guideFixtures[rule.category] ?? 'suspicious-01',
}))

export const sourceLabels: Record<SourceType, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  email: 'Email',
  messenger: 'Messenger',
  'school-group': 'School group',
  'school-referral': 'School referral',
  'student-group-chat': 'Student group chat',
  'messenger-forward': 'Forwarded message',
  other: 'Other',
  'public-link': 'Public link',
}

export const reusableChecklist = [
  'Verify the company website and official pages.',
  'Check that the recruiter email matches the company domain.',
  'Request a clear role description and supervisor details.',
  'Do not pay before independent verification.',
  'Do not send IDs or bank details too early.',
]

export const generalChecklistStorageKey = 'hunch.general-checklist'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export function riskLabel(report: AnalysisReport) {
  return report.riskLevel === 'low-risk' ? 'Low risk' : report.riskLevel === 'high-risk' ? 'High risk' : 'Caution'
}

export function reportTitle(report: AnalysisReport) {
  return report.listingTitle ?? getFixtureTitle(report.fixtureId)
}

export function sourceLabel(report: AnalysisReport) {
  return sourceLabels[report.sourceType]
}

export function completedChecklistCount(report: AnalysisReport) {
  return report.checklist.filter((item) => item.completed).length
}
