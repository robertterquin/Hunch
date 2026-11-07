import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { SupportPage } from '../components/support/SupportPage'
import { useAuthForm } from '../hooks/useAuthForm'

export function AuthPage() {
  const { activeReport, user, displayName, setDisplayName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, error, message, isSubmitting, authMode, isRecovery, title, submit, submitLabel, showSignedIn } = useAuthForm()
  const description = activeReport ? 'Your current report stays here while you sign in.' : 'Save reports and compare them later.'
  return <SupportPage className="auth-page" title={title} description={description}>
    <section className="sheet auth-panel">
      {showSignedIn ? <div className="auth-success">
        <h2>You’re signed in.</h2>
        <p>{user?.email ?? 'Your account'} can now save reports.</p>
        <Link className="button button-primary" to={activeReport ? '/analyze' : '/saved'}>{activeReport ? 'Back to your report' : 'Open Saved'}</Link>
      </div> : <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void submit() }}>
        {authMode === 'sign-up' && <><label className="field-label" htmlFor="display-name">Full name</label><input id="display-name" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Juan dela Cruz" autoComplete="name" maxLength={100} /></>}
        {!isRecovery && <><label className="field-label" htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.edu.ph" autoComplete="email" /></>}
        {authMode !== 'reset' || isRecovery ? <>
          <label className="field-label" htmlFor="password">{isRecovery ? 'New password' : 'Password'}</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRecovery || authMode === 'sign-up' ? 'new-password' : 'current-password'} />
          {(authMode === 'sign-up' || isRecovery) && <><label className="field-label" htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></>}
        </> : null}
        {error && <p className="inline-error" role="alert"><Icon icon="ph:warning-circle" width={16} height={16} aria-hidden="true" />{error}</p>}
        {message && <div className="notice notice-success" role="status"><Icon icon="ph:check-bold" width={16} height={16} aria-hidden="true" />{message}</div>}
        <button className="button button-primary button-large" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : submitLabel}</button>
        {authMode === 'sign-in' && <div className="auth-links"><Link to="/auth/reset">Forgot password?</Link><Link to="/auth/sign-up">Create account</Link></div>}
        {authMode === 'sign-up' && <p className="auth-alt">Already have an account? <Link to="/auth/sign-in">Sign in</Link></p>}
        {authMode === 'reset' && <p className="auth-alt">{isRecovery ? 'Use at least 8 characters.' : 'We’ll email you a link to choose a new password.'}</p>}
      </form>}
    </section>
  </SupportPage>
}
