export const MAX_SCREENSHOT_SIZE_BYTES = 10 * 1024 * 1024
export const ACCEPTED_SCREENSHOT_TYPES = ['image/jpeg', 'image/png'] as const

export type OcrConfidence = 'high' | 'medium' | 'low'
export type OcrReviewStatus = 'idle' | 'processing' | 'review' | 'empty' | 'error'

export interface ScreenshotOcrResult {
  text: string
  confidence: number
  uncertainLines: Array<{ text: string; confidence: number }>
}

export interface ScreenshotCrop {
  x: number
  y: number
  width: number
  height: number
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

async function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('The image could not be opened.'))
    }
    image.src = objectUrl
  })
}

async function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be prepared.')), 'image/jpeg', quality)
  })
}

export async function prepareScreenshotForOcr(file: File, crop?: ScreenshotCrop) {
  const image = await loadImage(file)
  const cropX = crop ? Math.round(image.naturalWidth * crop.x) : 0
  const cropY = crop ? Math.round(image.naturalHeight * crop.y) : 0
  const cropWidth = crop ? Math.round(image.naturalWidth * crop.width) : image.naturalWidth
  const cropHeight = crop ? Math.round(image.naturalHeight * crop.height) : image.naturalHeight
  const scale = Math.min(2, 2200 / Math.max(cropWidth, cropHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(cropWidth * scale))
  canvas.height = Math.max(1, Math.round(cropHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('The image could not be prepared.')
  context.filter = 'grayscale(1) contrast(1.35)'
  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)
  const blob = await canvasToJpeg(canvas, 0.9)
  return new File([blob], 'hunch-ocr.jpg', { type: 'image/jpeg' })
}

export async function prepareCloudOcrImage(file: File, crop?: ScreenshotCrop) {
  const image = await loadImage(file)
  const cropX = crop ? Math.round(image.naturalWidth * crop.x) : 0
  const cropY = crop ? Math.round(image.naturalHeight * crop.y) : 0
  const cropWidth = crop ? Math.round(image.naturalWidth * crop.width) : image.naturalWidth
  const cropHeight = crop ? Math.round(image.naturalHeight * crop.height) : image.naturalHeight
  const scale = Math.min(1, 1600 / Math.max(cropWidth, cropHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(cropWidth * scale))
  canvas.height = Math.max(1, Math.round(cropHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('The image could not be prepared.')
  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)
  const blob = await canvasToJpeg(canvas, 0.82)
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result.split(',')[1] ?? '') : reject(new Error('The image could not be prepared.'))
    reader.onerror = () => reject(new Error('The image could not be prepared.'))
    reader.readAsDataURL(blob)
  })
  if (!base64 || base64.length > 3_800_000) throw new Error('Crop the screenshot more tightly before using cloud accuracy enhancement.')
  return base64
}

export async function extractScreenshotText(file: File, onProgress?: (progress: number, status: string) => void): Promise<ScreenshotOcrResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    logger: (message) => onProgress?.(Math.round((message.progress ?? 0) * 100), message.status),
  })

  try {
    const result = await worker.recognize(file)
    const uncertainLines = (result.data.blocks ?? []).flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines))
      .filter((line) => line.text.trim() && line.confidence < 70)
      .map((line) => ({ text: line.text.trim(), confidence: Math.round(line.confidence) }))
      .slice(0, 6)
    return {
      text: result.data.text.split('\0').join('').trim(),
      confidence: result.data.confidence,
      uncertainLines,
    }
  } finally {
    await worker.terminate()
  }
}
