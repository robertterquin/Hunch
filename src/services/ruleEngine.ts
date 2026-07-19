import { RULE_CATALOG, RULE_CATALOG_BY_ID, RULE_ENGINE_VERSION, type RuleDefinition } from '../data/ruleCatalog'
import type { Confidence, RiskCategory, RiskLevel, ScoreBreakdownItem } from '../types/analysis'

export interface NormalizedListing {
  originalText: string
  text: string
  lowerText: string
}

export interface RuleFinding {
  ruleId: string
  category: RiskCategory
  title: string
  severity: RuleDefinition['severity']
  scoreImpact: number
  evidence: string
  start: number
  end: number
  confidence: Confidence
  explanation: string
  nextAction: string
}

export interface RuleEngineResult {
  version: string
  normalized: NormalizedListing
  findings: RuleFinding[]
  score: number
  riskLevel: RiskLevel
  confidence: Confidence
  missingInformation: string[]
  scoreBreakdown: ScoreBreakdownItem[]
}

const personalEmailPattern = /\b[A-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail)\.[A-Z]{2,}\b/gi

export function normalizeListingText(input: string): NormalizedListing {
  const text = input.normalize('NFKC').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  return { originalText: input, text, lowerText: text.toLowerCase() }
}

function firstMatch(text: string, pattern: RegExp, valid: (match: RegExpMatchArray, start: number) => boolean = () => true) {
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  for (const match of text.matchAll(globalPattern)) {
    const start = match.index ?? 0
    if (valid(match, start)) {
      const trailingPunctuation = text.slice(start + match[0].length).match(/^[.!?]/)?.[0] ?? ''
      return { evidence: match[0] + trailingPunctuation, start, end: start + match[0].length + trailingPunctuation.length }
    }
  }
  return null
}

function isNegated(text: string, start: number) {
  const preceding = text.slice(Math.max(0, start - 80), start).toLowerCase()
  return /\b(?:no|without|never|won't|will not|do not|does not|don't)\b[^.!?]{0,60}$/.test(preceding)
}

function hasOfficialPath(text: string) {
  return /https?:\/\/|\b(?:careers?|application|apply|school placement|placement form|official)\b/i.test(text)
}

function hasNamedOrganization(text: string) {
  return /\b(?:inc\.?|llc|ltd\.?|corporation|services|lab|studio|agency|university|college)\b/i.test(text) || /https?:\/\/[^\s/]+/i.test(text)
}

function detectPersonalEmail(text: string) {
  const emails = [...text.matchAll(personalEmailPattern)]
  if (emails.length === 0 || (hasOfficialPath(text) && hasNamedOrganization(text))) return null
  const match = emails[0]
  const start = match.index ?? 0
  return { evidence: match[0], start, end: start + match[0].length }
}

function detectFinding(rule: RuleDefinition, normalized: NormalizedListing) {
  const text = normalized.text
  const lowerText = normalized.lowerText
  switch (rule.id) {
    case 'payment-before-start':
      return firstMatch(text, /\b(?:pay|payment|fee|registration fee|training fee|application fee|processing fee)\b[^.!?]{0,80}\b(?:before starting|before you start|today|upfront|fee)\b/i, (_match, start) => !isNegated(lowerText, start))
    case 'personal-recruiter-email':
      return detectPersonalEmail(text)
    case 'vague-company-identity':
      return firstMatch(text, /\b(?:our\s+)?company name(?: and website)?\s+(?:will be shared|not provided)[^.!?]*[.!?]?|\b(?:our|the)\s+(?:growing|leading|new|local)?\s*company\b(?!\s+name)|\b(?:no|without)\s+(?:company|organization)\s+(?:name|details)\b/i)
    case 'vague-role-details':
      return firstMatch(text, /\boffice work and online tasks,\s*flexible schedule\b|\boffice work and online tasks\b|\beasy\s+online\s+office\s+work\b|\bsimple\s+online\s+office\s+work\b|\bflexible schedule\b/i)
    case 'unclear-compensation':
      return firstMatch(text, /\b(?:earn|make|salary|allowance|pay)\b[^.!?]{0,80}\b(?:guaranteed|per month|monthly)\b/i)
    case 'urgency-pressure':
      return firstMatch(text, /\burgent!+|\b(?:instant hiring|limited slots available|limited slot available|limited slots?|no interview|apply today|today before)\b/i)
    case 'chat-only-application':
      return firstMatch(text, /\bto our recruiter on (?:whatsapp|messenger|telegram|viber)[^.!?]{0,45}\b(?:only|know more)\b|\bmessage the recruiter on (?:whatsapp|messenger|telegram|viber)[^.!?]{0,45}\b(?:only|know more)\b|\b(?:whatsapp|messenger|telegram|viber)\b[^.!?]{0,45}\b(?:only|message|know more)\b/i, (match) => /\bonly\b/i.test(match[0]) || !hasOfficialPath(text))
    case 'early-sensitive-data':
      return firstMatch(text, /\b(?:send|submit|provide|upload)\s+(?:your\s+)?(?:government ids?|government identification|bank account details?|bank details?|passwords?|selfies?|full personal documents?)[^.!?]{0,80}|\b(?:government ids?|government identification|bank account details?|bank details?|passwords?|selfies?|full personal documents?)\b/i, (_match, start) => !isNegated(lowerText, start))
    default:
      return null
  }
}

