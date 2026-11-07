import type { RedFlag } from '../types/analysis'

export interface PostSegment {
  text: string
  flag?: Pick<RedFlag, 'id' | 'severity'>
  number?: number
}

/**
 * Splits the listing text into plain and highlighted segments, one mark per flag evidence phrase.
 * Marks are numbered in reading order; flags whose evidence isn't found verbatim get the next numbers,
 * so every flag in the list still has a number.
 */
export function highlightPost(text: string, flags: RedFlag[]) {
  const lower = text.toLowerCase()
  const found = flags
    .map((flag) => {
      const evidence = flag.evidence.trim()
      const start = evidence.length >= 3 ? lower.indexOf(evidence.toLowerCase()) : -1
      return { flag, start, end: start + evidence.length }
    })
    .filter((match) => match.start >= 0)
    .sort((left, right) => left.start - right.start || right.end - left.end)

  const marks: typeof found = []
  for (const match of found) {
    // Overlapping evidence (e.g. one phrase inside another) keeps the earlier/longer mark so marks never nest.
    if (marks.length === 0 || match.start >= marks[marks.length - 1].end) marks.push(match)
  }

  const numbers: Record<string, number> = {}
  marks.forEach((mark, index) => { numbers[mark.flag.id] = index + 1 })
  let next = marks.length + 1
  for (const flag of flags) if (!(flag.id in numbers)) numbers[flag.id] = next++

  const segments: PostSegment[] = []
  let cursor = 0
  for (const mark of marks) {
    if (mark.start > cursor) segments.push({ text: text.slice(cursor, mark.start) })
    segments.push({ text: text.slice(mark.start, mark.end), flag: { id: mark.flag.id, severity: mark.flag.severity }, number: numbers[mark.flag.id] })
    cursor = mark.end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })

  return { segments, numbers }
}
