import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import { z } from 'zod'
import { consumeRateLimit, sendRateLimited } from './rate-limit.js'

const MAX_BODY_BYTES = 1_000_000
const MAX_REDIRECTS = 3
const FETCH_TIMEOUT_MS = 10_000
const EXTRACT_LINK_RATE_LIMIT = { prefix: 'extract-link', limit: 8, windowMs: 60_000 }

const LinkRequestSchema = z.object({
  url: z.string().trim().min(1).max(2_048),
}).strict()

export class LinkExtractionError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, status: number, message: string) {
    super(message)
    this.name = 'LinkExtractionError'
    this.code = code
    this.status = status
  }
}

export function parseExtractLinkBody(body: unknown) {
  if (typeof body !== 'string') return body
  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}

function isBlockedIpv4(address: string) {
  const octets = address.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true
  const [a, b] = octets
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19 || b === 51))
    || (a === 203 && b === 0)
    || a >= 224
}

function expandIpv6(address: string) {
  const [head, tail] = address.split('::')
  if (address.split('::').length > 2) return null
  const parseGroups = (part: string | undefined) => part ? part.split(':').filter(Boolean).map((group) => {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return NaN
    return Number.parseInt(group, 16)
  }) : []
  const headGroups = parseGroups(head)
  const tailGroups = parseGroups(tail)
  if ([...headGroups, ...tailGroups].some((group) => Number.isNaN(group)) || headGroups.length + tailGroups.length > 8) return null
  if (!address.includes('::') && headGroups.length !== 8) return null
  return [...headGroups, ...Array(8 - headGroups.length - tailGroups.length).fill(0), ...tailGroups]
}

export function isBlockedIpAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '')
  if (isIP(normalized) === 4) return isBlockedIpv4(normalized)
  if (isIP(normalized) !== 6) return true
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mappedIpv4) return isBlockedIpv4(mappedIpv4[1])
  const groups = expandIpv6(normalized)
  if (!groups) return true
  const isMapped = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff
  if (isMapped) return isBlockedIpv4(`${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`)
  const first = groups[0]
  return groups.every((group) => group === 0)
    || (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1)
    || (first & 0xffc0) === 0xfe80
    || (first & 0xfe00) === 0xfc00
    || (first & 0xff00) === 0xff00
    || (first === 0x2001 && groups[1] === 0x0db8)
}

export function parsePublicUrl(input: string) {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new LinkExtractionError('INVALID_URL', 400, 'Enter one valid public HTTP or HTTPS URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new LinkExtractionError('UNSUPPORTED_URL', 400, 'Only public HTTP or HTTPS links can be analyzed.')
  }
  if (url.username || url.password || url.port) {
    throw new LinkExtractionError('UNSAFE_URL', 400, 'Use a standard public website link without credentials or a custom port.')
  }
  const host = url.hostname.toLowerCase()
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new LinkExtractionError('BLOCKED_HOST', 400, 'That link points to a private or local address and cannot be analyzed.')
  }
  if (isIP(host) && isBlockedIpAddress(host)) {
    throw new LinkExtractionError('BLOCKED_ADDRESS', 400, 'That link points to a private or reserved address and cannot be analyzed.')
  }
  url.hash = ''
  return url
}

export async function verifyPublicHost(url: URL) {
  let records
  try {
    records = await lookup(url.hostname, { all: true, verbatim: true })
  } catch {
    throw new LinkExtractionError('HOST_UNAVAILABLE', 422, 'Hunch could not reach that public page. Paste the listing text manually instead.')
  }
  if (!records.length || records.some((record) => isBlockedIpAddress(record.address))) {
    throw new LinkExtractionError('BLOCKED_ADDRESS', 400, 'That link resolves to a private or reserved address and cannot be analyzed.')
  }
}

