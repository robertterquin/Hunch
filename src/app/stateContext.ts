import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { AnalysisReport } from '../types/analysis'

export interface AppStateValue {
  activeReport: AnalysisReport | null
  savedReports: AnalysisReport[]
  user: User | null
  isAuthLoading: boolean
  isSupabaseConfigured: boolean
  setActiveReport: (report: AnalysisReport | null) => void
  saveReport: (report: AnalysisReport) => Promise<{ error?: string }>
  deleteReport: (analysisId: string) => Promise<{ error?: string }>
  deleteAllReports: () => Promise<{ error?: string }>
  toggleChecklistItem: (analysisId: string, checklistId: string) => void
  sendAuthEmail: (email: string, mode: 'sign-in' | 'sign-up' | 'reset') => Promise<{ message?: string; error?: string }>
  signOut: () => Promise<{ error?: string }>
}

export const AppStateContext = createContext<AppStateValue | null>(null)

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
