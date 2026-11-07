import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { reportTitle, formatDate, riskLabel, sourceLabel } from '../../data/supportContent'
import type { AnalysisReport } from '../../types/analysis'

interface ReportListCardProps {
  report: AnalysisReport
  selected: boolean
  onSelect: () => void
}

export function ReportListCard({ report, selected, onSelect }: ReportListCardProps) {
  return <li className={`saved-row${selected ? ' is-selected' : ''}`}>
    <button className={`check${selected ? ' is-on' : ''}`} type="button" onClick={onSelect} aria-pressed={selected} aria-label={`${selected ? 'Deselect' : 'Select'} ${reportTitle(report)} for comparison`}><Icon icon="ph:check-bold" width={13} height={13} aria-hidden="true" /></button>
    <Link to={`/saved/${report.id}`} className="saved-row-main"><strong>{reportTitle(report)}</strong><span>{sourceLabel(report)}</span></Link>
    <span className={`tag tag-${report.riskLevel}`}>{riskLabel(report)}</span>
    <span className="saved-score">{report.riskScore}</span>
    <span className="saved-date">{formatDate(report.createdAt)}</span>
    <Icon className="saved-chevron" icon="ph:caret-right" width={16} height={16} aria-hidden="true" />
  </li>
}
