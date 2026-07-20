import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Check, CircleAlert, FileText, Link as LinkIcon, LoaderCircle, RotateCcw, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnalysisReportView } from '../components/AnalysisReportView'
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
    setNotice(nextReport.explanationSource === 'openai'
      ? 'Your report is ready with an evidence-bound explanation. Review the evidence before deciding what to do next.'
      : `${nextReport.explanationNote ?? 'AI explanation is unavailable right now.'} Review the evidence before deciding what to do next.`)
  }

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (inputMode === 'paste' && text.trim().length < 40) {
      setError('Paste at least 40 characters so Hunch has enough detail to analyze.')
      return
    }
    if (inputMode === 'link' && !linkUrl.trim()) {
      setError('Enter one public HTTP or HTTPS listing link.')
      return
    }

    setIsAnalyzing(true)
    try {
      const nextReport = inputMode === 'paste'
        ? await analyzeListingWithExplanation({ text, sourceType })
        : await analyzePublicLink(linkUrl)
      showReport(nextReport)
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'We could not complete this check.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadSample = () => {
    const sample = getFixtureById('suspicious-01')
    if (!sample) return
    setInputMode('paste')
    setText(sample.text)
    setSourceType(sample.sourceType)
    setActiveReport(null)
    setError('')
    setNotice(`${sample.title} is ready for review.`)
  }

  const clearInput = () => {
    const hasInput = inputMode === 'paste' ? Boolean(text) : Boolean(linkUrl)
    if ((hasInput || activeReport) && !window.confirm('Clear this listing and its current result?')) return
    setText('')
    setLinkUrl('')
    setActiveReport(null)
    setError('')
    setNotice('')
  }

  const characterCount = text.length
  const canAnalyze = (inputMode === 'paste' ? text.trim().length >= 40 : Boolean(linkUrl.trim())) && !isAnalyzing
  const isCurrentReportSaved = activeReport ? savedReports.some((report) => report.id === activeReport.id) : false
  const handleSave = async () => {
    if (!activeReport) return
    if (!user) {
      navigate('/auth/sign-in')
      return
    }
    const result = await saveReport(activeReport)
    if (result.error) setError(result.error)
    else setNotice('Report saved privately to your Supabase account.')
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Analyze</p>
          <h1>Let’s check this opportunity.</h1>
          <p className="page-intro">Bring an OJT or internship post, and Hunch will help you spot signals, ask better questions, and choose your next step.</p>
        </div>
        <div className="status-note" role="status" aria-live="polite"><span className="status-dot" aria-hidden="true" /><span>{isAnalyzing ? 'Checking your listing' : 'Anonymous analysis is available'}</span></div>
      </section>

      {notice && <div className="notice notice-success" role="status" aria-live="polite"><Check size={16} aria-hidden="true" />{notice}</div>}

      <section className="analyzer-layout">
        <form className="panel analyzer-panel" onSubmit={handleAnalyze} aria-busy={isAnalyzing}>
          <div className="panel-heading">
            <div><p className="eyebrow">Step 1 of 2</p><h2>{inputMode === 'paste' ? 'Paste the listing' : 'Analyze a public link'}</h2></div>
            <span className="panel-kicker">{inputMode === 'paste' ? 'Text check' : 'Public page'}</span>
          </div>

          <div className="input-mode-toggle" role="group" aria-label="Choose listing input method">
            <button className={inputMode === 'paste' ? 'is-active' : ''} type="button" onClick={() => { setInputMode('paste'); setError('') }}>Paste text</button>
            <button className={inputMode === 'link' ? 'is-active' : ''} type="button" onClick={() => { setInputMode('link'); setError('') }}><LinkIcon size={15} aria-hidden="true" />Public link</button>
          </div>

          {inputMode === 'paste' ? <>
            <label className="field-label" htmlFor="source">Where did you find it?</label>
            <select id="source" value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceType)}>
              {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label className="field-label" htmlFor="listing">Listing or recruiter message</label>
            <textarea id="listing" value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste the listing, recruiter message, or forwarded post here." aria-describedby="listing-help listing-count" aria-invalid={Boolean(error && inputMode === 'paste')} />
            <div className="field-meta"><span id="listing-help">Use at least 40 characters for a meaningful check.</span><span id="listing-count">{characterCount} characters</span></div>
            {text.length > 0 && text.trim().length < 40 && <p className="field-warning"><CircleAlert size={15} aria-hidden="true" />Paste {40 - text.trim().length} more characters to continue.</p>}
          </> : <>
            <label className="field-label" htmlFor="public-link">Public listing URL</label>
            <input id="public-link" type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com/internship" autoComplete="url" inputMode="url" aria-describedby="public-link-help" aria-invalid={Boolean(error && inputMode === 'link')} />
            <p className="field-help" id="public-link-help">Hunch can read public HTML pages only. Login-protected, private, JavaScript-only, blocked, or non-HTML pages need to be pasted manually.</p>
          </>}

          {error && <p className="inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}

          <div className="button-row">
            <button className="button button-secondary" type="button" onClick={clearInput} disabled={!(inputMode === 'paste' ? text : linkUrl) && !activeReport}><RotateCcw size={16} aria-hidden="true" />Clear</button>
            {inputMode === 'paste' && <button className="button button-secondary" type="button" onClick={loadSample}><FileText size={16} aria-hidden="true" />Try a sample</button>}
            <button className="button button-primary" type="submit" disabled={!canAnalyze}>{isAnalyzing ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}{isAnalyzing ? 'Checking' : inputMode === 'paste' ? 'Analyze post' : 'Analyze link'}</button>
          </div>
          <p className="trust-note">Hunch provides an estimate based on visible signals. It does not prove whether a listing is legitimate.</p>
        </form>

        <aside className="panel checks-panel" aria-label="What Hunch checks">
          <div className="signal-motif" aria-hidden="true"><Sparkles size={16} /><span /><span /><span /></div>
          <p className="eyebrow">Step 2 of 2</p>
          <h2>Understand the signal, then choose your next step.</h2>
          <ul className="signal-list">{['Payment requests', 'Recruiter email details', 'Company and role clarity', 'Urgency and chat-only hiring', 'Early sensitive-data requests'].map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul>
          <div className="preview-note"><span className="preview-score">--</span><span><strong>Your result will appear here.</strong><br />Hunch keeps the score next to its evidence and checklist.</span></div>
        </aside>
      </section>

      {activeReport && <AnalysisReportView report={activeReport} onToggleChecklist={(checklistId) => toggleChecklistItem(activeReport.id, checklistId)} onSave={() => void handleSave()} isSaved={isCurrentReportSaved} />}
    </div>
  )
}
