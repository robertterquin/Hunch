import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleAlert, FileSearch, LockKeyhole, Settings, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

function SupportPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <div className="page-stack support-page"><section className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{description}</p></div></section>{children}</div>
}

export function SavedPage() {
  return <SupportPage eyebrow="Saved" title="Your saved checks" description="Private reports will appear here after authentication and explicit save consent."><section className="panel empty-panel"><ShieldCheck size={28} aria-hidden="true" /><h2>No saved checks yet.</h2><p>Analyze an OJT post and save the report to compare it later.</p><Link className="button button-primary" to="/analyze">Analyze a listing <ArrowRight size={16} aria-hidden="true" /></Link></section></SupportPage>
}

export function SavedAnalysisPage() {
  const { analysisId } = useParams()
  return <SupportPage eyebrow="Saved > Analysis report" title="Saved report detail" description={`Report ${analysisId ?? 'not found'} will render here once Supabase persistence is connected.`}><section className="panel empty-panel"><LockKeyhole size={28} aria-hidden="true" /><h2>Private report surface ready.</h2><p>This route is defined for Phase 10 saved analysis integration.</p><Link className="text-link" to="/saved"><ArrowLeft size={14} aria-hidden="true" /> Back to Saved</Link></section></SupportPage>
}

export function ComparePage() {
  return <SupportPage eyebrow="Saved > Compare" title="Compare saved listings" description="Comparison will show signals, missing information, and checklist progress without treating a lower score as a guarantee."><section className="panel empty-panel"><CircleAlert size={28} aria-hidden="true" /><h2>Select two saved reports to compare.</h2><p>The comparison surface is mapped now and will be powered by private saved reports in Phase 10 and Phase 12.</p><Link className="button button-secondary" to="/saved">Go to Saved</Link></section></SupportPage>
}

export function GuidePage() {
  const { patternId } = useParams()
  const patterns = ['Payment request', 'Suspicious recruiter email', 'Vague company identity', 'Urgency pressure', 'Sensitive documents requested early']
  return <SupportPage eyebrow="Scam Guide" title={patternId ? 'Pattern detail' : 'Learn the common signals'} description="A plain-language guide to warning patterns students may see in OJT and internship listings."><section className="support-grid">{patterns.map((pattern) => <Link className="support-card" key={pattern} to={`/guide/${pattern.toLowerCase().replaceAll(' ', '-')}`}><BookOpen size={18} aria-hidden="true" /><strong>{pattern}</strong><span>Read the signal and what to verify next.</span></Link>)}</section></SupportPage>
}

export function ChecklistPage() {
  const items = ['Verify the company website and official pages.', 'Check that the recruiter email matches the company domain.', 'Request a clear role description and supervisor details.', 'Do not pay before independent verification.', 'Do not send IDs or bank details too early.']
  return <SupportPage eyebrow="Checklist" title="Before you apply" description="Use these checks to turn a concern into a safer next action."><section className="panel checklist-panel"><div className="panel-heading"><div><p className="eyebrow">Reusable checklist</p><h2>Verify the important details.</h2></div><button className="button button-secondary" type="button">Reset</button></div><ul className="full-checklist">{items.map((item) => <li key={item}><span className="checkbox" aria-hidden="true" />{item}</li>)}</ul></section></SupportPage>
}

export function SettingsPage() {
  return <SupportPage eyebrow="Settings" title="Account and privacy" description="Manage saved data and account preferences when Supabase authentication is connected."><section className="support-grid"><div className="support-card"><Settings size={18} aria-hidden="true" /><strong>Profile</strong><span>Display name and account details.</span></div><div className="support-card"><LockKeyhole size={18} aria-hidden="true" /><strong>Saved data</strong><span>Delete private reports and optional assets.</span></div><div className="support-card"><ShieldCheck size={18} aria-hidden="true" /><strong>Session</strong><span>Sign out and clear private session data.</span></div></section></SupportPage>
}

export function AuthPage() {
  const { mode = 'sign-in' } = useParams()
  const title = mode === 'sign-up' ? 'Create an account' : mode === 'reset' ? 'Reset your password' : 'Sign in to save reports'
  return <SupportPage eyebrow="Account" title={title} description="Authentication will preserve the current analysis and unlock private saved reports in Phase 10."><section className="panel auth-panel"><label className="field-label" htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" /><button className="button button-primary" type="button">Continue <ArrowRight size={16} aria-hidden="true" /></button><p className="muted-copy">No account connection is active in the foundation phase.</p><Link className="text-link" to="/analyze"><ArrowLeft size={14} aria-hidden="true" /> Return to Analyze</Link></section></SupportPage>
}

export function ScreenshotReviewPage() {
  return <SupportPage eyebrow="Analyze > Screenshot review" title="Review extracted text before analyzing" description="OCR must be reviewed before Hunch scores a screenshot-derived listing."><section className="review-grid"><div className="panel upload-preview"><FileSearch size={30} aria-hidden="true" /><h2>Screenshot preview</h2><p>Select a screenshot in the next implementation step.</p></div><div className="panel"><label className="field-label" htmlFor="ocr-text">Extracted text</label><textarea id="ocr-text" placeholder="OCR text will appear here for review." /><p className="trust-note">Low-confidence or empty extraction must be corrected before analysis.</p><div className="button-row"><Link className="button button-secondary" to="/analyze">Cancel</Link><button className="button button-primary" type="button" disabled>Use this text</button></div></div></section></SupportPage>
}

export function FoundationCheck() {
  return <div><Check size={16} aria-hidden="true" /> Foundation ready</div>
}
