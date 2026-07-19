import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, CircleAlert, LockKeyhole } from 'lucide-react'
import type { AnalysisReport } from '../types/analysis'

const riskLabels = {
  'low-risk': 'Low risk',
  caution: 'Caution',
  'high-risk': 'High risk',
} as const

interface AnalysisReportViewProps {
  report: AnalysisReport
  onToggleChecklist?: (checklistId: string) => void
  onSave?: () => void
  isSaved?: boolean
  compact?: boolean
}

export function AnalysisReportView({ report, onToggleChecklist, onSave, isSaved = false, compact = false }: AnalysisReportViewProps) {
  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(null)
  const completedCount = report.checklist.filter((item) => item.completed).length

  return (
    <section className={`panel report-panel risk-${report.riskLevel}${compact ? ' report-compact' : ''}`} aria-labelledby={`report-${report.id}`}>
      <div className="report-header">
        <div>
          <p className="eyebrow">Result</p>
          <div className="result-title-row">
            <h2 id={`report-${report.id}`}>{riskLabels[report.riskLevel]}</h2>
            <span className={`risk-pill risk-pill-${report.riskLevel}`}>{report.confidence} confidence</span>
          </div>
          <p className="report-summary">{report.summary}</p>
        </div>
        <div className="score-block">
          <strong>{report.riskScore}</strong>
          <span>/ 100</span>
          <small>risk estimate</small>
        </div>
      </div>

      <div className="report-grid">
        <div>
          <div className="section-heading-row">
            <p className="section-label">Visible signals</p>
            <span className="count-label">{report.flags.length} found</span>
          </div>
          {report.flags.length > 0 ? (
            <div className="flag-list">
              {report.flags.map((flag) => {
                const isExpanded = expandedFlagId === flag.id
                return (
                  <article className={`flag-card${isExpanded ? ' is-expanded' : ''}`} key={flag.id}>
                    <button className="flag-toggle" type="button" onClick={() => setExpandedFlagId(isExpanded ? null : flag.id)} aria-expanded={isExpanded}>
                      <span className="flag-marker" aria-hidden="true"><CircleAlert size={14} /></span>
                      <span className="flag-title"><strong>{flag.title}</strong><small>{flag.scoreImpact} points</small></span>
                      {isExpanded ? <ChevronUp size={17} aria-hidden="true" /> : <ChevronDown size={17} aria-hidden="true" />}
                    </button>
                    {isExpanded && <div className="flag-detail"><p>{flag.explanation}</p><blockquote>{flag.evidence}</blockquote><p className="next-action"><strong>Next step:</strong> {flag.nextAction}</p></div>}
                  </article>
                )
              })}
            </div>
          ) : <p className="muted-copy">No major warning categories were matched in this mock result.</p>}
        </div>

        <div className="report-side-column">
          <div>
            <div className="section-heading-row"><p className="section-label">Score breakdown</p><span className="count-label">capped at 100</span></div>
            <div className="breakdown-list">{report.scoreBreakdown.map((item) => <div className="breakdown-row" key={item.ruleId}><span>{item.label}</span><strong>+{item.scoreImpact}</strong></div>)}</div>
          </div>
          <div>
            <p className="section-label">What is still unclear</p>
            {report.missingInformation.length > 0 ? <ul className="missing-list">{report.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="muted-copy">The post includes the main details Hunch can check.</p>}
          </div>
          <div>
            <div className="section-heading-row"><p className="section-label">Before applying</p><span className="count-label">{completedCount}/{report.checklist.length}</span></div>
            <ul className="checklist-list report-checklist">
              {report.checklist.map((item) => <li key={item.id}><button className={`check-button${item.completed ? ' is-complete' : ''}`} type="button" onClick={() => onToggleChecklist?.(item.id)} aria-label={`${item.completed ? 'Mark incomplete' : 'Complete'}: ${item.label}`}><Check size={14} aria-hidden="true" /></button><span className={item.completed ? 'is-complete' : ''}>{item.label}</span></li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="report-footer"><span className="safety-note"><LockKeyhole size={14} aria-hidden="true" /> A lower score is not a guarantee of safety.</span>{onSave && <button className="button button-primary button-compact" type="button" onClick={onSave} disabled={isSaved}>{isSaved ? 'Report saved' : 'Save report'}</button>}</div>
    </section>
  )
}
