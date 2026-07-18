import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, CircleAlert, LoaderCircle, RotateCcw, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFixtureById } from '../data/analysisFixtures'
import { analyzeListing } from '../services/mockAnalysisService'
import type { AnalysisReport, SourceType } from '../types/analysis'

const sourceOptions: Array<{ value: SourceType; label: string }> = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'school-group', label: 'School group' },
  { value: 'other', label: 'Other' },
]

const riskLabels = {
  'low-risk': 'Low risk',
  caution: 'Caution',
  'high-risk': 'High risk',
} as const

export function AnalyzePage() {
  const [text, setText] = useState('')
  const [sourceType, setSourceType] = useState<SourceType>('facebook')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [error, setError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsAnalyzing(true)
    try {
      const nextReport = await analyzeListing({ text, sourceType })
      setReport(nextReport)
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'We could not complete this check.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadSample = () => {
    const sample = getFixtureById('suspicious-01')
    if (!sample) return
    setText(sample.text)
    setSourceType(sample.sourceType)
    setReport(null)
    setError('')
  }

  const clearInput = () => {
    setText('')
    setReport(null)
    setError('')
  }

  const canAnalyze = text.trim().length >= 40 && !isAnalyzing

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Analyze</p>
          <h1>Check a listing before you apply.</h1>
          <p className="page-intro">Paste an OJT or internship post to find visible risk signals and practical next steps.</p>
        </div>
        <div className="status-note">
          <span className="status-dot" aria-hidden="true" />
          <span>Anonymous analysis is available</span>
        </div>
      </section>

      <section className="foundation-grid">
        <form className="panel analyzer-panel" onSubmit={handleAnalyze}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Paste an OJT or internship post</h2>
            </div>
            <span className="panel-kicker">Phase 6 mock service</span>
          </div>

          <label className="field-label" htmlFor="source">Where did you find it?</label>
          <select id="source" value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceType)}>
            {sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>

          <label className="field-label" htmlFor="listing">Paste the listing or recruiter message</label>
          <textarea
            id="listing"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the listing, recruiter message, or forwarded post here."
            aria-describedby="listing-help listing-count"
          />
          <div className="field-meta">
            <span id="listing-help">Use at least 40 characters for a meaningful check.</span>
            <span id="listing-count">{text.length} characters</span>
          </div>

          {error && <p className="inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}

          <div className="button-row">
            <button className="button button-secondary" type="button" onClick={clearInput} disabled={!text && !report}>
              <RotateCcw size={16} aria-hidden="true" />
              Clear
            </button>
            <button className="button button-secondary" type="button" onClick={loadSample}>
              Try a sample
            </button>
            <Link className="button button-secondary" to="/analyze/review">
              <Upload size={16} aria-hidden="true" />
              Screenshot review
            </Link>
            <button className="button button-primary" type="submit" disabled={!canAnalyze}>
              {isAnalyzing ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
              {isAnalyzing ? 'Analyzing' : 'Analyze post'}
            </button>
          </div>

          <p className="trust-note">Hunch provides an estimate based on visible signals. It does not prove whether a listing is legitimate.</p>
        </form>

        <aside className="panel checks-panel" aria-label="What Hunch checks">
          <p className="eyebrow">What Hunch checks</p>
          <h2>Understand the signal, then choose your next step.</h2>
          <ul className="signal-list">
            {['Payment requests', 'Recruiter email details', 'Company and role clarity', 'Urgency and chat-only hiring', 'Early sensitive-data requests'].map((item) => (
              <li key={item}><Check size={16} aria-hidden="true" />{item}</li>
            ))}
          </ul>
          <div className="preview-note">
            <span className="preview-score">--</span>
            <span><strong>Your result appears here.</strong><br />The score stays next to its evidence and checklist.</span>
          </div>
        </aside>
      </section>

      {report && <ReportPreview report={report} />}
    </div>
  )
}

function ReportPreview({ report }: { report: AnalysisReport }) {
  return (
    <section className={`panel report-panel risk-${report.riskLevel}`} aria-labelledby="report-heading">
      <div className="report-header">
        <div>
          <p className="eyebrow">Result</p>
          <h2 id="report-heading">{riskLabels[report.riskLevel]}</h2>
          <p className="report-summary">{report.summary}</p>
        </div>
        <div className="score-block">
          <strong>{report.riskScore}</strong>
          <span>/ 100</span>
          <small>{report.confidence} confidence</small>
        </div>
      </div>
      <div className="report-grid">
        <div>
          <p className="section-label">Visible signals</p>
          {report.flags.length > 0 ? (
            <ul className="flag-list">
              {report.flags.slice(0, 3).map((flag) => (
                <li key={flag.id}>
                  <span className="flag-marker" aria-hidden="true">!</span>
                  <div><strong>{flag.title}</strong><span>{flag.evidence}</span></div>
                </li>
              ))}
            </ul>
          ) : <p className="muted-copy">No major warning categories were matched in this mock result.</p>}
        </div>
        <div>
          <p className="section-label">Next steps</p>
          <p className="uncertainty-copy">{report.uncertainty}</p>
          <ul className="checklist-list">
            {report.checklist.slice(0, 3).map((item) => <li key={item.id}><span className="checkbox" aria-hidden="true" />{item.label}</li>)}
          </ul>
        </div>
      </div>
      <div className="report-footer">
        <span>Fixture: {report.fixtureId}</span>
        <Link className="text-link" to="/saved">Continue to Saved <ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
    </section>
  )
}
