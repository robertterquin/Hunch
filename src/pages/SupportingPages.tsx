import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckSquare, CircleAlert, ExternalLink, FileSearch, ListChecks, LockKeyhole, RotateCcw, Search, Settings, ShieldCheck, Trash2, X } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAppState } from '../app/stateContext'
import { getFixtureTitle } from '../data/analysisFixtures'
import { RULE_CATALOG } from '../data/ruleCatalog'
import { AnalysisReportView } from '../components/AnalysisReportView'
import { validateEmail, validatePassword, validateSignIn, validateSignUp } from '../services/authValidation'
import type { AnalysisReport, SourceType } from '../types/analysis'

const guideFixtures: Partial<Record<string, string>> = {
  'payment-request': 'suspicious-01',
  'suspicious-email': 'informal-01',
  'vague-company': 'incomplete-01',
  'vague-role': 'incomplete-01',
  'unrealistic-compensation': 'suspicious-01',
  'urgency-pressure': 'suspicious-01',
  'chat-only-hiring': 'suspicious-01',
  'sensitive-information': 'suspicious-01',
}

const guideEntries = RULE_CATALOG.map((rule) => ({
  id: rule.category,
  title: rule.title,
  description: rule.explanation,
  rationale: rule.rationale,
  safetyTip: rule.nextAction,
  fixtureId: guideFixtures[rule.category] ?? 'suspicious-01',
}))

const sourceLabels: Record<SourceType, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  email: 'Email',
  messenger: 'Messenger',
  'school-group': 'School group',
  'school-referral': 'School referral',
  'student-group-chat': 'Student group chat',
  'messenger-forward': 'Forwarded message',
  other: 'Other',
  'public-link': 'Public link',
}

const reusableChecklist = [
  'Verify the company website and official pages.',
  'Check that the recruiter email matches the company domain.',
  'Request a clear role description and supervisor details.',
  'Do not pay before independent verification.',
  'Do not send IDs or bank details too early.',
]

const generalChecklistStorageKey = 'hunch.general-checklist'

