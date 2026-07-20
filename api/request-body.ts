import type { VercelRequest } from '@vercel/node'

export const MAX_ANALYZE_BODY_BYTES = 256_000
export const MAX_LINK_BODY_BYTES = 16_384

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function isRequestBodyTooLarge(request: VercelRequest, maxBytes: number) {
  const contentLength = Number(headerValue(request.headers?.['content-length']))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) return true

  if (typeof request.body === 'string') return Buffer.byteLength(request.body, 'utf8') > maxBytes
  if (request.body === undefined || request.body === null) return false

  try {
    return Buffer.byteLength(JSON.stringify(request.body), 'utf8') > maxBytes
  } catch {
    return true
  }
}