function confidenceFor(normalized: NormalizedListing, findings: RuleFinding[]): Confidence {
  if (findings.some((finding) => finding.severity === 'high') && findings.length >= 3) return 'high'
  if (/\b(?:supervisor|mentor)\b/i.test(normalized.text) && /https?:\/\//i.test(normalized.text) && /\b(?:role|responsibilit|placement)\b/i.test(normalized.text)) return findings.length > 0 ? 'medium' : 'high'
  if (findings.length > 0) return 'medium'
  return normalized.text.length > 160 ? 'medium' : 'low'
}

function missingInformationFor(findings: RuleFinding[]) {
  const missingByCategory: Partial<Record<RiskCategory, string>> = {
    'suspicious-email': 'an official recruiter email',
    'vague-company': 'company identity or an official website',
    'vague-role': 'specific responsibilities, schedule, or supervisor details',
    'unrealistic-compensation': 'clear compensation conditions',
    'chat-only-hiring': 'an official application channel',
    'payment-request': 'independent confirmation before payment',
    'sensitive-information': 'verification before sharing documents',
  }
  return [...new Set(findings.map((finding) => missingByCategory[finding.category]).filter((item): item is string => Boolean(item)))]
}

function riskLevelFor(score: number): RiskLevel {
  if (score <= 30) return 'low-risk'
  if (score <= 65) return 'caution'
  return 'high-risk'
}

export function runRuleEngine(input: string): RuleEngineResult {
  const normalized = normalizeListingText(input)
  if (!normalized.text) {
    return { version: RULE_ENGINE_VERSION, normalized, findings: [], score: 0, riskLevel: 'low-risk', confidence: 'low', missingInformation: ['listing text'], scoreBreakdown: [] }
  }

  const findings = RULE_CATALOG.flatMap((rule) => {
    const match = detectFinding(rule, normalized)
    if (!match) return []
    return [{
      ruleId: rule.id,
      category: rule.category,
      title: rule.title,
      severity: rule.severity,
      scoreImpact: rule.scoreImpact,
      evidence: match.evidence,
      start: match.start,
      end: match.end,
      confidence: rule.severity === 'high' ? 'high' : 'medium',
      explanation: rule.explanation,
      nextAction: rule.nextAction,
    } satisfies RuleFinding]
  })
  const personalEmailContext = [...normalized.text.matchAll(personalEmailPattern)].length > 0 && hasOfficialPath(normalized.text) && hasNamedOrganization(normalized.text)
  const scoreBreakdown: ScoreBreakdownItem[] = [{ ruleId: 'baseline-context', label: 'Baseline context', scoreImpact: 8 }]
  if (personalEmailContext) scoreBreakdown.push({ ruleId: 'context-personal-email', category: 'suspicious-email', label: 'Personal email balanced by public or school application path', scoreImpact: 10 })
  for (const finding of findings) scoreBreakdown.push({ ruleId: finding.ruleId, category: finding.category, label: finding.title, scoreImpact: finding.scoreImpact, evidence: finding.evidence })
  const score = Math.min(100, scoreBreakdown.reduce((total, item) => total + item.scoreImpact, 0))
  return { version: RULE_ENGINE_VERSION, normalized, findings, score, riskLevel: riskLevelFor(score), confidence: confidenceFor(normalized, findings), missingInformation: missingInformationFor(findings), scoreBreakdown }
}

export function getRuleDefinition(ruleId: string) {
  return RULE_CATALOG_BY_ID[ruleId]
}
