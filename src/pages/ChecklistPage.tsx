import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { reportTitle, reusableChecklist } from '../data/supportContent'
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
  const doneCount = reusableChecklist.filter((item) => completed.includes(item.label)).length

  return <SupportPage title="Checklist" actions={<button className="button button-quiet" type="button" onClick={reset}>Reset</button>}>
    <section className="checklist-grid">
      <section className="panel panel-pad">
        <div className="panel-head"><h2>Every OJT post</h2><span className="muted">{doneCount} of {reusableChecklist.length}</span></div>
        <div className="segments" aria-hidden="true">{reusableChecklist.map((item) => <span key={item.label} className={completed.includes(item.label) ? 'is-on' : ''} />)}</div>
        <ul className="check-list">{reusableChecklist.map((item) => {
          const isDone = completed.includes(item.label)
          return <li key={item.label}>
            <button className={`check${isDone ? ' is-on' : ''}`} type="button" onClick={() => toggle(item.label)} aria-pressed={isDone} aria-label={`${isDone ? 'Mark incomplete' : 'Mark done'}: ${item.label}`}><Icon icon="ph:check-bold" width={13} height={13} aria-hidden="true" /></button>
            <span><span className={isDone ? 'is-done' : ''}>{item.label}</span><small>{item.reason}</small></span>
          </li>
        })}</ul>
      </section>

      <section className="panel panel-pad">
        <h2>From a report</h2>
        {reports.length > 0 ? <>
          <label className="sr-only" htmlFor="checklist-report">Choose a report</label>
          <select id="checklist-report" className="report-picker" value={selectedReport?.id ?? ''} onChange={(event) => setSelectedReportId(event.target.value)}>{reports.map((report) => <option key={report.id} value={report.id}>{reportTitle(report)}</option>)}</select>
          {selectedReport && <ul className="check-list">{selectedReport.checklist.map((item) => <li key={item.id}>
            <button className={`check${item.completed ? ' is-on' : ''}`} type="button" onClick={() => toggleChecklistItem(selectedReport.id, item.id)} aria-pressed={item.completed} aria-label={`${item.completed ? 'Mark incomplete' : 'Mark done'}: ${item.label}`}><Icon icon="ph:check-bold" width={13} height={13} aria-hidden="true" /></button>
            <span className={item.completed ? 'is-done' : ''}>{item.label}</span>
          </li>)}</ul>}
        </> : <div className="empty-inline"><p>Analyze a post to get steps for it.</p><Link className="button button-secondary" to="/analyze">Analyze a post</Link></div>}
      </section>
    </section>
  </SupportPage>
}
