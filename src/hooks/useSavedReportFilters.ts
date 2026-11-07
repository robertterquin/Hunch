import { useMemo, useState } from 'react'
import { reportTitle, sourceLabels } from '../data/supportContent'
import type { AnalysisReport } from '../types/analysis'

export function useSavedReportFilters(savedReports: AnalysisReport[]) {
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const visibleReports = useMemo(() => {
    const queryText = query.trim().toLowerCase()
    return savedReports
      .filter((report) => (risk === 'all' || report.riskLevel === risk) && (!queryText || [reportTitle(report), report.originalText, report.sourceUrl ?? '', sourceLabels[report.sourceType]].some((value) => value.toLowerCase().includes(queryText))))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }, [query, risk, savedReports])
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return { query, setQuery, risk, setRisk, selectedIds, visibleReports, toggleSelected }
}