async function readLimitedBody(response: Response) {
  const contentLength = Number(response.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new LinkExtractionError('PAGE_TOO_LARGE', 413, 'This page is too large to analyze. Paste the relevant listing text manually instead.')
  }
  if (!response.body) throw new LinkExtractionError('EMPTY_PAGE', 422, 'This page did not return readable listing text. Paste the listing text manually instead.')

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > MAX_BODY_BYTES) {
        throw new LinkExtractionError('PAGE_TOO_LARGE', 413, 'This page is too large to analyze. Paste the relevant listing text manually instead.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

function normalizeText(value: string) {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function validateExtractedText(text: string) {
  if (text.length < 40) {
    throw new LinkExtractionError('PAGE_TOO_SHORT', 422, 'This page does not expose enough readable listing text. Paste the listing text manually instead.')
  }
  if (text.length > 12_000) {
    throw new LinkExtractionError('PAGE_TOO_LONG', 422, 'This page has too much readable text to analyze safely. Paste the relevant listing section manually instead.')
  }
}

export function extractReadableHtml(html: string, pageUrl: string) {
  const { document } = parseHTML(html)
  if (!document.documentElement) {
    const text = normalizeText(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    validateExtractedText(text)
    return { url: pageUrl, title: undefined, text }
  }
  document.querySelectorAll('script, style, noscript, svg, canvas, iframe, form, nav, footer, header, aside').forEach((element) => element.remove())
  let article: ReturnType<Readability['parse']> | null
  try {
    article = new Readability(document as unknown as Document, { charThreshold: 20 }).parse()
  } catch {
    article = null
  }
  const text = normalizeText(article?.textContent ?? document.body?.textContent ?? '')
  const title = normalizeText(article?.title ?? document.title ?? '')

  validateExtractedText(text)
  return { url: pageUrl, title: title.slice(0, 240) || undefined, text }
}

interface ExtractionDependencies {
  fetchFn?: typeof fetch
  verifyHost?: (url: URL) => Promise<void>
}

export async function extractPublicLink(input: string, dependencies: ExtractionDependencies = {}) {
  const fetchFn = dependencies.fetchFn ?? fetch
  const verifyHost = dependencies.verifyHost ?? verifyPublicHost
  let currentUrl = parsePublicUrl(input)
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await verifyHost(currentUrl)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let response: Response
    try {
      response = await fetchFn(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        credentials: 'omit',
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': 'HunchPublicLinkAnalyzer/1.0',
        },
        signal: controller.signal,
      })
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        throw new LinkExtractionError('FETCH_TIMEOUT', 504, 'This page took too long to load. Paste the listing text manually instead.')
      }
      throw new LinkExtractionError('FETCH_FAILED', 422, 'Hunch could not fetch that public page. Paste the listing text manually instead.')
    } finally {
      clearTimeout(timer)
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new LinkExtractionError('BAD_REDIRECT', 422, 'This page returned an unusable redirect. Paste the listing text manually instead.')
      if (redirectCount === MAX_REDIRECTS) throw new LinkExtractionError('TOO_MANY_REDIRECTS', 422, 'This link redirected too many times. Paste the listing text manually instead.')
      currentUrl = parsePublicUrl(new URL(location, currentUrl).toString())
      continue
    }
    if (!response.ok) {
      throw new LinkExtractionError('PAGE_UNAVAILABLE', 422, 'This public page is unavailable or blocked. Paste the listing text manually instead.')
    }
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new LinkExtractionError('NOT_HTML', 422, 'This link does not return an HTML page. Paste the listing text manually instead.')
    }
    const html = await readLimitedBody(response)
    return extractReadableHtml(html, currentUrl.toString())
  }
  throw new LinkExtractionError('TOO_MANY_REDIRECTS', 422, 'This link redirected too many times. Paste the listing text manually instead.')
}

export default async function extractLink(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Use POST to analyze a public link.' })
  }
  const rateLimit = consumeRateLimit(request, EXTRACT_LINK_RATE_LIMIT)
  if (!rateLimit.allowed) return sendRateLimited(response, rateLimit.retryAfterSeconds)

  const parsed = LinkRequestSchema.safeParse(parseExtractLinkBody(request.body))
  if (!parsed.success) return response.status(400).json({ error: 'INVALID_REQUEST', message: 'Provide one public HTTP or HTTPS URL.' })

  try {
    return response.status(200).json(await extractPublicLink(parsed.data.url))
  } catch (error) {
    if (error instanceof LinkExtractionError) return response.status(error.status).json({ error: error.code, message: error.message })
    return response.status(502).json({ error: 'LINK_UNAVAILABLE', message: 'Hunch could not read that public page. Paste the listing text manually instead.' })
  }
}
