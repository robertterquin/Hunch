import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { highlightPost } from '../lib/highlightPost'
import { RULE_CATALOG } from '../data/ruleCatalog'
import { passedCheckLabels } from '../data/supportContent'
import type { AnalysisReport, RiskLevel } from '../types/analysis'

const riskLabels: Record<RiskLevel, string> = { 'low-risk': 'Low risk', caution: 'Caution', 'high-risk': 'High risk' }
const adviceHeadlines: Record<RiskLevel, string> = {
  'high-risk': 'Don’t pay or send documents.',
  caution: 'Check the details before you reply.',
  'low-risk': 'A low score isn’t proof the offer is real.',
}

interface AnalysisReportViewProps {
  report: AnalysisReport
  id?: string
  onToggleChecklist?: (checklistId: string) => void
  onSave?: () => void
  isSaved?: boolean
}

export function AnalysisReportView({ report, id, onToggleChecklist, onSave, isSaved = false }: AnalysisReportViewProps) {
  const sortedFlags = useMemo(() => [...report.flags].sort((left, right) => right.scoreImpact - left.scoreImpact), [report.flags])
  const [openFlagId, setOpenFlagId] = useState<string | null>(sortedFlags[0]?.id ?? null)
  const { segments, numbers } = useMemo(() => highlightPost(report.originalText, report.flags), [report.originalText, report.flags])
  const level = report.riskLevel

  return (
    <section id={id} className={`report report-${level}`} aria-labelledby={`report-${report.id}`}>
      {onSave && <div className="report-toolbar"><button className="button button-primary" type="button" onClick={onSave} disabled={isSaved}>{isSaved ? 'Report saved' : 'Save report'}</button></div>}

      <header className="verdict">
        <div>
          <span className={`tag tag-${level}`}>{report.confidence[0].toUpperCase() + report.confidence.slice(1)} confidence</span>
          <h2 className="verdict-title" id={`report-${report.id}`}>{riskLabels[level]}</h2>
          <p className="verdict-summary">{report.summary}</p>
          {report.sourceUrl && <a className="source-link" href={report.sourceUrl} target="_blank" rel="noreferrer"><Icon icon="ph:arrow-square-out" width={15} height={15} aria-hidden="true" /><span>{report.sourceUrl}</span></a>}
        </div>
        <div className="score">
          <p className="score-number"><strong>{report.riskScore}</strong><span>/ 100</span></p>
          <div className="scale" role="img" aria-label={`Risk estimate ${report.riskScore} out of 100, ${riskLabels[level].toLowerCase()} range`}>
            <span /><span /><span /><i className="scale-pin" style={{ left: `${Math.min(98.5, Math.max(1.5, report.riskScore))}%` }} />
          </div>
          <div className="scale-labels" aria-hidden="true"><span>Low</span><span>Caution</span><span>High</span></div>
        </div>
      </header>

      <p className="advice"><strong>{adviceHeadlines[level]}</strong> <span>{report.studentAdvice}</span></p>

      <div className="report-grid">
        <div className="report-main">
          <section className="sheet post">
            <div className="post-head"><h3>The post</h3></div>
            <p className="post-text">
              {segments.map((segment, index) => segment.flag
                ? <mark key={index} className={`mark-${segment.flag.severity}${segment.flag.id === openFlagId ? ' is-focus' : ''}`}>{segment.text}<sup aria-label={`warning sign ${segment.number}`}>{segment.number}</sup></mark>
                : <span key={index}>{segment.text}</span>)}
            </p>
          </section>

          {report.missingInformation.length > 0 && <section className="panel panel-pad">
            <h3>Missing from the post</h3>
            <ul className="plain-list">{report.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>}

          {report.checklist.length > 0 && <section className="panel panel-pad">
            <h3>Before you apply</h3>
            <ul className="check-list">
              {report.checklist.map((item) => <li key={item.id}>
                <button className={`check${item.completed ? ' is-on' : ''}`} type="button" onClick={() => onToggleChecklist?.(item.id)} aria-pressed={item.completed} aria-label={`${item.completed ? 'Mark incomplete' : 'Mark done'}: ${item.label}`}><Icon icon="ph:check-bold" width={13} height={13} aria-hidden="true" /></button>
                <span className={item.completed ? 'is-done' : ''}>{item.label}</span>
              </li>)}
            </ul>
          </section>}
        </div>

        {sortedFlags.length > 0 ? <section className="panel signs" aria-label="Warning signs">
          <h3 className="signs-head">Warning signs</h3>
          {sortedFlags.map((flag) => {
            const isOpen = flag.id === openFlagId
            return <article className={`sign${isOpen ? ' is-open' : ''}`} key={flag.id}>
              <button className="sign-row" type="button" onClick={() => setOpenFlagId(isOpen ? null : flag.id)} aria-expanded={isOpen}>
                <span className={`num num-${flag.severity}`} aria-label={`${flag.severity === 'high' ? 'High-risk' : 'Caution'} sign ${numbers[flag.id]}`}>{numbers[flag.id]}</span>
                <strong>{flag.title}</strong>
                <span className="pts">+{flag.scoreImpact}</span>
                <Icon icon={isOpen ? 'ph:caret-up' : 'ph:caret-down'} width={16} height={16} aria-hidden="true" />
              </button>
              {isOpen && <div className="sign-body">
                <p>{flag.explanation}</p>
                {!segments.some((segment) => segment.flag?.id === flag.id) && <blockquote>{flag.evidence}</blockquote>}
                <p className="sign-next">{flag.nextAction}</p>
              </div>}
            </article>
          })}
        </section> : <section className="panel signs" aria-label="Checks">
          <div className="signs-head"><h3>Nothing flagged</h3><span>{RULE_CATALOG.length} checks</span></div>
          <ul className="passed-list">{RULE_CATALOG.map((rule) => <li key={rule.id}><Icon icon="ph:check-circle" width={18} height={18} aria-hidden="true" />{passedCheckLabels[rule.category]}</li>)}</ul>
        </section>}
      </div>
    </section>
  )
}
