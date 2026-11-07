import { useState } from 'react'
import { Icon } from '@iconify/react'
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
  return <SupportPage title="Compare" description="A lower score isn’t proof a listing is safe." actions={<Link className="button button-quiet" to="/saved"><Icon icon="ph:arrow-left" width={16} height={16} aria-hidden="true" />Saved</Link>}>
    <section className="panel panel-pad compare-selector"><div className="panel-head"><h2>{selectedIds.length} selected</h2><span className="muted">Choose at least 2</span></div>{savedReports.length > 0 ? <div className="compare-options">{savedReports.map((report) => <label className={`compare-option${selectedIds.includes(report.id) ? ' is-selected' : ''}`} key={report.id}><input type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => toggle(report.id)} /><span><strong>{reportTitle(report)}</strong><small>{sourceLabel(report)}, {riskLabel(report)}, {report.riskScore}/100</small></span></label>)}</div> : <p className="muted-copy">Save at least two reports before comparing.</p>}</section>
    {selectedReports.length >= 2 ? <section className="panel panel-pad comparison-panel"><div className="comparison-grid" style={{ gridTemplateColumns: `minmax(150px, 0.7fr) repeat(${selectedReports.length}, minmax(190px, 1fr))` }}><div className="comparison-labels"><span>Listing</span><span>Source</span><span>Risk estimate</span><span>Warning signs</span><span>Missing information</span><span>Checklist progress</span></div>{selectedReports.map((report) => <div className="comparison-column" key={report.id}><strong>{reportTitle(report)}</strong><span>{report.sourceUrl ? <a className="comparison-source-link" href={report.sourceUrl} target="_blank" rel="noreferrer"><Icon icon="ph:arrow-square-out" width={13} height={13} aria-hidden="true" />{sourceLabel(report)}</a> : sourceLabel(report)}</span><span className={`tag tag-${report.riskLevel}`}>{riskLabel(report)}, {report.riskScore}</span><div className="comparison-signal-list">{report.flags.length > 0 ? report.flags.map((flag) => <span key={flag.id}>{flag.title}</span>) : <span>None</span>}</div><span>{report.missingInformation.length > 0 ? report.missingInformation.join(', ') : 'None listed'}</span><span>{completedChecklistCount(report)}/{report.checklist.length} complete</span></div>)}</div></section> : <section className="panel empty-panel"><h2>Select two saved reports</h2><p>Choose another report above.</p></section>}
  </SupportPage>
}
