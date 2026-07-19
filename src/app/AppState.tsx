import { useMemo, useState, type PropsWithChildren } from 'react'
import { getFixtureById } from '../data/analysisFixtures'
import { createMockReport } from '../services/mockAnalysisService'
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

export function AppStateProvider({ children }: PropsWithChildren) {
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null)
  const [savedReports, setSavedReports] = useState<AnalysisReport[]>(makeSeedReports)

  const value = useMemo<AppStateValue>(() => ({
    activeReport,
    savedReports,
    setActiveReport,
    saveReport: (report) => {
      setSavedReports((current) => [report, ...current.filter((item) => item.id !== report.id)])
    },
    deleteReport: (analysisId) => {
      setSavedReports((current) => current.filter((report) => report.id !== analysisId))
    },
    deleteAllReports: () => setSavedReports([]),
    toggleChecklistItem: (analysisId, checklistId) => {
      const update = (report: AnalysisReport) => report.id === analysisId
        ? { ...report, checklist: report.checklist.map((item) => item.id === checklistId ? { ...item, completed: !item.completed } : item) }
        : report
      setSavedReports((current) => current.map(update))
      setActiveReport((current) => current && update(current))
    },
  }), [activeReport, savedReports])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
