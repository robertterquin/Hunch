import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AnalysisReport, ChecklistItem, RedFlag } from '../types/analysis'

interface AnalysisRow {
  id: string
  user_id: string
  listing_title: string
  source_type: AnalysisReport['sourceType']
  original_text: string
  risk_score: number
  risk_level: AnalysisReport['riskLevel']
  result_state: AnalysisReport['resultState']
  confidence: AnalysisReport['confidence']
  summary: string
  uncertainty: string
  missing_information: string[]
  analysis_version: string
  created_at: string
  red_flags?: RedFlagRow[]
  checklist_items?: ChecklistRow[]
}

interface RedFlagRow {
  id: string
  category: RedFlag['category']
  title: string
  severity: RedFlag['severity']
  explanation: string
  evidence: string
  score_impact: number
  confidence: RedFlag['confidence']
  next_action: string
}

interface ChecklistRow {
  id: string
  label: string
  reason: string
  completed: boolean
  related_category: ChecklistItem['relatedCategory']
  position: number
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  return supabase
}

function mapReport(row: AnalysisRow): AnalysisReport {
  return {
    id: row.id,
    fixtureId: `saved-${row.id}`,
    listingTitle: row.listing_title,
    sourceType: row.source_type,
    originalText: row.original_text,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    resultState: row.result_state,
    confidence: row.confidence,
    summary: row.summary,
    uncertainty: row.uncertainty,
    flags: (row.red_flags ?? []).map((flag) => ({
      id: flag.id,
      category: flag.category,
      title: flag.title,
      severity: flag.severity,
      explanation: flag.explanation,
      evidence: flag.evidence,
      scoreImpact: flag.score_impact,
      confidence: flag.confidence,
      nextAction: flag.next_action,
    })),
    missingInformation: row.missing_information ?? [],
    checklist: (row.checklist_items ?? []).sort((a, b) => a.position - b.position).map((item) => ({
      id: item.id,
      label: item.label,
      reason: item.reason,
      completed: item.completed,
      relatedCategory: item.related_category,
    })),
    analysisVersion: row.analysis_version,
    createdAt: row.created_at,
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const client = requireClient()
  const { data, error } = await client.auth.getUser()
  if (error && error.name !== 'AuthSessionMissingError') throw error
  return data.user
}

export function subscribeToAuthChanges(onUser: (user: User | null) => void) {
  if (!supabase) return () => undefined
  const { data } = supabase.auth.onAuthStateChange((_event, session) => onUser(session?.user ?? null))
  return () => data.subscription.unsubscribe()
}

export async function sendMagicLink(email: string) {
  const client = requireClient()
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/sign-in' } })
  if (error) throw error
}

export async function sendPasswordReset(email: string) {
  const client = requireClient()
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth/reset' })
  if (error) throw error
}

export async function signOut() {
  const client = requireClient()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function fetchSavedReports(userId: string): Promise<AnalysisReport[]> {
  const client = requireClient()
  const { data, error } = await client.from('analyses').select('*, red_flags(*), checklist_items(*)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return (data as AnalysisRow[]).map(mapReport)
}

export async function saveAnalysisReport(report: AnalysisReport, userId: string): Promise<AnalysisReport> {
  const client = requireClient()
  const { data: analysis, error: analysisError } = await client.from('analyses').insert({
    user_id: userId,
    listing_title: report.listingTitle ?? 'Saved Hunch report',
    source_type: report.sourceType,
    original_text: report.originalText,
    risk_score: report.riskScore,
    risk_level: report.riskLevel,
    result_state: report.resultState,
    confidence: report.confidence,
    summary: report.summary,
    uncertainty: report.uncertainty,
    missing_information: report.missingInformation,
    analysis_version: report.analysisVersion,
  }).select().single()
  if (analysisError) throw analysisError

  const { error: flagsError } = await client.from('red_flags').insert(report.flags.map((flag) => ({
    analysis_id: analysis.id,
    category: flag.category,
    title: flag.title,
    severity: flag.severity,
    explanation: flag.explanation,
    evidence: flag.evidence,
    score_impact: flag.scoreImpact,
    confidence: flag.confidence,
    next_action: flag.nextAction,
  })))
  if (flagsError) {
    await client.from('analyses').delete().eq('id', analysis.id)
    throw flagsError
  }

  const { error: checklistError } = await client.from('checklist_items').insert(report.checklist.map((item, position) => ({
    analysis_id: analysis.id,
    label: item.label,
    reason: item.reason,
    completed: item.completed,
    related_category: item.relatedCategory ?? null,
    position,
  })))
  if (checklistError) {
    await client.from('analyses').delete().eq('id', analysis.id)
    throw checklistError
  }

  const saved = await fetchSavedReports(userId)
  const persisted = saved.find((item) => item.id === analysis.id)
  if (!persisted) throw new Error('The report was saved but could not be reloaded.')
  return persisted
}

export async function deleteSavedReport(analysisId: string, userId: string) {
  const client = requireClient()
  const { error } = await client.from('analyses').delete().eq('id', analysisId).eq('user_id', userId)
  if (error) throw error
}

export async function deleteAllSavedReports(userId: string) {
  const client = requireClient()
  const { error } = await client.from('analyses').delete().eq('user_id', userId)
  if (error) throw error
}

export async function updateSavedChecklistItem(checklistId: string, completed: boolean) {
  const client = requireClient()
  const { error } = await client.from('checklist_items').update({ completed }).eq('id', checklistId)
  if (error) throw error
}
