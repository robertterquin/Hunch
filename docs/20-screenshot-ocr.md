# Phase 11: Screenshot OCR

Hunch extracts visible text from PNG and JPG screenshots in the browser with Tesseract.js. The image is held only in memory while the student reviews it; it is not uploaded to OpenAI, Supabase, local storage, or a saved report.

## Student Flow

1. Select a PNG or JPG screenshot up to 10 MB from Analyze.
2. Hunch shows a local preview and reads the image.
3. The student reviews and can edit all extracted text.
4. Hunch returns only reviewed text to Analyze with `sourceType: 'screenshot'`.

OCR output cannot be used while extraction is running, with fewer than 40 characters, or after a low-confidence, empty, or failed extraction until the student confirms the reviewed text. A failed extraction always offers manual paste recovery.

Students can drag across the preview to crop out icons and decorative borders. Hunch then preprocesses the selected region with grayscale, contrast, scaling, and JPEG normalization before local OCR. Low-confidence lines are listed separately so the student knows what to check.

## Quality and Privacy

- Confidence: high at 85% or above, medium from 60% to 84%, and low below 60%.
- Hunch warns when an image is smaller than 320 by 200 pixels.
- The initial OCR model is English. It can read common Filipino listings written with Latin characters, but extraction quality must be reviewed, especially for mixed-language text, cropped screenshots, small text, or dense chat screenshots.
- Tesseract downloads its worker and language resources when OCR is first used. If that cannot complete, Hunch keeps the student on the review screen and provides retry and manual-paste options.
- When local OCR is low-confidence, empty, or failed, the student can explicitly choose **Improve accuracy**. This sends a resized, cropped copy once to Google Cloud Vision through `api/ocr.ts`; it is not stored by Hunch. The returned text still requires student confirmation.
- Screenshot storage remains out of scope. Only the report text is saved after the student explicitly saves a completed report.

## Optional Cloud Fallback

Set `GOOGLE_CLOUD_VISION_API_KEY` only in `.env.local` and Vercel environment variables. Restrict the key to the Cloud Vision API and never expose it through a `VITE_` variable, Supabase, browser code, or source control. Without this key, the Improve accuracy control reports that cloud enhancement is unavailable while local OCR and manual paste continue to work.

## Testing

Run `npm run test` for file validation, confidence, low-resolution, and review-gate coverage. Manually verify a clear screenshot, a low-resolution/cropped screenshot, a text-heavy chat screenshot, and a mixed-language listing before release.
