import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { User } from '@supabase/supabase-js'
import { getFixtureById } from '../data/analysisFixtures'
import { isSupabaseConfigured } from '../lib/supabase'
import { createMockReport } from '../services/mockAnalysisService'
import { deleteAllSavedReports, deleteSavedReport, fetchSavedReports, getCurrentUser, saveAnalysisReport, sendPasswordReset, signInWithPassword, signOut as supabaseSignOut, signUpWithPassword, subscribeToAuthChanges, updatePassword as updateSupabasePassword, updateSavedChecklistItem } from '../services/supabaseAnalysisService'
import type { AnalysisReport } from '../types/analysis'
import { AppStateContext, type AppStateValue } from './stateContext'

function makeSeedReports(): AnalysisReport[] {
  const seeds = [
    { fixtureId: 'safe-01', id: 'saved-brightline', createdAt: '2026-07-18T09:30:00.000Z' },
    { fixtureId: 'informal-01', id: 'saved-northstar', createdAt: '2026-07-17T14:10:00.000Z' },
  ]

  return seeds.flatMap(({ fixtureId, id, createdAt }) => {
    const fixture = getFixtureById(fixtureId)
    return fixture ? [createMockReport(fixture, { id, createdAt })] : []
  })
}

function readActiveReport(): AnalysisReport | null {
  try {
    const stored = sessionStorage.getItem('hunch.active-report')
    return stored ? JSON.parse(stored) as AnalysisReport : null
  } catch {
    return null
  }
}

function authErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : ''
  if (/invalid login credentials/i.test(message)) return 'Email or password is incorrect.'
  if (/user already registered/i.test(message)) return 'An account with this email already exists. Sign in instead.'
  if (/email not confirmed/i.test(message)) return 'Email confirmation is enabled in Supabase. Disable it for immediate account access.'
  return message || fallback
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [activeReport, setActiveReportState] = useState<AnalysisReport | null>(readActiveReport)
  const [savedReports, setSavedReports] = useState<AnalysisReport[]>(() => isSupabaseConfigured ? [] : makeSeedReports())
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured)

  const setActiveReport = useCallback((report: AnalysisReport | null) => {
    setActiveReportState(report)
    try {
      if (report) sessionStorage.setItem('hunch.active-report', JSON.stringify(report))
      else sessionStorage.removeItem('hunch.active-report')
    } catch {
      // Session storage is optional; the active report still works in memory.
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let mounted = true
    const hydrate = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return
        setUser(currentUser)
        setSavedReports(currentUser ? await fetchSavedReports(currentUser.id) : [])
      } catch {
        if (mounted) setSavedReports([])
      } finally {
        if (mounted) setIsAuthLoading(false)
      }
    }
    void hydrate()
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser)
      if (nextUser) void fetchSavedReports(nextUser.id).then(setSavedReports).catch(() => setSavedReports([]))
      else setSavedReports([])
    })
    return () => { mounted = false; unsubscribe() }
  }, [])

  const value = useMemo<AppStateValue>(() => ({
    activeReport,
    savedReports,
    user,
    isAuthLoading,
    isSupabaseConfigured,
    setActiveReport,
    saveReport: async (report) => {
      if (!isSupabaseConfigured) {
        setSavedReports((current) => [report, ...current.filter((item) => item.id !== report.id)])
        return {}
      }
      if (!user) return { error: 'Sign in to save this report. Your current result will be preserved.' }
      try {
        const persistedReport = await saveAnalysisReport(report, user.id)
        setSavedReports((current) => [persistedReport, ...current.filter((item) => item.id !== persistedReport.id)])
        setActiveReport(persistedReport)
        return {}
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'The report could not be saved.' }
      }
    },
    deleteReport: async (analysisId) => {
      if (isSupabaseConfigured && user) {
        try {
          await deleteSavedReport(analysisId, user.id)
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'The report could not be deleted.' }
        }
      }
      setSavedReports((current) => current.filter((report) => report.id !== analysisId))
      return {}
    },
    deleteAllReports: async () => {
      if (isSupabaseConfigured && user) {
        try {
          await deleteAllSavedReports(user.id)
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Saved reports could not be deleted.' }
        }
      }
      setSavedReports([])
      return {}
    },
    toggleChecklistItem: (analysisId, checklistId) => {
      const update = (report: AnalysisReport) => report.id === analysisId
        ? { ...report, checklist: report.checklist.map((item) => item.id === checklistId ? { ...item, completed: !item.completed } : item) }
        : report
      setSavedReports((current) => current.map(update))
      setActiveReport(activeReport && update(activeReport))
      const savedReport = savedReports.find((report) => report.id === analysisId)
      const checklistItem = savedReport?.checklist.find((item) => item.id === checklistId)
      if (isSupabaseConfigured && user && checklistItem) void updateSavedChecklistItem(checklistId, !checklistItem.completed)
    },
    signUp: async (displayName, email, password) => {
      try {
        await signUpWithPassword(displayName, email, password)
        return { message: 'Your account is ready. Your private report will be saved now.' }
      } catch (error) {
        return { error: authErrorMessage(error, 'Your account could not be created.') }
      }
    },
    signIn: async (email, password) => {
      try {
        await signInWithPassword(email, password)
        return { message: 'You are signed in. Your private reports are loading.' }
      } catch (error) {
        return { error: authErrorMessage(error, 'Could not sign in.') }
      }
    },
    requestPasswordReset: async (email) => {
      try {
        await sendPasswordReset(email)
        return { message: 'Password reset instructions are on their way if this email is registered.' }
      } catch (error) {
        return { error: authErrorMessage(error, 'Password reset instructions could not be sent.') }
      }
    },
    updatePassword: async (password) => {
      try {
        await updateSupabasePassword(password)
        return { message: 'Your password has been updated.' }
      } catch (error) {
        return { error: authErrorMessage(error, 'Your password could not be updated.') }
      }
    },
    signOut: async () => {
      if (!isSupabaseConfigured) return {}
      try {
        await supabaseSignOut()
        setUser(null)
        setSavedReports([])
        return {}
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Could not sign out.' }
      }
    },
  }), [activeReport, isAuthLoading, savedReports, setActiveReport, user])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
