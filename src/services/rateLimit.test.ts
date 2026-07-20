import type { VercelRequest } from '@vercel/node'
import { afterEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  calls: 0,
  shouldFail: false,
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {},
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    static fixedWindow() { return {} }
    async limit() {
      state.calls += 1
      if (state.shouldFail) throw new Error('provider unavailable')
      return { success: state.calls <= 2, remaining: Math.max(0, 2 - state.calls), reset: Date.now() + 60_000 }
    }
  },
}))

import { consumeRateLimit, resetRateLimitForTests } from '../../api/rate-limit'

const request = { headers: { 'x-forwarded-for': '203.0.113.10' } } as unknown as VercelRequest
const options = { prefix: 'test', limit: 2, windowMs: 60_000 }

afterEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
  state.calls = 0
  state.shouldFail = false
  resetRateLimitForTests()
})

describe('shared rate limiting', () => {
  it('uses the shared limiter when configured', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

    await expect(consumeRateLimit(request, options)).resolves.toMatchObject({ allowed: true })
    await expect(consumeRateLimit(request, options)).resolves.toMatchObject({ allowed: true })
    await expect(consumeRateLimit(request, options)).resolves.toMatchObject({ allowed: false })
    expect(state.calls).toBe(3)
  })

  it('falls back locally when the shared provider fails', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    state.shouldFail = true

    await expect(consumeRateLimit(request, options)).resolves.toMatchObject({ allowed: true })
    expect(state.calls).toBe(1)
  })
})