function SupportPage({ eyebrow, title, description, actions, children, className = '' }: { eyebrow: string; title: string; description: string; actions?: ReactNode; children?: ReactNode; className?: string }) {
  return <div className={`page-stack support-page${className ? ` ${className}` : ''}`}><section className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</section>{children}</div>
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function riskLabel(report: AnalysisReport) {
  return report.riskLevel === 'low-risk' ? 'Low risk' : report.riskLevel === 'high-risk' ? 'High risk' : 'Caution'
}

function reportTitle(report: AnalysisReport) {
  return report.listingTitle ?? getFixtureTitle(report.fixtureId)
}

function sourceLabel(report: AnalysisReport) {
  return sourceLabels[report.sourceType]
}

function completedChecklistCount(report: AnalysisReport) {
  return report.checklist.filter((item) => item.completed).length
}

function ReportListCard({ report, selected, onSelect }: { report: AnalysisReport; selected: boolean; onSelect: () => void }) {
  return <article className={`saved-report-card${selected ? ' is-selected' : ''}`}>
    <button className={`select-report${selected ? ' is-selected' : ''}`} type="button" onClick={onSelect} aria-label={`${selected ? 'Deselect' : 'Select'} ${reportTitle(report)} for comparison`}><Check size={15} aria-hidden="true" /></button>
    <Link to={`/saved/${report.id}`} className="saved-report-main"><div className="saved-report-heading"><strong>{reportTitle(report)}</strong><span className={`risk-pill risk-pill-${report.riskLevel}`}>{riskLabel(report)}</span></div><p>{report.summary}</p><div className="saved-report-meta"><span>{sourceLabel(report)}</span><span>{report.riskScore}/100</span><span>{report.flags.length} signals</span><span>{formatDate(report.createdAt)}</span></div></Link>
    <Link className="text-link" to={`/saved/${report.id}`} aria-label={`Open ${reportTitle(report)}`}><ArrowRight size={17} aria-hidden="true" /></Link>
  </article>
}

export function SavedPage() {
  const { savedReports, user, isSupabaseConfigured, isAuthLoading } = useAppState()
  const [filterTimestamp] = useState(() => Date.now())
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('all')
  const [source, setSource] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const availableSources = useMemo(() => [...new Set(savedReports.map((report) => report.sourceType))].sort((left, right) => sourceLabels[left].localeCompare(sourceLabels[right])), [savedReports])
  const visibleReports = useMemo(() => {
    const queryText = query.trim().toLowerCase()
    const minimumDate = dateRange === 'all' ? null : new Date(filterTimestamp - Number(dateRange) * 24 * 60 * 60 * 1000)
    const filtered = savedReports.filter((report) => {
      const matchesQuery = !queryText || [reportTitle(report), report.originalText, report.sourceUrl ?? '', sourceLabel(report)].some((value) => value.toLowerCase().includes(queryText))
      const matchesDate = !minimumDate || new Date(report.createdAt) >= minimumDate
      return matchesQuery && matchesDate && (risk === 'all' || report.riskLevel === risk) && (source === 'all' || report.sourceType === source)
    })
    return filtered.sort((left, right) => {
      if (sort === 'oldest') return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      if (sort === 'highest-risk') return right.riskScore - left.riskScore || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      if (sort === 'lowest-risk') return left.riskScore - right.riskScore || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }, [dateRange, filterTimestamp, query, risk, savedReports, sort, source])
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const hasFilters = Boolean(query || risk !== 'all' || source !== 'all' || dateRange !== 'all' || sort !== 'newest')
  const clearFilters = () => { setQuery(''); setRisk('all'); setSource('all'); setDateRange('all'); setSort('newest') }

  if (isSupabaseConfigured && !user && !isAuthLoading) return <SupportPage eyebrow="Saved" title="Your saved checks" description="Saved reports are private to your Supabase account." actions={<Link className="button button-primary" to="/analyze"><ArrowRight size={16} aria-hidden="true" />New analysis</Link>}><section className="panel empty-panel"><LockKeyhole size={28} aria-hidden="true" /><h2>Sign in to open Saved.</h2><p>Your current analysis can stay anonymous. Sign in only when you want to save or revisit a report.</p><Link className="button button-primary" to="/auth/sign-in">Sign in to continue <ArrowRight size={16} aria-hidden="true" /></Link></section></SupportPage>
  if (isSupabaseConfigured && isAuthLoading) return <SupportPage eyebrow="Saved" title="Your saved checks" description="Loading your private reports."><section className="panel empty-panel"><Search size={28} aria-hidden="true" /><h2>Loading saved reports</h2><p>Hunch is checking your account before showing private report data.</p></section></SupportPage>

  return <SupportPage eyebrow="Saved" title="Your saved checks" description="Keep private report snapshots here so you can review or compare them later." actions={<Link className="button button-primary" to="/analyze"><ArrowRight size={16} aria-hidden="true" />New analysis</Link>}>
    <section className="saved-layout"><div className="saved-list-panel panel">
      <div className="filter-row"><label className="search-field"><Search size={16} aria-hidden="true" /><span className="sr-only">Search saved checks</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, text, source, or link" /></label><label className="filter-select"><span className="sr-only">Filter by risk</span><select value={risk} onChange={(event) => setRisk(event.target.value)}><option value="all">All risk levels</option><option value="low-risk">Low risk</option><option value="caution">Caution</option><option value="high-risk">High risk</option></select></label></div>
      <div className="filter-row filter-row-secondary"><label className="filter-select"><span className="sr-only">Filter by source</span><select value={source} onChange={(event) => setSource(event.target.value)}><option value="all">All sources</option>{availableSources.map((value) => <option key={value} value={value}>{sourceLabels[value]}</option>)}</select></label><label className="filter-select"><span className="sr-only">Filter by date</span><select value={dateRange} onChange={(event) => setDateRange(event.target.value)}><option value="all">Any date</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><label className="filter-select"><span className="sr-only">Sort saved reports</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest-risk">Highest risk</option><option value="lowest-risk">Lowest risk</option></select></label></div>
      <div className="list-heading"><div><p className="section-label">Private reports</p><span className="muted-copy">{visibleReports.length} of {savedReports.length} checks</span></div>{hasFilters && <button className="button button-secondary button-compact" type="button" onClick={clearFilters}><X size={14} aria-hidden="true" />Clear filters</button>}</div>
      {visibleReports.length > 0 ? <div className="saved-report-list">{visibleReports.map((report) => <ReportListCard key={report.id} report={report} selected={selectedIds.includes(report.id)} onSelect={() => toggleSelected(report.id)} />)}</div> : <div className="empty-inline"><Search size={22} aria-hidden="true" /><strong>{savedReports.length === 0 ? 'No saved checks yet.' : 'No checks match those filters.'}</strong><span>{savedReports.length === 0 ? 'Analyze an OJT post and save the report to compare it later.' : 'Try a different search or clear the filters.'}</span></div>}
    </div><aside className="panel compare-rail"><p className="eyebrow">Compare</p><h2>Look at reports side by side.</h2><p className="muted-copy">Select two or more saved reports to compare scores, evidence, missing information, and checklist progress.</p><div className="selection-count"><span>{selectedIds.length}</span><span>selected</span></div><Link className={`button button-primary${selectedIds.length < 2 ? ' is-disabled' : ''}`} to={selectedIds.length >= 2 ? `/compare?ids=${selectedIds.join(',')}` : '/saved'} aria-disabled={selectedIds.length < 2}><CheckSquare size={16} aria-hidden="true" />Compare selected</Link><p className="safety-note"><ShieldCheck size={14} aria-hidden="true" />The lower score is not guaranteed safe.</p></aside></section>
  </SupportPage>
}

export function SavedAnalysisPage() {
  const { analysisId } = useParams()
  const { savedReports, deleteReport, toggleChecklistItem } = useAppState()
  const report = savedReports.find((item) => item.id === analysisId)
  if (!report) return <SupportPage eyebrow="Saved > Report" title="Report not found" description="This private report may have been deleted or is not available in the current session."><section className="panel empty-panel"><CircleAlert size={28} aria-hidden="true" /><h2>That report is unavailable.</h2><Link className="button button-primary" to="/saved">Back to Saved</Link></section></SupportPage>
  return <SupportPage eyebrow="Saved > Report" title={reportTitle(report)} description={`Saved ${formatDate(report.createdAt)} - ${report.analysisVersion}`} actions={<Link className="button button-secondary" to="/saved"><ArrowLeft size={16} aria-hidden="true" />Back to Saved</Link>}><div className="detail-actions"><button className="button button-secondary" type="button" onClick={() => { if (window.confirm('Delete this private report?')) void deleteReport(report.id) }}><Trash2 size={16} aria-hidden="true" />Delete report</button><Link className="button button-secondary" to={`/compare?ids=${report.id}`}><CheckSquare size={16} aria-hidden="true" />Compare reports</Link></div><AnalysisReportView report={report} onToggleChecklist={(checklistId) => toggleChecklistItem(report.id, checklistId)} /></SupportPage>
}

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

export function GuidePage() {
  const { patternId } = useParams()
  const pattern = guideEntries.find((item) => item.id === patternId)
  if (pattern) return <SupportPage eyebrow="Scam Guide > Pattern" title={pattern.title} description={pattern.description} actions={<Link className="button button-secondary" to="/guide"><ArrowLeft size={16} aria-hidden="true" />All patterns</Link>}><section className="guide-detail-grid"><article className="panel guide-detail"><div className="guide-icon"><BookOpen size={22} aria-hidden="true" /></div><p className="section-label">Why it matters</p><p>{pattern.rationale}</p><p className="section-label">What to do</p><p>{pattern.safetyTip}</p><p className="section-label">Related checklist actions</p><ul className="guide-action-list"><li><Check size={15} aria-hidden="true" />{pattern.safetyTip}</li><li><Check size={15} aria-hidden="true" />Verify through a school coordinator or official company channel before applying.</li></ul><div className="guide-callout"><ShieldCheck size={17} aria-hidden="true" /><span>Hunch describes signals in a post. It does not accuse a company or prove fraud.</span></div><Link className="button button-primary" to={`/analyze?fixture=${pattern.fixtureId}`}><FileSearch size={16} aria-hidden="true" />Try a sample post</Link></article><aside className="panel guide-next"><p className="eyebrow">Keep checking</p><h2>One signal is a reason to verify, not a verdict.</h2><ul className="signal-list"><li><Check size={16} aria-hidden="true" />Confirm the company through an independent channel.</li><li><Check size={16} aria-hidden="true" />Ask for clear role and supervisor details.</li><li><Check size={16} aria-hidden="true" />Do not send money or sensitive documents early.</li></ul></aside></section></SupportPage>
  return <SupportPage eyebrow="Scam Guide" title="Learn the common signals" description="Plain-language patterns from Hunch's rule catalog to help students pause, verify, and decide what to do next."><section className="support-grid guide-grid">{guideEntries.map((item) => <Link className="support-card guide-card" key={item.id} to={`/guide/${item.id}`}><div className="guide-icon"><BookOpen size={18} aria-hidden="true" /></div><strong>{item.title}</strong><span>{item.description}</span><span className="text-link">Read pattern <ArrowRight size={14} aria-hidden="true" /></span></Link>)}</section></SupportPage>
}

function readGeneralChecklist() {
  try {
    const stored = sessionStorage.getItem(generalChecklistStorageKey)
    return stored ? JSON.parse(stored) as string[] : []
  } catch {
    return []
  }
}

export function ChecklistPage() {
  const { activeReport, savedReports, toggleChecklistItem } = useAppState()
  const reports = useMemo(() => {
    const allReports = activeReport ? [activeReport, ...savedReports] : savedReports
    return allReports.filter((report, index) => allReports.findIndex((item) => item.id === report.id) === index)
  }, [activeReport, savedReports])
  const [completed, setCompleted] = useState<string[]>(readGeneralChecklist)
  const [selectedReportId, setSelectedReportId] = useState('')
  useEffect(() => { try { sessionStorage.setItem(generalChecklistStorageKey, JSON.stringify(completed)) } catch { /* Session persistence is optional. */ } }, [completed])
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports.find((report) => report.id === activeReport?.id) ?? reports[0]
  const toggleGeneral = (item: string) => setCompleted((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])
  return <SupportPage eyebrow="Checklist" title="Before you apply" description="Use a reusable checklist, then switch to report-specific actions when a listing needs closer verification." actions={<button className="button button-secondary" type="button" onClick={() => setCompleted([])}><RotateCcw size={16} aria-hidden="true" />Reset general checklist</button>}>
    <section className="checklist-depth-grid"><section className="panel checklist-panel"><div className="checklist-progress"><div><p className="eyebrow">Reusable checklist</p><h2>Verify the important details.</h2></div><strong>{completed.length}/{reusableChecklist.length}</strong></div><div className="progress-track"><span style={{ width: `${(completed.length / reusableChecklist.length) * 100}%` }} /></div><ul className="full-checklist">{reusableChecklist.map((item) => <li key={item}><button className={`check-button${completed.includes(item) ? ' is-complete' : ''}`} type="button" onClick={() => toggleGeneral(item)} aria-label={`${completed.includes(item) ? 'Mark incomplete' : 'Complete'}: ${item}`}><Check size={14} aria-hidden="true" /></button><span className={completed.includes(item) ? 'is-complete' : ''}>{item}</span></li>)}</ul></section>
    <section className="panel report-checklist-panel"><div className="panel-heading"><div><p className="eyebrow">Report-specific checklist</p><h2>Follow the report's next steps.</h2></div><ListChecks size={20} aria-hidden="true" /></div>{reports.length > 0 ? <><label className="field-label" htmlFor="checklist-report">Choose a report</label><select id="checklist-report" value={selectedReport?.id ?? ''} onChange={(event) => setSelectedReportId(event.target.value)}>{reports.map((report) => <option key={report.id} value={report.id}>{reportTitle(report)} - {riskLabel(report)}</option>)}</select>{selectedReport && <><div className="list-heading"><span className="section-label">Suggested actions</span><span className="count-label">{completedChecklistCount(selectedReport)}/{selectedReport.checklist.length}</span></div><ul className="full-checklist report-specific-checklist">{selectedReport.checklist.map((item) => <li key={item.id}><button className={`check-button${item.completed ? ' is-complete' : ''}`} type="button" onClick={() => toggleChecklistItem(selectedReport.id, item.id)} aria-label={`${item.completed ? 'Mark incomplete' : 'Complete'}: ${item.label}`}><Check size={14} aria-hidden="true" /></button><span className={item.completed ? 'is-complete' : ''}><strong>{item.label}</strong><small>{item.reason}</small></span></li>)}</ul></>}</> : <div className="empty-inline"><ListChecks size={22} aria-hidden="true" /><strong>No report-specific actions yet.</strong><span>Analyze a listing to receive practical next steps tied to its visible signals.</span><Link className="button button-secondary" to="/analyze">Analyze a listing</Link></div>}</section></section>
  </SupportPage>
}

export function SettingsPage() {
  const { savedReports, deleteAllReports, signOut, user, isSupabaseConfigured } = useAppState()
  const [privacy, setPrivacy] = useState(true)
  const [message, setMessage] = useState('')
  const clearReports = async () => { if (window.confirm('Delete all saved reports from this session?')) { const result = await deleteAllReports(); setMessage(result.error ?? 'All saved reports were removed from this session.') } }
  const handleSignOut = async () => { const result = await signOut(); setMessage(result.error ?? 'You are signed out. Private saved data is no longer active.') }
  return <SupportPage eyebrow="Settings" title="Account and privacy" description="Control what Hunch keeps in this browser session and how you return to your saved checks."><section className="settings-stack"><div className="panel settings-row"><div className="settings-icon"><Settings size={19} aria-hidden="true" /></div><div><h2>{user ? 'Signed in' : 'Anonymous session'}</h2><p className="muted-copy">{user?.email ?? 'You can analyze without an account. Sign in only when you want to save private reports.'}</p></div>{user ? <button className="button button-secondary" type="button" onClick={() => void handleSignOut()}>Sign out</button> : <Link className="button button-secondary" to="/auth/sign-in">Sign in</Link>}</div><div className="panel settings-row"><div className="settings-icon"><LockKeyhole size={19} aria-hidden="true" /></div><div><h2>Privacy notice</h2><p className="muted-copy">Hunch keeps submitted text in the active flow unless you explicitly save a report.</p></div><button className={`toggle${privacy ? ' is-on' : ''}`} type="button" onClick={() => setPrivacy((current) => !current)} aria-pressed={privacy}><span />{privacy ? 'On' : 'Off'}</button></div><div className="panel settings-row settings-danger"><div className="settings-icon"><Trash2 size={19} aria-hidden="true" /></div><div><h2>Delete saved data</h2><p className="muted-copy">{savedReports.length} saved report{savedReports.length === 1 ? '' : 's'} {isSupabaseConfigured && user ? 'in your account' : 'in this session'}.</p></div><button className="button button-secondary" type="button" onClick={() => void clearReports()} disabled={savedReports.length === 0}>Delete all</button></div>{message && <div className="notice notice-success" role="status"><Check size={16} aria-hidden="true" />{message}</div>}</section></SupportPage>
}

export function AuthPage() {
  const { mode = 'sign-in' } = useParams()
  const { activeReport, savedReports, user, signIn, signUp, requestPasswordReset, updatePassword, saveReport } = useAppState()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const authMode = mode === 'reset' ? 'reset' : mode === 'sign-up' ? 'sign-up' : 'sign-in'
  const isRecovery = authMode === 'reset' && Boolean(user)
  const title = authMode === 'sign-up' ? 'Create an account' : isRecovery ? 'Choose a new password' : authMode === 'reset' ? 'Reset your password' : 'Sign in to save reports'
  useEffect(() => { if (user && activeReport && !savedReports.some((report) => report.id === activeReport.id)) void saveReport(activeReport) }, [activeReport, saveReport, savedReports, user])
  const submit = async () => {
    const validation = isRecovery ? validatePassword(password) ?? (password === confirmPassword ? null : 'Passwords do not match.') : authMode === 'sign-up' ? validateSignUp({ displayName, email, password, confirmPassword }) : authMode === 'sign-in' ? validateSignIn(email, password) : validateEmail(email)
    if (validation) { setError(validation); return }
    setError(''); setMessage(''); setIsSubmitting(true)
    const result = isRecovery ? await updatePassword(password) : authMode === 'sign-up' ? await signUp(displayName, email, password) : authMode === 'sign-in' ? await signIn(email, password) : await requestPasswordReset(email)
    setIsSubmitting(false)
    if (result.error) setError(result.error)
    else setMessage(result.message ?? 'Your account has been updated.')
  }
  const submitLabel = isRecovery ? 'Update password' : authMode === 'sign-up' ? 'Create account' : authMode === 'reset' ? 'Send reset email' : 'Sign in'
  const showSignedIn = Boolean(user) && !isRecovery
  return <SupportPage className="auth-page" eyebrow="Account" title={title} description={activeReport ? 'Your current report will stay available while you sign in. After authentication, it can be saved privately.' : 'Create a private account to save and revisit your reports.'}><section className="panel auth-panel"><div className="auth-heading"><div className="settings-icon"><LockKeyhole size={19} aria-hidden="true" /></div><div><strong>{activeReport ? 'Your report is preserved' : 'Private reports, when you are ready'}</strong><p className="muted-copy">No report is saved until you choose to continue.</p></div></div>{showSignedIn ? <div className="auth-success"><Check size={22} aria-hidden="true" /><h2>You are signed in.</h2><p>{user?.email ?? 'Your account'} can now access private reports.</p><Link className="button button-primary" to={activeReport ? '/analyze' : '/saved'}>{activeReport ? 'Return to Analyze' : 'Open Saved'} <ArrowRight size={16} aria-hidden="true" /></Link></div> : <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void submit() }}>{authMode === 'sign-up' && <><label className="field-label" htmlFor="display-name">Full name</label><input id="display-name" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Juan dela Cruz" autoComplete="name" maxLength={100} /></>}{!isRecovery && <><label className="field-label" htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></>}{authMode !== 'reset' || isRecovery ? <><label className="field-label" htmlFor="password">{isRecovery ? 'New password' : 'Password'}</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRecovery || authMode === 'sign-up' ? 'new-password' : 'current-password'} />{(authMode === 'sign-up' || isRecovery) && <><label className="field-label" htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></>}</> : null}{error && <p className="inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}{message && <div className="notice notice-success" role="status"><Check size={16} aria-hidden="true" />{message}</div>}<button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : submitLabel} <ArrowRight size={16} aria-hidden="true" /></button>{authMode === 'sign-in' && <div className="auth-links"><Link className="text-link" to="/auth/reset">Forgot password?</Link><Link className="text-link" to="/auth/sign-up">Create an account</Link></div>}{authMode === 'sign-up' && <p className="muted-copy">Already have an account? <Link className="text-link" to="/auth/sign-in">Sign in</Link></p>}{authMode === 'reset' && <p className="muted-copy">{isRecovery ? 'Use at least 8 characters for your new password.' : 'We will email a secure link to choose a new password.'}</p>}</form>}<Link className="text-link" to="/analyze"><ArrowLeft size={14} aria-hidden="true" />Return to Analyze</Link></section></SupportPage>
}
