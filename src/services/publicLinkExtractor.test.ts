import type { VercelRequest, VercelResponse } from '@vercel/node'
import { afterEach, describe, expect, it } from 'vitest'
import extractLink, { LinkExtractionError, extractPublicLink, extractReadableHtml, isBlockedIpAddress, parsePublicUrl } from '../../api/extract-link'
import { resetRateLimitForTests } from '../../api/rate-limit'

const pageHtml = '<html><head><title>Public Marketing OJT</title></head><body><main><h1>Marketing OJT</h1><p>Join a named company for an internship with a supervisor, clear work details, and an official application route.</p></main><script>ignore me</script></body></html>'
const publicHost = async () => undefined

afterEach(() => {
  resetRateLimitForTests()
})

function responseDouble() {
  const output = { statusCode: 0, body: undefined as Record<string, unknown> | undefined, headers: {} as Record<string, string> }
  const response = {
    status(statusCode: number) { output.statusCode = statusCode; return this },
    json(body: Record<string, unknown>) { output.body = body; return this },
    setHeader(name: string, value: string) { output.headers[name] = value },
  } as unknown as VercelResponse
  return { response, output }
}

describe('public-link extractor safeguards', () => {
  it('accepts public HTTP(S) links and removes URL fragments', () => {
    expect(parsePublicUrl('https://jobs.example.test/ojt#apply').toString()).toBe('https://jobs.example.test/ojt')
  })

  it('rejects unsupported, localhost, private IPv4 and reserved IPv6 targets', () => {
    expect(() => parsePublicUrl('file:///listing.html')).toThrow(LinkExtractionError)
    expect(() => parsePublicUrl('http://localhost/listing')).toThrow(LinkExtractionError)
    expect(() => parsePublicUrl('http://192.168.1.5/listing')).toThrow(LinkExtractionError)
    expect(isBlockedIpAddress('127.0.0.1')).toBe(true)
    expect(isBlockedIpAddress('169.254.169.254')).toBe(true)
    expect(isBlockedIpAddress('::1')).toBe(true)
    expect(isBlockedIpAddress('::ffff:7f00:1')).toBe(true)
    expect(isBlockedIpAddress('fd00::1')).toBe(true)
    expect(isBlockedIpAddress('2001:db8::1')).toBe(true)
    expect(isBlockedIpAddress('8.8.8.8')).toBe(false)
  })

  it('extracts readable HTML and rejects pages outside the analysis text range', () => {
    const page = extractReadableHtml(pageHtml, 'https://jobs.example.test/ojt')
    expect(page.title).toBe('Public Marketing OJT')
    expect(page.text).toContain('named company')
    expect(() => extractReadableHtml('<html><body>Too short</body></html>', 'https://jobs.example.test/ojt')).toThrow(LinkExtractionError)
    expect(() => extractReadableHtml(`<html><body>${'listing text '.repeat(1_100)}</body></html>`, 'https://jobs.example.test/ojt')).toThrow(LinkExtractionError)
  })

  it('follows a safe canonical redirect and extracts the title and text', async () => {
    const fetchFn = async (url: URL | RequestInfo) => String(url).includes('/old')
      ? new Response(null, { status: 302, headers: { location: '/marketing-ojt' } })
      : new Response(pageHtml, { status: 200, headers: { 'content-type': 'text/html' } })

    await expect(extractPublicLink('https://jobs.example.test/old', { fetchFn, verifyHost: publicHost })).resolves.toMatchObject({
      url: 'https://jobs.example.test/marketing-ojt',
      title: 'Public Marketing OJT',
    })
  })

  it('returns safe recovery errors for timeout, oversized, non-HTML, and JavaScript-only pages', async () => {
    const cases: Array<{ response: Promise<Response>; code: string }> = [
      { response: Promise.resolve(new Response('file', { status: 200, headers: { 'content-type': 'application/pdf' } })), code: 'NOT_HTML' },
      { response: Promise.resolve(new Response('<html><body>small</body></html>', { status: 200, headers: { 'content-type': 'text/html' } })), code: 'PAGE_TOO_SHORT' },
      { response: Promise.resolve(new Response('<html><body><script>document.write("listing")</script></body></html>', { status: 200, headers: { 'content-type': 'text/html' } })), code: 'PAGE_TOO_SHORT' },
      { response: Promise.resolve(new Response('ignored', { status: 200, headers: { 'content-type': 'text/html', 'content-length': '1000001' } })), code: 'PAGE_TOO_LARGE' },
    ]
    for (const testCase of cases) {
      await expect(extractPublicLink('https://jobs.example.test/ojt', { fetchFn: () => testCase.response, verifyHost: publicHost })).rejects.toMatchObject({ code: testCase.code })
    }
    await expect(extractPublicLink('https://jobs.example.test/ojt', { fetchFn: async () => { throw { name: 'AbortError' } }, verifyHost: publicHost })).rejects.toMatchObject({ code: 'FETCH_TIMEOUT' })
  })

  it('rejects invalid request methods and bodies before fetching a page', async () => {
    const method = responseDouble()
    await extractLink({ method: 'GET', body: {} } as VercelRequest, method.response)
    expect(method.output.statusCode).toBe(405)
    expect(method.output.headers.Allow).toBe('POST')

    const invalid = responseDouble()
    await extractLink({ method: 'POST', body: {} } as VercelRequest, invalid.response)
    expect(invalid.output.statusCode).toBe(400)
  })

  it('rate limits repeated public-link extraction requests', async () => {
    for (let index = 0; index < 8; index += 1) {
      const { response, output } = responseDouble()
      await extractLink({ method: 'POST', headers: {}, body: { url: 'not-a-url' } } as VercelRequest, response)
      expect(output.statusCode).toBe(400)
    }

    const limited = responseDouble()
    await extractLink({ method: 'POST', headers: {}, body: { url: 'not-a-url' } } as VercelRequest, limited.response)
    expect(limited.output.statusCode).toBe(429)
    expect(limited.output.headers['Retry-After']).toBeDefined()
  })
})
