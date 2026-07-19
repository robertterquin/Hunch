import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AnalyzePage } from '../pages/AnalyzePage'
import { AuthPage, ComparePage, GuidePage, ChecklistPage, SavedAnalysisPage, SavedPage, SettingsPage } from '../pages/SupportingPages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/analyze" replace /> },
      { path: 'analyze', element: <AnalyzePage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'saved/:analysisId', element: <SavedAnalysisPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'guide', element: <GuidePage /> },
      { path: 'guide/:patternId', element: <GuidePage /> },
      { path: 'checklist', element: <ChecklistPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'auth/:mode', element: <AuthPage /> },
    ],
  },
])
