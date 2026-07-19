export const MAX_SCREENSHOT_SIZE_BYTES = 10 * 1024 * 1024
export const ACCEPTED_SCREENSHOT_TYPES = ['image/jpeg', 'image/png'] as const

export type OcrConfidence = 'high' | 'medium' | 'low'
export type OcrReviewStatus = 'idle' | 'processing' | 'review' | 'empty' | 'error'

export interface ScreenshotOcrResult {
  text: string
  confidence: number
}

export function validateScreenshotFile(file: Pick<File, 'name' | 'size' | 'type'>) {
  if (!ACCEPTED_SCREENSHOT_TYPES.includes(file.type as (typeof ACCEPTED_SCREENSHOT_TYPES)[number])) {
    return 'Choose a PNG or JPG screenshot.'
  }
  if (file.size > MAX_SCREENSHOT_SIZE_BYTES) return 'Choose a screenshot smaller than 10 MB.'
  return null
}

export function getOcrConfidence(confidence: number): OcrConfidence {
  if (confidence >= 85) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}

export function getOcrConfidenceMessage(confidence: number) {
  const level = getOcrConfidence(confidence)
  if (level === 'high') return 'Most text was read clearly. Check names, links, and numbers before continuing.'
  if (level === 'medium') return 'Some words may be missing or inaccurate. Review the text before continuing.'
  return 'The screenshot was difficult to read. Edit the text and confirm you reviewed it before continuing.'
}

export function requiresOcrReviewConfirmation(status: OcrReviewStatus, confidence: number | null) {
  return status === 'empty' || status === 'error' || (confidence !== null && getOcrConfidence(confidence) === 'low')
}

export function canUseReviewedOcrText({ fileSelected, status, text, confidence, reviewConfirmed }: { fileSelected: boolean; status: OcrReviewStatus; text: string; confidence: number | null; reviewConfirmed: boolean }) {
  if (!fileSelected || status === 'processing' || text.trim().length < 40) return false
  return !requiresOcrReviewConfirmation(status, confidence) || reviewConfirmed
}

export async function getScreenshotDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('The image could not be opened.'))
    }
    image.src = objectUrl
  })
}

export function getImageQualityWarning({ width, height }: { width: number; height: number }) {
  return width < 320 || height < 200
    ? 'This screenshot is small and may be hard to read. Check the extracted text carefully.'
    : null
}

export async function extractScreenshotText(file: File, onProgress?: (progress: number, status: string) => void): Promise<ScreenshotOcrResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    logger: (message) => onProgress?.(Math.round((message.progress ?? 0) * 100), message.status),
  })

  try {
    const result = await worker.recognize(file)
    return {
      text: result.data.text.split('\0').join('').trim(),
      confidence: result.data.confidence,
    }
  } finally {
    await worker.terminate()
  }
}
