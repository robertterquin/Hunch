import { OpenAIExplanationSchema, type OpenAIExplanation } from './openaiAnalysisSchema'
import { buildRuleOnlyReport } from './mockAnalysisService'
import { runRuleEngine, type RuleEngineResult } from './ruleEngine'
import type { AnalysisInput, AnalysisReport, ChecklistItem, RedFlag } from '../types/analysis'

const MIN_LISTING_LENGTH = 40
const MAX_LISTING_LENGTH = 12_000
const REQUEST_TIMEOUT_MS = 15_000
const ANALYSIS_VERSION = 'rules-1.0.0+openai-explanation-1.0.0'

function uniqueStrings(values: string[]) {
  return [...new Map(values.map((value) => [value.trim().toLowerCase(), value.trim()])).values()]
}

function fallbackReport(input: AnalysisInput, result: RuleEngineResult, note: string) {
  return {
    ...buildRuleOnlyReport({ ...input, text: result.normalized.text }, result),
    explanationSource: 'rule-only-fallback' as const,
    explanationNote: note,
  }
}

function publicRuleFindings(result: RuleEngineResult) {
  return result.findings.slice(0, 8).map((finding) => ({
    ruleId: finding.ruleId,
    category: finding.category,
    title: finding.title,
    severity: finding.severity,
    scoreImpact: finding.scoreImpact,
    evidence: finding.evidence,
    confidence: finding.confidence,
    explanation: finding.explanation,
    nextAction: finding.nextAction,
  }))
}

function mergeFlags(report: AnalysisReport, explanation: OpenAIExplanation): RedFlag[] {
  const explanationsByRule = new Map(explanation.redFlagExplanations.map((item) => [item.ruleId, item]))
  return report.flags.map((flag) => {
    const aiExplanation = explanationsByRule.get(flag.ruleId)
    if (!aiExplanation) return flag
    return { ...flag, explanation: aiExplanation.explanation }
  })
}

function normalizedLabel(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, ' ')
}

function mergeChecklist(report: AnalysisReport, explanation: OpenAIExplanation): ChecklistItem[] {
  const existing = [...report.checklist]
  const seen = new Set(existing.map((item) => normalizedLabel(item.label)))
  explanation.checklist.forEach((item, index) => {
    const key = normalizedLabel(item.label)
    if (!key || seen.has(key)) return
    seen.add(key)
    existing.push({
      id: `ai-check-${index + 1}`,
      label: item.label,
      reason: item.reason,
      completed: false,
      relatedCategory: item.relatedCategory ?? undefined,
    })
  })
  return existing
}

function mergeReport(report: AnalysisReport, explanation: OpenAIExplanation): AnalysisReport {
  const uncertainty = uniqueStrings([explanation.uncertainty.join(' '), report.uncertainty]).filter(Boolean).join(' ')
  return {
    ...report,
    summary: explanation.summary,
    uncertainty,
    missingInformation: uniqueStrings([...report.missingInformation, ...explanation.missingInformation]),
    flags: mergeFlags(report, explanation),
    checklist: mergeChecklist(report, explanation),
    studentAdvice: explanation.studentAdvice,
    explanationSource: 'openai',
    explanationNote: 'The score and warning evidence are based on the details Hunch found in the listing.',
    analysisVersion: ANALYSIS_VERSION,
  }
}

async function publicApiError(response: Response) {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') return body.message
  } catch {
    // Use the generic message below when the server did not return JSON.
  }
  return 'We could not prepare the full explanation right now.'
}

export async function analyzeListingWithExplanation(input: AnalysisInput): Promise<AnalysisReport> {
  const normalizedText = input.text.trim()
  if (normalizedText.length < MIN_LISTING_LENGTH) {
    throw new Error('Paste at least 40 characters so Hunch has enough detail to analyze.')
  }

  const ruleResult = runRuleEngine(normalizedText)
  if (normalizedText.length > MAX_LISTING_LENGTH) {
    return fallbackReport(input, ruleResult, 'This listing is longer than Hunch can explain at once, so the confirmed findings are shown below.')
  }

  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingText: ruleResult.normalized.text,
        ruleFindings: publicRuleFindings(ruleResult),
        riskScore: ruleResult.score,
        riskLevel: ruleResult.riskLevel,
        missingInformation: ruleResult.missingInformation,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(await publicApiError(response))
    const body: unknown = await response.json()
    const parsed = OpenAIExplanationSchema.safeParse(body)
    if (!parsed.success) throw new Error('The explanation could not be prepared in the expected format.')
    return mergeReport(buildRuleOnlyReport({ ...input, text: normalizedText }, ruleResult), parsed.data)
  } catch (error) {
    const reason = error instanceof Error && error.message.startsWith('The explanation') ? ` ${error.message}` : ''
    return fallbackReport(input, ruleResult, `Some wording support was unavailable right now.${reason} The confirmed findings are still available.`)
  } finally {
    globalThis.clearTimeout(timeoutId)
  }
}
