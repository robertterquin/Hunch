import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

const CloudOcrRequestSchema = z.object({
  imageBase64: z.string().min(100).max(3_800_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
})

const VisionResponseSchema = z.object({
  responses: z.array(z.object({
    fullTextAnnotation: z.object({ text: z.string() }).optional(),
    error: z.object({ message: z.string().optional() }).optional(),
  })).min(1),
})

function parseBody(body: unknown) {
  if (typeof body !== 'string') return body
  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'METHOD_NOT_ALLOWED' })

  const input = CloudOcrRequestSchema.safeParse(parseBody(request.body))
  if (!input.success) return response.status(400).json({ error: 'INVALID_IMAGE' })

  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'CLOUD_OCR_UNAVAILABLE', message: 'Cloud accuracy enhancement is not configured.' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const providerResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ image: { content: input.data.imageBase64 }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }] }),
      signal: controller.signal,
    })
    if (!providerResponse.ok) return response.status(502).json({ error: 'CLOUD_OCR_FAILED', message: 'Cloud accuracy enhancement could not read this screenshot.' })

    const providerData = VisionResponseSchema.safeParse(await providerResponse.json())
    const result = providerData.success ? providerData.data.responses[0] : undefined
    const text = result?.fullTextAnnotation?.text?.trim()
    if (!text || result?.error) return response.status(422).json({ error: 'NO_CLOUD_TEXT', message: 'Cloud accuracy enhancement could not find readable text.' })
    return response.status(200).json({ text })
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === 'AbortError'
    return response.status(isTimeout ? 504 : 502).json({ error: isTimeout ? 'CLOUD_OCR_TIMEOUT' : 'CLOUD_OCR_FAILED', message: 'Cloud accuracy enhancement is unavailable. You can continue with local OCR or paste manually.' })
  } finally {
    clearTimeout(timeout)
  }
}
