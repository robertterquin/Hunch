import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppState } from '../app/stateContext'
import { validateEmail, validatePassword, validateSignIn, validateSignUp } from '../services/authValidation'

export function useAuthForm() {
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

  return {
    activeReport, user, displayName, setDisplayName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    error, message, isSubmitting, authMode, isRecovery, title, submit,
    submitLabel: isRecovery ? 'Update password' : authMode === 'sign-up' ? 'Create account' : authMode === 'reset' ? 'Send reset email' : 'Sign in',
    showSignedIn: Boolean(user) && !isRecovery,
  }
}
