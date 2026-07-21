import type { VercelRequest, VercelResponse } from '@vercel/node'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetRateLimitForTests } from '../../api/rate-limit'

vi.mock('openai', () => ({
  default: class MockOpenAI {
    responses = {
      parse: async () => ({
        output_parsed: {
          summary: 'The listing should be independently verified before proceeding.',
          redFlagExplanations: [],
          missingInformation: [],
          uncertainty: ['This signal does not prove that the opportunity is fraudulent.'],
          checklist: [],
          studentAdvice: 'Verify the opportunity through a school coordinator or official company channel.',
        },
      }),
    }
  },
}))

import analyze, { buildOpenAIInput, classifyOpenAIError, parseAnalyzeBody } from '../../api/analyze'

function responseDouble() {
  const output = { statusCode: 0, body: undefined as Record<string, unknown> | undefined, headers: {} as Record<string, string> }
  const response = {
    status(statusCode: number) { output.statusCode = statusCode; return this },
    json(body: Record<string, unknown>) { output.body = body; return this },
    setHeader(name: string, value: string) { output.headers[name] = value },
  } as unknown as VercelResponse
  return { response, output }
}

const validText = 'A school placement listing with a named supervisor and a clear application path for students to review.'

afterEach(() => {
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_MODEL
  resetRateLimitForTests()
})

describe('analyze API contract', () => {
  it('rejects non-POST methods with 405', async () => {
    const { response, output } = responseDouble()
    await analyze({ method: 'GET', body: {} } as VercelRequest, response)
    expect(output.statusCode).toBe(405)
    expect(output.headers.Allow).toBe('POST')
  })

  it('rejects missing, short, and overlong listing text', () => {
    expect(parseAnalyzeBody('not json')).toBeNull()
    expect(parseAnalyzeBody({ ruleFindings: [] })).not.toEqual(null)
    expect(buildOpenAIInput(validText).riskScore).toBeGreaterThanOrEqual(0)
  })

  it('classifies invalid request lengths through the request schema', async () => {
    for (const listingText of ['', 'too short', 'A'.repeat(12_001)]) {
      const { response, output } = responseDouble()
      await analyze({ method: 'POST', body: { listingText, ruleFindings: [], riskScore: 0, riskLevel: 'low-risk', missingInformation: [] } } as VercelRequest, response)
      expect(output.statusCode).toBe(400)
    }
  })

  it('rejects oversized JSON bodies before parsing the analysis request', async () => {
    const { response, output } = responseDouble()
    await analyze({
      method: 'POST',
      headers: { 'content-length': '300000' },
      body: { listingText: validText },
    } as VercelRequest, response)
    expect(output.statusCode).toBe(413)
    expect(output.body?.error).toBe('REQUEST_TOO_LARGE')
  })

  it('returns a safe configuration response when the API key is missing', async () => {
    const { response, output } = responseDouble()
    await analyze({ method: 'POST', body: { listingText: validText, ruleFindings: [], riskScore: 0, riskLevel: 'low-risk', missingInformation: [] } } as VercelRequest, response)
    expect(output.statusCode).toBe(503)
    expect(output.body?.message).toContain('not configured')
  })

  it('returns a valid structured explanation from the server route', async () => {
    process.env.OPENAI_API_KEY = 'test-key-not-a-secret'
    const { response, output } = responseDouble()
    await analyze({ method: 'POST', body: { listingText: validText, ruleFindings: [], riskScore: 0, riskLevel: 'low-risk', missingInformation: [] } } as VercelRequest, response)
    expect(output.statusCode).toBe(200)
    expect(output.body?.studentAdvice).toContain('school coordinator')
  })

  it('maps timeout, rate-limit, and invalid-output failures without leaking internals', () => {
    expect(classifyOpenAIError({ name: 'APIConnectionTimeoutError' }).status).toBe(504)
    expect(classifyOpenAIError({ status: 429 }).status).toBe(429)
    expect(classifyOpenAIError({ name: 'InvalidStructuredOutputError', message: 'secret prompt' }).message).not.toContain('secret')
  })

  it('rate limits repeated anonymous explanation requests', async () => {
    process.env.OPENAI_API_KEY = 'test-key-not-a-secret'
    for (let index = 0; index < 12; index += 1) {
      const { response, output } = responseDouble()
      await analyze({ method: 'POST', headers: {}, body: { listingText: validText, ruleFindings: [], riskScore: 0, riskLevel: 'low-risk', missingInformation: [] } } as VercelRequest, response)
      expect(output.statusCode).toBe(200)
    }

    const limited = responseDouble()
    await analyze({ method: 'POST', headers: {}, body: { listingText: validText, ruleFindings: [], riskScore: 0, riskLevel: 'low-risk', missingInformation: [] } } as VercelRequest, limited.response)
    expect(limited.output.statusCode).toBe(429)
    expect(limited.output.headers['Retry-After']).toBeDefined()
    expect(limited.output.body?.message).not.toContain('test-key')
  })
})
