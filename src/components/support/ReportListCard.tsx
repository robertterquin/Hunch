import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { reportTitle, formatDate, riskLabel, sourceLabel } from '../../data/supportContent'
import type { AnalysisReport } from '../../types/analysis'

interface ReportListCardProps {
  report: AnalysisReport
  selected: boolean
  onSelect: () => void
}

export function ReportListCard({ report, selected, onSelect }: ReportListCardProps) {
  return <article className={`saved-report-card${selected ? ' is-selected' : ''}`}>
    <button className={`select-report${selected ? ' is-selected' : ''}`} type="button" onClick={onSelect} aria-label={`${selected ? 'Deselect' : 'Select'} ${reportTitle(report)} for comparison`}><Check size={15} aria-hidden="true" /></button>
    <Link to={`/saved/${report.id}`} className="saved-report-main"><div className="saved-report-heading"><strong>{reportTitle(report)}</strong><span className={`risk-pill risk-pill-${report.riskLevel}`}>{riskLabel(report)}</span></div><p>{report.summary}</p><div className="saved-report-meta"><span>{sourceLabel(report)}</span><span>{report.riskScore}/100</span><span>{report.flags.length} signals</span><span>{formatDate(report.createdAt)}</span></div></Link>
    <Link className="text-link" to={`/saved/${report.id}`} aria-label={`Open ${reportTitle(report)}`}><ArrowRight size={17} aria-hidden="true" /></Link>
  </article>
}
