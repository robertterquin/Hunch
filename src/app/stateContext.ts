import { createContext, useContext } from 'react'
import type { AnalysisReport } from '../types/analysis'

export interface AppStateValue {
  activeReport: AnalysisReport | null
  savedReports: AnalysisReport[]
  setActiveReport: (report: AnalysisReport | null) => void
  saveReport: (report: AnalysisReport) => void
  deleteReport: (analysisId: string) => void
  deleteAllReports: () => void
  toggleChecklistItem: (analysisId: string, checklistId: string) => void
}

export const AppStateContext = createContext<AppStateValue | null>(null)

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
