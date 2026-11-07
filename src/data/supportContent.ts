import { getFixtureById, getFixtureTitle } from './analysisFixtures'
import { RULE_CATALOG } from './ruleCatalog'
import type { AnalysisReport, RiskCategory, SourceType } from '../types/analysis'

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

export const categoryIcons: Record<RiskCategory, string> = {
  'payment-request': 'ph:currency-circle-dollar',
  'suspicious-email': 'ph:envelope-simple',
  'vague-company': 'ph:buildings',
  'vague-role': 'ph:briefcase',
  'unrealistic-compensation': 'ph:money',
  'urgency-pressure': 'ph:timer',
  'chat-only-hiring': 'ph:chat-circle-dots',
  'sensitive-information': 'ph:identification-card',
}

const guideSummaries: Record<RiskCategory, string> = {
  'payment-request': 'Real OJT placements don’t charge training or registration fees.',
  'suspicious-email': 'A free inbox instead of a company address.',
  'vague-company': 'You can’t check who is offering it.',
  'vague-role': 'No clear tasks, hours or supervisor.',
  'unrealistic-compensation': 'High, guaranteed pay for vague work.',
  'urgency-pressure': 'Pushes you to skip normal checks.',
  'chat-only-hiring': 'No official email or website to apply through.',
  'sensitive-information': 'Don’t send documents until the placement is verified.',
}

/** Shown when a check finds nothing for a category. Phrased as "not found", never as proof. */
export const passedCheckLabels: Record<RiskCategory, string> = {
  'payment-request': 'No fee before starting',
  'sensitive-information': 'No early ID or bank requests',
  'urgency-pressure': 'No urgency pressure',
  'unrealistic-compensation': 'No pay that seems too high',
  'vague-company': 'No missing company details',
  'vague-role': 'No vague role description',
  'suspicious-email': 'No personal email address',
  'chat-only-hiring': 'No chat-app-only hiring',
}

const exampleEvidence = getFixtureById('suspicious-01')?.expected.evidence ?? []

export const guideEntries = RULE_CATALOG.map((rule) => ({
  id: rule.category,
  title: rule.title,
  summary: guideSummaries[rule.category],
  description: rule.explanation,
  rationale: rule.rationale,
  safetyTip: rule.nextAction,
  severity: rule.severity,
  icon: categoryIcons[rule.category],
  example: exampleEvidence.find((item) => item.category === rule.category)?.text,
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
  { label: 'Verify the company website', reason: 'Search the name yourself, not through links in the post.' },
  { label: 'Check the recruiter’s email matches the company', reason: 'name@company.com, not a free Gmail or Yahoo address.' },
  { label: 'Get the role description and supervisor', reason: 'You should know your tasks, hours and who you report to.' },
  { label: 'Don’t pay before it’s verified', reason: 'Real OJT placements don’t charge training or registration fees.' },
  { label: 'Don’t send IDs or bank details early', reason: 'Wait until your school confirms the placement.' },
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
