import { z } from 'zod'
import type { RiskCategory } from '../types/analysis.js'

const riskCategories = [
  'payment-request',
  'suspicious-email',
  'vague-company',
  'vague-role',
  'unrealistic-compensation',
  'urgency-pressure',
  'chat-only-hiring',
  'sensitive-information',
] as const satisfies readonly RiskCategory[]

export const ApiRuleFindingSchema = z.object({
  ruleId: z.string().min(1).max(80),
  category: z.enum(riskCategories),
  title: z.string().min(1).max(160),
  severity: z.enum(['medium', 'high']),
  scoreImpact: z.number().int().min(0).max(100),
  evidence: z.string().min(1).max(500),
  confidence: z.enum(['low', 'medium', 'high']),
  explanation: z.string().max(600),
  nextAction: z.string().max(400),
}).strict()

export const AnalyzeRequestSchema = z.object({
  listingText: z.string().trim().min(40).max(12000),
  ruleFindings: z.array(ApiRuleFindingSchema).max(8),
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(['low-risk', 'caution', 'high-risk']),
  missingInformation: z.array(z.string().min(1).max(240)).max(20),
}).strict()

export const OpenAIExplanationSchema = z.object({
  summary: z.string().min(1).max(600),
  redFlagExplanations: z.array(z.object({
    ruleId: z.string().min(1).max(80),
    explanation: z.string().min(1).max(600),
    confidence: z.enum(['low', 'medium', 'high']),
  }).strict()).max(8),
  missingInformation: z.array(z.string().min(1).max(240)).max(20),
  uncertainty: z.array(z.string().min(1).max(300)).max(8),
  checklist: z.array(z.object({
    label: z.string().min(1).max(240),
    reason: z.string().min(1).max(400),
    relatedCategory: z.enum(riskCategories).nullable(),
    priority: z.enum(['low', 'medium', 'high']),
  }).strict()).max(10),
  studentAdvice: z.string().min(1).max(600),
}).strict()

export type OpenAIExplanation = z.infer<typeof OpenAIExplanationSchema>
