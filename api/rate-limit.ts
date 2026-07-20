import type { VercelRequest, VercelResponse } from '@vercel/node'

interface RateLimitOptions {
  prefix: string
  limit: number
  windowMs: number
}

interface Bucket {
  count: number
  resetAt: number
}

const storeKey = '__hunchRateLimitBuckets'

function buckets() {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: Map<string, Bucket> }
  globalStore[storeKey] ??= new Map<string, Bucket>()
  return globalStore[storeKey]
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function rateLimitKey(request: VercelRequest, prefix: string) {
  const headers = request.headers ?? {}
  const forwardedFor = firstHeaderValue(headers['x-forwarded-for'])
  const realIp = firstHeaderValue(headers['x-real-ip'])
  const candidate = forwardedFor?.split(',')[0]?.trim() || realIp?.trim() || 'anonymous'
  return `${prefix}:${candidate}`
}

export function consumeRateLimit(request: VercelRequest, options: RateLimitOptions) {
  const now = Date.now()
  const key = rateLimitKey(request, options.prefix)
  const current = buckets().get(key)

  if (!current || current.resetAt <= now) {
    buckets().set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 }
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  return {
    allowed: true,
    remaining: options.limit - current.count,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  }
}

export function sendRateLimited(response: VercelResponse, retryAfterSeconds: number) {
  response.setHeader('Retry-After', String(retryAfterSeconds))
  return response.status(429).json({
    error: 'RATE_LIMITED',
    message: 'Too many requests from this connection. Wait a moment, then try again.',
  })
}

export function resetRateLimitForTests() {
  buckets().clear()
}
