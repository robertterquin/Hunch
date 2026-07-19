import { describe, expect, it } from 'vitest'
import { analysisFixtures } from '../data/analysisFixtures'
import { runRuleEngine } from './ruleEngine'

describe('rule engine fixture calibration', () => {
  for (const fixture of analysisFixtures) {
    it(`${fixture.id} stays inside its calibrated result contract`, () => {
      const result = runRuleEngine(fixture.text)
      const categories = result.findings.map((finding) => finding.category)

      expect(result.score).toBeGreaterThanOrEqual(fixture.expected.scoreRange[0])
      expect(result.score).toBeLessThanOrEqual(fixture.expected.scoreRange[1])
      expect(result.riskLevel).toBe(fixture.expected.riskLevel)
      expect(result.confidence).toBe(fixture.expected.confidence)
      expect([...new Set(categories)].sort()).toEqual([...fixture.expected.findingCategories].sort())

      for (const category of fixture.expected.nonTriggeringCategories ?? []) {
        expect(categories).not.toContain(category)
      }
      for (const evidence of fixture.expected.evidence ?? []) {
        if (!evidence.category) continue
        const finding = result.findings.find((item) => item.category === evidence.category)
        expect(finding?.evidence.toLowerCase()).toContain(evidence.text.toLowerCase())
      }
    })
  }
})

describe('rule engine safety behavior', () => {
  it('does not score explicit no-fee or do-not-send language as warnings', () => {
    const result = runRuleEngine('This placement has no application, training, or registration fee. We will not ask for passwords, bank details, or government IDs during initial screening. Apply through the school placement form for review.')
    expect(result.findings.map((finding) => finding.category)).not.toEqual(expect.arrayContaining(['payment-request', 'sensitive-information']))
  })

  it('keeps an informal personal email contextual when official paths are present', () => {
    const result = runRuleEngine('Northstar Student Tech Lab offers QA support through northstarstudentlab.example. Questions may use northstar.lab@gmail.com, but students apply through the school placement form and follow the school schedule.')
    expect(result.findings.map((finding) => finding.category)).not.toContain('suspicious-email')
    expect(result.score).toBeGreaterThanOrEqual(18)
  })

  it('caps repeated signals at 100 and keeps every finding explainable', () => {
    const result = runRuleEngine('URGENT instant hiring. Our growing company offers easy online office work. Pay a registration fee before starting. Send your government ID and bank account details to WhatsApp only. Earn PHP 35,000 every month, guaranteed. '.repeat(20))
    expect(result.score).toBe(100)
    expect(result.scoreBreakdown.length).toBeGreaterThan(result.findings.length)
    expect(result.findings.every((finding) => result.normalized.text.slice(finding.start, finding.end) === finding.evidence)).toBe(true)
  })

  it('normalizes whitespace and returns a safe empty-input result', () => {
    const normalized = runRuleEngine('  Clear   placement\r\n\r\nwith a supervisor.  ')
    expect(normalized.normalized.text).toBe('Clear placement\n\nwith a supervisor.')

    const empty = runRuleEngine('')
    expect(empty.score).toBe(0)
    expect(empty.confidence).toBe('low')
    expect(empty.missingInformation).toContain('listing text')
  })
})
