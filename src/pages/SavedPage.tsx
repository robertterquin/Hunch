import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { ReportListCard } from '../components/support/ReportListCard'
import { SupportPage } from '../components/support/SupportPage'
import { useSavedReportFilters } from '../hooks/useSavedReportFilters'
import { useAppState } from '../app/stateContext'

const riskFilters = [['all', 'All'], ['high-risk', 'High'], ['caution', 'Caution'], ['low-risk', 'Low']] as const

export function SavedPage() {
  const { savedReports, user, isSupabaseConfigured, isAuthLoading } = useAppState()
  const { query, setQuery, risk, setRisk, selectedIds, visibleReports, toggleSelected } = useSavedReportFilters(savedReports)
  const analyzeLink = <Link className="button button-primary" to="/analyze">Analyze a post</Link>

  if (isSupabaseConfigured && !user && !isAuthLoading) return <SupportPage title="Saved" actions={analyzeLink}><section className="panel empty-panel"><h2>Sign in to see saved reports</h2><p>You can analyze posts without an account.</p><Link className="button button-primary" to="/auth/sign-in">Sign in</Link></section></SupportPage>
  if (isSupabaseConfigured && isAuthLoading) return <SupportPage title="Saved"><section className="panel empty-panel" role="status"><p>Loading saved reports…</p></section></SupportPage>

  return <SupportPage title="Saved" actions={analyzeLink}>
    <div className="filters">
      <label className="search-field"><Icon icon="ph:magnifying-glass" width={17} height={17} aria-hidden="true" /><span className="sr-only">Search saved reports</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></label>
      <div className="chips" role="group" aria-label="Filter by risk">{riskFilters.map(([value, label]) => <button key={value} className="chip" type="button" aria-pressed={risk === value} onClick={() => setRisk(value)}>{label}</button>)}</div>
    </div>

    {visibleReports.length > 0 ? <section className="panel saved-table">
      <div className="saved-head" aria-hidden="true"><span /><span>Listing</span><span>Risk</span><span>Score</span><span>Saved</span><span /></div>
      <ul>{visibleReports.map((report) => <ReportListCard key={report.id} report={report} selected={selectedIds.includes(report.id)} onSelect={() => toggleSelected(report.id)} />)}</ul>
    </section> : <section className="panel empty-panel"><h2>{savedReports.length === 0 ? 'No saved reports yet' : 'No reports match'}</h2><p>{savedReports.length === 0 ? 'Save a report after you analyze a post.' : 'Try another search or filter.'}</p></section>}

    {selectedIds.length > 0 && <div className="compare-bar" role="status">
      <span>{selectedIds.length} selected</span>
      {selectedIds.length >= 2 ? <Link className="button button-primary" to={`/compare?ids=${selectedIds.join(',')}`}>Compare</Link> : <span className="muted">Select one more to compare</span>}
    </div>}
  </SupportPage>
}
