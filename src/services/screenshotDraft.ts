let selectedScreenshot: File | null = null

// Keep a selected image only in memory while the student moves to OCR review.
export function getScreenshotDraft() {
  return selectedScreenshot
}

export function setScreenshotDraft(file: File) {
  selectedScreenshot = file
}

export function clearScreenshotDraft() {
  selectedScreenshot = null
}
