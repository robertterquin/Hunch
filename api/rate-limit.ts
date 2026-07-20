import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
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

interface SharedLimiter {
  limit: (identifier: string) => Promise<{ success: boolean; remaining: number; reset: number }>
}

const storeKey = '__hunchRateLimitBuckets'
const sharedLimiters = new Map<string, SharedLimiter>()
const MAX_FALLBACK_BUCKETS = 10_000
let sharedLimiterStatus: 'unknown' | 'available' | 'unavailable' = 'unknown'

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
  return `${prefix}:${candidate.slice(0, 128)}`
}

function pruneFallbackBuckets(now: number) {
  const store = buckets()
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key)
  }
  while (store.size > MAX_FALLBACK_BUCKETS) {
    const oldest = store.keys().next().value
    if (!oldest) break
    store.delete(oldest)
  }
}

function getSharedLimiter(options: RateLimitOptions) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token || sharedLimiterStatus === 'unavailable') return null

  const key = `${options.prefix}:${options.limit}:${options.windowMs}`
  const existing = sharedLimiters.get(key)
  if (existing) return existing

  try {
    const redis = new Redis({ url, token })
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(options.limit, `${Math.ceil(options.windowMs / 1000)} s`),
      prefix: `hunch:${options.prefix}`,
    })
    sharedLimiters.set(key, limiter)
    sharedLimiterStatus = 'available'
    return limiter
  } catch {
    sharedLimiterStatus = 'unavailable'
    return null
  }
}

function consumeFallback(request: VercelRequest, options: RateLimitOptions) {
  const now = Date.now()
  pruneFallbackBuckets(now)
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

export async function consumeRateLimit(request: VercelRequest, options: RateLimitOptions) {
  const sharedLimiter = getSharedLimiter(options)
  if (sharedLimiter) {
    try {
      const result = await sharedLimiter.limit(rateLimitKey(request, options.prefix))
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfterSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      }
    } catch {
      sharedLimiterStatus = 'unavailable'
    }
  }
  return consumeFallback(request, options)
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
  sharedLimiters.clear()
  sharedLimiterStatus = 'unknown'
}
