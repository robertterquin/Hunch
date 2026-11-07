import { describe, expect, it } from 'vitest'
import { getFixtureById } from '../data/analysisFixtures'
import { highlightPost } from '../lib/highlightPost'
import { buildRuleOnlyReport } from '../services/mockAnalysisService'
import type { RedFlag } from '../types/analysis'

const flag = (id: string, evidence: string, severity: RedFlag['severity'] = 'medium') => ({ id, evidence, severity }) as RedFlag

describe('highlightPost', () => {
  it('keeps the full text and numbers marks in reading order', () => {
    const text = 'Pay a fee today. Message us on WhatsApp only. URGENT hiring.'
    const { segments, numbers } = highlightPost(text, [flag('urgency', 'urgent'), flag('fee', 'Pay a fee today', 'high'), flag('chat', 'WhatsApp only')])

    expect(segments.map((segment) => segment.text).join('')).toBe(text)
    expect(numbers).toEqual({ fee: 1, chat: 2, urgency: 3 })
    expect(segments.filter((segment) => segment.flag).map((segment) => segment.text)).toEqual(['Pay a fee today', 'WhatsApp only', 'URGENT'])
  })

  it('drops overlapping evidence and numbers unfound flags last', () => {
    const { segments, numbers } = highlightPost('Send your ID to our recruiter on WhatsApp only.', [
      flag('chat', 'recruiter on WhatsApp'),
      flag('docs', 'Send your ID to our recruiter', 'high'),
      flag('missing', 'not in the text'),
    ])

    expect(segments.filter((segment) => segment.flag).map((segment) => segment.flag?.id)).toEqual(['docs'])
    expect(numbers).toEqual({ docs: 1, chat: 2, missing: 3 })
  })

  it('marks every finding on the fixture that trips all eight rules', () => {
    const fixture = getFixtureById('suspicious-01')!
    const report = buildRuleOnlyReport({ text: fixture.text, sourceType: fixture.sourceType, fixtureId: fixture.id })
    const { segments, numbers } = highlightPost(report.originalText, report.flags)

    expect(segments.map((segment) => segment.text).join('')).toBe(report.originalText)
    expect(Object.keys(numbers)).toHaveLength(report.flags.length)
    expect(segments.filter((segment) => segment.flag).length).toBeGreaterThanOrEqual(6)
  })
})
