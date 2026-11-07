import { useEffect, useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnalysisReportView } from '../components/AnalysisReportView'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAppState } from '../app/stateContext'
import { getFixtureById } from '../data/analysisFixtures'
import { analyzePublicLink } from '../services/linkAnalysisService'
import { analyzeListingWithExplanation } from '../services/openaiAnalysisService'
import type { AnalysisReport, SourceType } from '../types/analysis'

const sourceOptions: Array<{ value: SourceType; label: string }> = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'school-group', label: 'School group' },
  { value: 'other', label: 'Other' },
]

type InputMode = 'paste' | 'link'
type AnalysisStage = 'idle' | 'reading-link' | 'scanning' | 'explaining'

const shortSampleListing = 'URGENT: OJT students needed for easy online office work. Earn PHP 25,000/month. Pay a PHP 1,000 training fee today. Send your government ID to our recruiter on WhatsApp. Company details will be shared after payment.'

const analysisStageCopy: Record<Exclude<AnalysisStage, 'idle'>, { label: string; detail: string }> = {
  'reading-link': { label: 'Reading the public listing', detail: 'Preparing the details Hunch can check safely.' },
  scanning: { label: 'Checking the listing', detail: 'Looking for clear warning signs and missing details.' },
  explaining: { label: 'Preparing your guidance', detail: 'Turning the checked details into clear next steps.' },
}

function detectSocialPlatform(url: string): { name: string; sourceType: SourceType } | null {
  try {
    const trimmed = url.trim()
    if (!trimmed) return null
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.toLowerCase()
    if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('fb.watch') || host.includes('fb.me')) {
      return { name: 'Facebook', sourceType: 'facebook' }
    }
    if (host.includes('linkedin.com')) {
      return { name: 'LinkedIn', sourceType: 'linkedin' }
    }
    if (host.includes('instagram.com')) {
      return { name: 'Instagram', sourceType: 'other' }
    }
    if (host.includes('tiktok.com')) {
      return { name: 'TikTok', sourceType: 'other' }
    }
    if (host.includes('twitter.com') || host.includes('x.com')) {
      return { name: 'X / Twitter', sourceType: 'other' }
    }
  } catch {
    return null
  }
  return null
}

