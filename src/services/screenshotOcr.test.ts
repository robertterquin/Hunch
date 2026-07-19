import { describe, expect, it } from 'vitest'
import { canUseReviewedOcrText, getImageQualityWarning, getOcrConfidence, validateScreenshotFile } from './screenshotOcr'

describe('screenshot input safeguards', () => {
  it('accepts only PNG and JPG screenshots smaller than 10 MB', () => {
    expect(validateScreenshotFile({ name: 'listing.png', type: 'image/png', size: 1024 })).toBeNull()
    expect(validateScreenshotFile({ name: 'listing.webp', type: 'image/webp', size: 1024 })).toBe('Choose a PNG or JPG screenshot.')
    expect(validateScreenshotFile({ name: 'listing.jpg', type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 })).toBe('Choose a screenshot smaller than 10 MB.')
  })

  it('classifies OCR confidence and warns about low-resolution screenshots', () => {
    expect(getOcrConfidence(90)).toBe('high')
    expect(getOcrConfidence(60)).toBe('medium')
    expect(getOcrConfidence(59)).toBe('low')
    expect(getImageQualityWarning({ width: 300, height: 400 })).toContain('small')
    expect(getImageQualityWarning({ width: 1080, height: 1920 })).toBeNull()
  })

  it('does not release low-confidence, failed, or short OCR text until it is reviewed', () => {
    expect(canUseReviewedOcrText({ fileSelected: true, status: 'processing', text: 'A listing with enough text for a meaningful check.', confidence: null, reviewConfirmed: true })).toBe(false)
    expect(canUseReviewedOcrText({ fileSelected: true, status: 'review', text: 'A listing with enough text for a meaningful check.', confidence: 40, reviewConfirmed: false })).toBe(false)
    expect(canUseReviewedOcrText({ fileSelected: true, status: 'error', text: 'A listing with enough text for a meaningful check.', confidence: null, reviewConfirmed: false })).toBe(false)
    expect(canUseReviewedOcrText({ fileSelected: true, status: 'review', text: 'A listing with enough text for a meaningful check.', confidence: 90, reviewConfirmed: false })).toBe(true)
  })
})
