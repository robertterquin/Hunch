import { Check, ListChecks, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { completedChecklistCount, reportTitle, reusableChecklist, riskLabel } from '../data/supportContent'
import { useGeneralChecklist } from '../hooks/useGeneralChecklist'
import { useAppState } from '../app/stateContext'
import { useMemo, useState } from 'react'

export function ChecklistPage() {
  const { activeReport, savedReports, toggleChecklistItem } = useAppState()
  const { completed, toggle, reset } = useGeneralChecklist()
  const [selectedReportId, setSelectedReportId] = useState('')
  const reports = useMemo(() => {
    const allReports = activeReport ? [activeReport, ...savedReports] : savedReports
    return allReports.filter((report, index) => allReports.findIndex((item) => item.id === report.id) === index)
  }, [activeReport, savedReports])
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports.find((report) => report.id === activeReport?.id) ?? reports[0]
  return <SupportPage eyebrow="Checklist" title="Before you apply" description="Use a reusable checklist, then switch to report-specific actions when a listing needs closer verification." actions={<button className="button button-secondary" type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true" />Reset general checklist</button>}>
    <section className="checklist-depth-grid"><section className="panel checklist-panel"><div className="checklist-progress"><div><p className="eyebrow">Reusable checklist</p><h2>Verify the important details.</h2></div><strong>{completed.length}/{reusableChecklist.length}</strong></div><div className="progress-track"><span style={{ width: `${(completed.length / reusableChecklist.length) * 100}%` }} /></div><ul className="full-checklist">{reusableChecklist.map((item) => <li key={item}><button className={`check-button${completed.includes(item) ? ' is-complete' : ''}`} type="button" onClick={() => toggle(item)} aria-label={`${completed.includes(item) ? 'Mark incomplete' : 'Complete'}: ${item}`}><Check size={14} aria-hidden="true" /></button><span className={completed.includes(item) ? 'is-complete' : ''}>{item}</span></li>)}</ul></section>
    <section className="panel report-checklist-panel"><div className="panel-heading"><div><p className="eyebrow">Report-specific checklist</p><h2>Follow the report's next steps.</h2></div><ListChecks size={20} aria-hidden="true" /></div>{reports.length > 0 ? <><label className="field-label" htmlFor="checklist-report">Choose a report</label><select id="checklist-report" value={selectedReport?.id ?? ''} onChange={(event) => setSelectedReportId(event.target.value)}>{reports.map((report) => <option key={report.id} value={report.id}>{reportTitle(report)} - {riskLabel(report)}</option>)}</select>{selectedReport && <><div className="list-heading"><span className="section-label">Suggested actions</span><span className="count-label">{completedChecklistCount(selectedReport)}/{selectedReport.checklist.length}</span></div><ul className="full-checklist report-specific-checklist">{selectedReport.checklist.map((item) => <li key={item.id}><button className={`check-button${item.completed ? ' is-complete' : ''}`} type="button" onClick={() => toggleChecklistItem(selectedReport.id, item.id)} aria-label={`${item.completed ? 'Mark incomplete' : 'Complete'}: ${item.label}`}><Check size={14} aria-hidden="true" /></button><span className={item.completed ? 'is-complete' : ''}><strong>{item.label}</strong><small>{item.reason}</small></span></li>)}</ul></>}</> : <div className="empty-inline"><ListChecks size={22} aria-hidden="true" /><strong>No report-specific actions yet.</strong><span>Analyze a listing to receive practical next steps tied to its visible signals.</span><Link className="button button-secondary" to="/analyze">Analyze a listing</Link></div>}</section></section>
  </SupportPage>
}