export function AnalyzePage() {
  const { activeReport, setActiveReport, saveReport, savedReports, toggleChecklistItem, user } = useAppState()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [inputMode, setInputMode] = useState<InputMode>('paste')
  const [text, setText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [sourceType, setSourceType] = useState<SourceType>('facebook')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle')
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const isAnalyzing = analysisStage !== 'idle'
  const detectedSocial = inputMode === 'link' ? detectSocialPlatform(linkUrl) : null

  const switchToPaste = (targetSource?: SourceType, platformName?: string) => {
    setInputMode('paste')
    if (targetSource) {
      setSourceType(targetSource)
    }
    setError('')
    setNotice(platformName ? `Switched to Paste mode for ${platformName}. Paste your post text below.` : 'Switched to Paste mode.')
    window.requestAnimationFrame(() => {
      document.getElementById('listing')?.focus()
    })
  }

  useEffect(() => {
    const fixtureId = searchParams.get('fixture')
    const fixture = fixtureId ? getFixtureById(fixtureId) : undefined
    if (!fixture) return
    const timer = window.setTimeout(() => {
      setInputMode('paste')
      setText(fixture.text)
      setSourceType(fixture.sourceType)
      setActiveReport(null)
      setNotice(`${fixture.title} is ready for review.`)
    })
    return () => window.clearTimeout(timer)
  }, [searchParams, setActiveReport])

  const showReport = (nextReport: AnalysisReport) => {
    setActiveReport(nextReport)
    setNotice('Your result is ready. Review the signals and next steps before applying.')
    window.requestAnimationFrame(() => {
      document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (inputMode === 'paste' && text.trim().length < 40) {
      setError('Paste at least 40 characters so Hunch has enough detail to analyze.')
      return
    }
    if (inputMode === 'link') {
      if (!linkUrl.trim()) {
        setError('Enter one public HTTP or HTTPS listing link.')
        return
      }
      const social = detectSocialPlatform(linkUrl)
      if (social) {
        setError(`${social.name} posts require a login and cannot be read via link. Switch to "Paste text" to analyze this post.`)
        return
      }
    }

    setActiveReport(null)
    setAnalysisStage(inputMode === 'paste' ? 'scanning' : 'reading-link')
    try {
      if (inputMode === 'paste') {
        await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
        setAnalysisStage('explaining')
      }
      const nextReport = inputMode === 'paste'
        ? await analyzeListingWithExplanation({ text, sourceType })
        : await analyzePublicLink(linkUrl)
      showReport(nextReport)
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'We could not complete this check.')
    } finally {
      setAnalysisStage('idle')
    }
  }

  const loadSample = () => {
    const sample = getFixtureById('suspicious-01')
    if (!sample) return
    setInputMode('paste')
    setText(shortSampleListing)
    setSourceType(sample.sourceType)
    setActiveReport(null)
    setError('')
    setNotice('A short sample listing is ready. Analyze it to see how Hunch explains the signals.')
  }

  const resetInput = () => {
    setText('')
    setLinkUrl('')
    setActiveReport(null)
    setError('')
    setNotice('')
  }

  const clearInput = () => {
    const hasInput = inputMode === 'paste' ? Boolean(text) : Boolean(linkUrl)
    if (hasInput || activeReport) {
      setIsClearDialogOpen(true)
      return
    }
    resetInput()
  }

  const trimmedLength = text.trim().length
  const canAnalyze = (inputMode === 'paste' ? trimmedLength >= 40 : Boolean(linkUrl.trim()) && !detectedSocial) && !isAnalyzing
  const hasInput = inputMode === 'paste' ? Boolean(text) : Boolean(linkUrl)
  const loadingCopy = analysisStage === 'idle' ? null : analysisStageCopy[analysisStage]
  const isCurrentReportSaved = activeReport ? savedReports.some((report) => report.id === activeReport.id) : false
  const handleSave = async () => {
    if (!activeReport) return
    if (!user) {
      navigate('/auth/sign-in')
      return
    }
    const result = await saveReport(activeReport)
    if (result.error) setError(result.error)
    else setNotice('Report saved privately to your account.')
  }

  return (
    <div className="page-stack analyze-page">
      <header className="page-heading">
        <div>
          <h1>Check an OJT post before you apply</h1>
          <p className="page-intro">Paste a listing or recruiter message to see its warning signs.</p>
        </div>
      </header>

      {notice && <div className="notice notice-success" role="status" aria-live="polite"><Icon icon="ph:check-bold" width={16} height={16} aria-hidden="true" />{notice}</div>}

      <form className="sheet analyzer" onSubmit={handleAnalyze} aria-busy={isAnalyzing}>
        <div className="analyzer-top">
          <div className="segmented" role="group" aria-label="Choose listing input method">
            <button aria-pressed={inputMode === 'paste'} type="button" onClick={() => { setInputMode('paste'); setError('') }} disabled={isAnalyzing}>Paste text</button>
            <button aria-pressed={inputMode === 'link'} type="button" onClick={() => { setInputMode('link'); setError('') }} disabled={isAnalyzing}>Public link</button>
          </div>
        </div>

        {inputMode === 'paste' ? <>
          <fieldset className="source-chips" disabled={isAnalyzing}>
            <legend>Seen on</legend>
            {sourceOptions.map((option) => <label className="chip" key={option.value}><input className="sr-only" type="radio" name="source" value={option.value} checked={sourceType === option.value} onChange={() => setSourceType(option.value)} />{option.label}</label>)}
          </fieldset>
          <label className="sr-only" htmlFor="listing">Listing or recruiter message</label>
          <textarea id="listing" className="listing-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste the post here" aria-describedby="listing-help" aria-invalid={Boolean(error && inputMode === 'paste')} disabled={isAnalyzing} />
        </> : <div className="link-body">
          <label className="field-label" htmlFor="public-link">Public listing URL</label>
          <input id="public-link" type="url" value={linkUrl} onChange={(event) => { setLinkUrl(event.target.value); if (error) setError('') }} placeholder="https://example.com/internship" autoComplete="url" inputMode="url" aria-describedby="public-link-help" aria-invalid={Boolean(error && inputMode === 'link')} disabled={isAnalyzing} />
          <p className="field-help" id="public-link-help">Public pages only. Posts behind a login need to be pasted.</p>
          {detectedSocial && (
            <div className="banner" role="status">
              <p><strong>{detectedSocial.name} needs a login.</strong> Copy the post text and paste it instead.</p>
              <button className="button button-secondary" type="button" onClick={() => switchToPaste(detectedSocial.sourceType, detectedSocial.name)}>Switch to Paste text</button>
            </div>
          )}
        </div>}

        {error && (
          <div className="analyzer-error">
            <p className="inline-error" role="alert"><Icon icon="ph:warning-circle" width={16} height={16} aria-hidden="true" />{error}</p>
            {inputMode === 'link' && !detectedSocial && <button className="button button-secondary" type="button" onClick={() => switchToPaste()}>Switch to Paste text</button>}
          </div>
        )}

        {loadingCopy && <div className="progress" role="status" aria-live="polite"><Icon icon="ph:circle-notch" width={16} height={16} className="spin" aria-hidden="true" /><span><strong>{loadingCopy.label}</strong> {loadingCopy.detail}</span></div>}

        <div className="analyzer-foot">
          <span className="muted" id="listing-help">{inputMode === 'paste' ? (text.length > 0 && trimmedLength < 40 ? `${40 - trimmedLength} more characters needed` : text.length > 0 ? `${text.length} characters` : 'At least 40 characters') : ''}</span>
          <div className="analyzer-actions">
            {(hasInput || activeReport) && <button className="button button-quiet" type="button" onClick={clearInput} disabled={isAnalyzing}>Clear</button>}
            {inputMode === 'paste' && <button className="button button-quiet" type="button" onClick={loadSample} disabled={isAnalyzing}>Try a sample</button>}
            <button className="button button-primary button-large" type="submit" disabled={!canAnalyze}>{isAnalyzing && <Icon icon="ph:circle-notch" width={16} height={16} className="spin" aria-hidden="true" />}{isAnalyzing ? 'Checking' : inputMode === 'paste' ? 'Analyze post' : 'Analyze link'}</button>
          </div>
        </div>
      </form>
      <p className="page-note">Nothing is saved unless you save the report.</p>

      {activeReport && <AnalysisReportView id="analysis-result" report={activeReport} onToggleChecklist={(checklistId) => toggleChecklistItem(activeReport.id, checklistId)} onSave={() => void handleSave()} isSaved={isCurrentReportSaved} />}
      <ConfirmDialog open={isClearDialogOpen} title="Clear this listing?" description="This removes the listing and its unsaved result." confirmLabel="Clear" danger onCancel={() => setIsClearDialogOpen(false)} onConfirm={() => { setIsClearDialogOpen(false); resetInput() }} />
    </div>
  )
}
