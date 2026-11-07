import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { useAppState } from '../app/stateContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useState } from 'react'

export function SettingsPage() {
  const { savedReports, deleteAllReports, signOut, user, isSupabaseConfigured } = useAppState()
  const [message, setMessage] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const location = isSupabaseConfigured && user ? 'from your account' : 'from this browser session'
  const count = savedReports.length
  const confirmClearReports = async () => {
    setIsDeleteDialogOpen(false)
    const result = await deleteAllReports()
    setMessage(result.error ?? `All saved reports were removed ${location}.`)
  }
  const handleSignOut = async () => {
    const result = await signOut()
    setMessage(result.error ?? 'You are signed out. Your current unsaved report is still here.')
  }
  return <>
    <SupportPage title="Settings" className="settings-page">
      <section className="panel settings-list">
        <div className="settings-row"><div><h2>Account</h2><p>{user?.email ?? 'Not signed in'}</p></div>{user ? <button className="button button-secondary" type="button" onClick={() => void handleSignOut()}>Sign out</button> : <Link className="button button-secondary" to="/auth/sign-in">Sign in</Link>}</div>
        <div className="settings-row"><div><h2>Privacy</h2><p>Hunch only keeps reports you save: the post text, its link and the result.</p></div></div>
        <div className="settings-row"><div><h2>Delete saved reports</h2><p>{count === 0 ? 'No saved reports.' : `Removes ${count === 1 ? 'your saved report' : `all ${count} saved reports`} ${location}. This can’t be undone.`}</p></div><button className="button button-danger-outline" type="button" onClick={() => setIsDeleteDialogOpen(true)} disabled={count === 0}>Delete all</button></div>
      </section>
      {message && <div className={`notice ${message.startsWith('All') || message.startsWith('You are') ? 'notice-success' : 'notice-error'}`} role="status" aria-live="polite"><Icon icon="ph:check-bold" width={16} height={16} aria-hidden="true" />{message}</div>}
    </SupportPage>
    <ConfirmDialog open={isDeleteDialogOpen} title="Delete all saved reports?" description={`This permanently removes all saved reports ${location}. This can’t be undone.`} confirmLabel="Delete all" danger onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={() => void confirmClearReports()} />
  </>
}
