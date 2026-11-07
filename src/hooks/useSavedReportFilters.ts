import { useMemo, useState } from 'react'
import { reportTitle, sourceLabels } from '../data/supportContent'
import type { AnalysisReport } from '../types/analysis'

export function useSavedReportFilters(savedReports: AnalysisReport[]) {
  const [filterTimestamp] = useState(() => Date.now())
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('all')
  const [source, setSource] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const availableSources = useMemo(() => [...new Set(savedReports.map((report) => report.sourceType))].sort((left, right) => sourceLabels[left].localeCompare(sourceLabels[right])), [savedReports])
  const visibleReports = useMemo(() => {
    const queryText = query.trim().toLowerCase()
    const minimumDate = dateRange === 'all' ? null : new Date(filterTimestamp - Number(dateRange) * 24 * 60 * 60 * 1000)
    const filtered = savedReports.filter((report) => {
      const matchesQuery = !queryText || [reportTitle(report), report.originalText, report.sourceUrl ?? '', sourceLabels[report.sourceType]].some((value) => value.toLowerCase().includes(queryText))
      const matchesDate = !minimumDate || new Date(report.createdAt) >= minimumDate
      return matchesQuery && matchesDate && (risk === 'all' || report.riskLevel === risk) && (source === 'all' || report.sourceType === source)
    })
    return filtered.sort((left, right) => {
      if (sort === 'oldest') return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      if (sort === 'highest-risk') return right.riskScore - left.riskScore || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      if (sort === 'lowest-risk') return left.riskScore - right.riskScore || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }, [dateRange, filterTimestamp, query, risk, savedReports, sort, source])
  const toggleSelected = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const hasFilters = Boolean(query || risk !== 'all' || source !== 'all' || dateRange !== 'all' || sort !== 'newest')
  const clearFilters = () => { setQuery(''); setRisk('all'); setSource('all'); setDateRange('all'); setSort('newest') }

  return { query, setQuery, risk, setRisk, source, setSource, dateRange, setDateRange, sort, setSort, selectedIds, visibleReports, availableSources, toggleSelected, hasFilters, clearFilters }
}
