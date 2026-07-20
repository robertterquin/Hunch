import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AnalyzePage } from '../pages/AnalyzePage'

const supportingPages = () => import('../pages/SupportingPages')
const pages = {
  AuthPage: lazy(async () => ({ default: (await supportingPages()).AuthPage })),
  ComparePage: lazy(async () => ({ default: (await supportingPages()).ComparePage })),
  GuidePage: lazy(async () => ({ default: (await supportingPages()).GuidePage })),
  ChecklistPage: lazy(async () => ({ default: (await supportingPages()).ChecklistPage })),
  SavedAnalysisPage: lazy(async () => ({ default: (await supportingPages()).SavedAnalysisPage })),
  SavedPage: lazy(async () => ({ default: (await supportingPages()).SavedPage })),
  SettingsPage: lazy(async () => ({ default: (await supportingPages()).SettingsPage })),
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/analyze" replace /> },
      { path: 'analyze', element: <AnalyzePage /> },
      { path: 'saved', element: <pages.SavedPage /> },
      { path: 'saved/:analysisId', element: <pages.SavedAnalysisPage /> },
      { path: 'compare', element: <pages.ComparePage /> },
      { path: 'guide', element: <pages.GuidePage /> },
      { path: 'guide/:patternId', element: <pages.GuidePage /> },
      { path: 'checklist', element: <pages.ChecklistPage /> },
      { path: 'settings', element: <pages.SettingsPage /> },
      { path: 'auth/:mode', element: <pages.AuthPage /> },
    ],
  },
])
