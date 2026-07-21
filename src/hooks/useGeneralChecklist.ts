import { useEffect, useState } from 'react'
import { generalChecklistStorageKey } from '../data/supportContent'

function readGeneralChecklist() {
  try {
    const stored = sessionStorage.getItem(generalChecklistStorageKey)
    return stored ? JSON.parse(stored) as string[] : []
  } catch {
    return []
  }
}

export function useGeneralChecklist() {
  const [completed, setCompleted] = useState<string[]>(readGeneralChecklist)
  useEffect(() => { try { sessionStorage.setItem(generalChecklistStorageKey, JSON.stringify(completed)) } catch { /* Session persistence is optional. */ } }, [completed])
  const toggle = (item: string) => setCompleted((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])
  const reset = () => setCompleted([])
  return { completed, toggle, reset }
}
