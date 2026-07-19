import { z } from 'zod'
import { analyzeListingWithExplanation } from './openaiAnalysisService'

const ExtractedLinkSchema = z.object({
  url: z.string().url().max(2_048),
  title: z.string().min(1).max(240).optional(),
  text: z.string().trim().min(40).max(12_000),
}).strict()

const LinkErrorSchema = z.object({ message: z.string().min(1).max(500) }).passthrough()

export async function analyzePublicLink(sourceUrl: string) {
  const response = await fetch('/api/extract-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: sourceUrl.trim() }),
  })
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = LinkErrorSchema.safeParse(payload)
    throw new Error(error.success ? error.data.message : 'Hunch could not read that public page. Paste the listing text manually instead.')
  }
  const extracted = ExtractedLinkSchema.safeParse(payload)
  if (!extracted.success) throw new Error('Hunch received an invalid page extraction. Paste the listing text manually instead.')
  return analyzeListingWithExplanation({
    text: extracted.data.text,
    sourceType: 'public-link',
    sourceUrl: extracted.data.url,
    listingTitle: extracted.data.title,
  })
}
