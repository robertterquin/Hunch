import { Check, LockKeyhole, Settings as SettingsIcon, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { useAppState } from '../app/stateContext'
import { useState } from 'react'

export function SettingsPage() {
  const { savedReports, deleteAllReports, signOut, user, isSupabaseConfigured } = useAppState()
  const [message, setMessage] = useState('')
  const clearReports = async () => {
    const location = isSupabaseConfigured && user ? 'from your private Supabase account' : 'from this browser session'
    if (window.confirm(`Delete all saved reports ${location}? This cannot be undone.`)) {
      const result = await deleteAllReports()
      setMessage(result.error ?? `All saved reports were removed ${location}.`)
    }
  }
  const handleSignOut = async () => {
    const result = await signOut()
    setMessage(result.error ?? 'You are signed out. Private saved data is no longer active in this session, but an unsaved current report stays available.')
  }
  return <SupportPage eyebrow="Settings" title="Account and privacy" description="Control what Hunch keeps in this browser session and how you return to your saved checks."><section className="settings-stack"><div className="panel settings-row"><div className="settings-icon"><SettingsIcon size={19} aria-hidden="true" /></div><div><h2>{user ? 'Signed in' : 'Anonymous session'}</h2><p className="muted-copy">{user?.email ?? 'You can analyze without an account. Sign in only when you want to save private reports.'}</p></div>{user ? <button className="button button-secondary" type="button" onClick={() => void handleSignOut()}>Sign out</button> : <Link className="button button-secondary" to="/auth/sign-in">Sign in</Link>}</div><div className="panel settings-row"><div className="settings-icon"><LockKeyhole size={19} aria-hidden="true" /></div><div><h2>Privacy notice</h2><p className="muted-copy">Submitted text and public-link extracts stay in the active browser flow. Hunch saves report text and source links only when you explicitly save a report.</p></div><span className="privacy-badge">Explicit save only</span></div><div className="panel settings-row settings-danger"><div className="settings-icon"><Trash2 size={19} aria-hidden="true" /></div><div><h2>Delete saved data</h2><p className="muted-copy">{savedReports.length} saved report{savedReports.length === 1 ? '' : 's'} {isSupabaseConfigured && user ? 'in your account' : 'in this session'}. Deleting saved reports does not delete an unsaved active analysis.</p></div><button className="button button-secondary" type="button" onClick={() => void clearReports()} disabled={savedReports.length === 0}>Delete all</button></div>{message && <div className={`notice ${message.startsWith('All') || message.startsWith('You are') ? 'notice-success' : 'notice-error'}`} role="status" aria-live="polite"><Check size={16} aria-hidden="true" />{message}</div>}</section></SupportPage>
}
