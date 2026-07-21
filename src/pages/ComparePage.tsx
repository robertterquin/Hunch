import { useState } from 'react'
import { CircleAlert, ExternalLink, ArrowLeft } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { completedChecklistCount, reportTitle, riskLabel, sourceLabel } from '../data/supportContent'
import { useAppState } from '../app/stateContext'

export function ComparePage() {
  const { savedReports } = useAppState()
  const [searchParams] = useSearchParams()
  const requestedKey = searchParams.get('ids') ?? ''
  const requestedIds = requestedKey.split(',').filter(Boolean)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => requestedIds.length >= 2 ? requestedIds : savedReports.slice(0, 2).map((report) => report.id))
  const selectedReports = savedReports.filter((report) => selectedIds.includes(report.id))
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <SupportPage eyebrow="Saved > Compare" title="Compare saved listings" description="Compare visible evidence and missing details without treating a lower score as a guarantee." actions={<Link className="button button-secondary" to="/saved"><ArrowLeft size={16} aria-hidden="true" />Back to Saved</Link>}>
    <section className="panel compare-selector"><div className="panel-heading"><div><p className="eyebrow">Choose reports</p><h2>{selectedIds.length} selected</h2></div><span className="panel-kicker">At least 2 required</span></div>{savedReports.length > 0 ? <div className="compare-options">{savedReports.map((report) => <label className={`compare-option${selectedIds.includes(report.id) ? ' is-selected' : ''}`} key={report.id}><input type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => toggle(report.id)} /><span><strong>{reportTitle(report)}</strong><small>{sourceLabel(report)} - {riskLabel(report)} - {report.riskScore}/100</small></span></label>)}</div> : <p className="muted-copy">Save at least two reports before comparing.</p>}</section>
    {selectedReports.length >= 2 ? <section className="panel comparison-panel"><div className="comparison-note"><CircleAlert size={17} aria-hidden="true" /><span>Comparison highlights visible evidence only. A lower score is not proof that a listing is safe.</span></div><div className="comparison-grid" style={{ gridTemplateColumns: `minmax(150px, 0.7fr) repeat(${selectedReports.length}, minmax(190px, 1fr))` }}><div className="comparison-labels"><span>Listing</span><span>Source</span><span>Risk estimate</span><span>Visible signals</span><span>Missing information</span><span>Checklist progress</span></div>{selectedReports.map((report) => <div className="comparison-column" key={report.id}><strong>{reportTitle(report)}</strong><span>{report.sourceUrl ? <a className="comparison-source-link" href={report.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} aria-hidden="true" />{sourceLabel(report)}</a> : sourceLabel(report)}</span><span className={`risk-pill risk-pill-${report.riskLevel}`}>{riskLabel(report)} - {report.riskScore}/100</span><div className="comparison-signal-list">{report.flags.length > 0 ? report.flags.map((flag) => <span key={flag.id}>{flag.title}</span>) : <span>No matched warning category</span>}</div><span>{report.missingInformation.length > 0 ? report.missingInformation.join(', ') : 'No major missing detail listed'}</span><span>{completedChecklistCount(report)}/{report.checklist.length} complete</span></div>)}</div></section> : <section className="panel empty-panel"><CircleAlert size={28} aria-hidden="true" /><h2>Select two saved reports.</h2><p>Choose another report above to build the comparison.</p></section>}
  </SupportPage>
}
