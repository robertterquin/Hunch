import { analysisFixtures, getFixtureById } from '../data/analysisFixtures'
import { RULE_ENGINE_VERSION } from '../data/ruleCatalog'
import { runRuleEngine, type RuleEngineResult } from './ruleEngine'
import type { AnalysisFixture, AnalysisInput, AnalysisReport, ChecklistItem, SourceType } from '../types/analysis'

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

function chooseFixture(input: AnalysisInput): AnalysisFixture | undefined {
  if (input.fixtureId) {
    const requestedFixture = getFixtureById(input.fixtureId)
    if (requestedFixture) return requestedFixture
  }

  const exactFixture = analysisFixtures.find((fixture) => fixture.text.trim() === input.text.trim())
  if (exactFixture) return exactFixture

  const normalizedText = input.text.toLowerCase()
  const matchingFixtureId = normalizedText.includes('registration fee') || normalizedText.includes('bank account')
    ? 'suspicious-01'
    : normalizedText.includes('school placement') && normalizedText.includes('gmail')
      ? 'informal-01'
      : normalizedText.includes('supervisor') && normalizedText.includes('website')
        ? 'safe-01'
        : undefined
  return matchingFixtureId ? getFixtureById(matchingFixtureId) : undefined
}

function makeFlags(result: RuleEngineResult) {
  return result.findings.map((finding, index) => ({
    id: `${finding.ruleId}-${index + 1}`,
    ruleId: finding.ruleId,
    source: 'rule' as const,
    category: finding.category,
    title: finding.title,
    severity: finding.severity,
    explanation: finding.explanation,
    evidence: finding.evidence,
    scoreImpact: finding.scoreImpact,
    confidence: finding.confidence,
    nextAction: finding.nextAction,
  }))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function makeChecklist(result: RuleEngineResult, fixture?: AnalysisFixture): ChecklistItem[] {
  const themes = result.findings.length > 0
    ? result.findings.map((finding) => finding.nextAction)
    : fixture?.expected.checklistThemes ?? ['verify the company independently before applying']
  return [...new Set(themes)].map((theme, index) => {
    const finding = result.findings[index]
    return {
      id: `${finding?.ruleId ?? 'general-verification'}-check-${index + 1}`,
      label: capitalize(theme),
      reason: finding?.explanation ?? 'A practical verification step before applying.',
      completed: false,
      relatedCategory: finding?.category,
    }
  })
}

function resultStateFor(result: RuleEngineResult) {
  if (result.confidence === 'low' || result.missingInformation.length > 3) return 'partial-uncertain' as const
  return result.riskLevel
}

function summaryFor(result: RuleEngineResult) {
  if (result.riskLevel === 'high-risk') return 'This post contains several visible warning signals that should be verified before you proceed.'
  if (result.findings.length === 0 && result.confidence === 'high') return 'Few visible warning signals were found. Verify the company independently before applying.'
  if (result.findings.length === 0) return 'The available details do not show a major warning category, but independent verification is still important.'
  return 'This post has some warning signals or missing details. Request more information before you proceed.'
}

function uncertaintyFor(result: RuleEngineResult) {
  if (result.missingInformation.length === 0) return 'This estimate is based on the visible details in the submitted post.'
  return `This estimate has ${result.confidence} confidence because the post does not provide ${result.missingInformation.slice(0, 2).join(' or ')}.`
}

function makeReport(result: RuleEngineResult, options: { fixture?: AnalysisFixture; id?: string; sourceType: SourceType; text: string; createdAt?: string }): AnalysisReport {
  return {
    id: options.id ?? `analysis-${Date.now()}`,
    fixtureId: options.fixture?.id ?? 'custom-listing',
    listingTitle: options.fixture?.title ?? 'Submitted listing',
    sourceType: options.sourceType,
    originalText: options.text,
    riskScore: result.score,
    riskLevel: result.riskLevel,
    resultState: resultStateFor(result),
    confidence: result.confidence,
    summary: summaryFor(result),
    uncertainty: uncertaintyFor(result),
    flags: makeFlags(result),
    missingInformation: result.missingInformation,
    checklist: makeChecklist(result, options.fixture),
    scoreBreakdown: result.scoreBreakdown,
    analysisVersion: RULE_ENGINE_VERSION,
    createdAt: options.createdAt ?? new Date().toISOString(),
  }
}

export function createMockReport(
  fixture: AnalysisFixture,
  options: { id?: string; sourceType?: AnalysisInput['sourceType']; text?: string; createdAt?: string } = {},
): AnalysisReport {
  const text = options.text ?? fixture.text
  return makeReport(runRuleEngine(text), { fixture, id: options.id, sourceType: options.sourceType ?? fixture.sourceType, text, createdAt: options.createdAt })
}

export async function analyzeListing(input: AnalysisInput): Promise<AnalysisReport> {
  const normalizedText = input.text.trim()
  if (normalizedText.length < 40) throw new Error('Paste at least 40 characters so Hunch has enough detail to analyze.')
  await delay(320)
  const fixture = chooseFixture({ ...input, text: normalizedText })
  return makeReport(runRuleEngine(normalizedText), { fixture, sourceType: input.sourceType, text: normalizedText })
}
