import { afterEach, describe, expect, it, vi } from 'vitest'

const { analyzeListingWithExplanation } = vi.hoisted(() => ({ analyzeListingWithExplanation: vi.fn() }))

vi.mock('./openaiAnalysisService', () => ({ analyzeListingWithExplanation }))

import { analyzePublicLink } from './linkAnalysisService'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('public-link analysis client', () => {
  it('passes extracted content to the existing analysis service with its canonical URL and title', async () => {
    const report = { id: 'report-1' }
    analyzeListingWithExplanation.mockResolvedValue(report)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        url: 'https://jobs.example.test/ojt',
        title: 'Marketing OJT',
        text: 'A public OJT listing with a named company, supervisor, and enough text for a meaningful Hunch analysis.',
      }),
    }))

    await expect(analyzePublicLink('https://jobs.example.test/ojt')).resolves.toBe(report)
    expect(analyzeListingWithExplanation).toHaveBeenCalledWith(expect.objectContaining({
      sourceType: 'public-link',
      sourceUrl: 'https://jobs.example.test/ojt',
      listingTitle: 'Marketing OJT',
    }))
  })

  it('returns the server recovery message when extraction is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'This page is private. Paste the listing text manually instead.' }),
    }))
    await expect(analyzePublicLink('https://private.example.test/ojt')).rejects.toThrow('Paste the listing text manually instead.')
  })
})
