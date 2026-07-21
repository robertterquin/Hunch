import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AnalyzePage } from '../pages/AnalyzePage'

const pages = {
  AuthPage: lazy(() => import('../pages/AuthPage').then((module) => ({ default: module.AuthPage }))),
  ComparePage: lazy(() => import('../pages/ComparePage').then((module) => ({ default: module.ComparePage }))),
  GuidePage: lazy(() => import('../pages/GuidePage').then((module) => ({ default: module.GuidePage }))),
  ChecklistPage: lazy(() => import('../pages/ChecklistPage').then((module) => ({ default: module.ChecklistPage }))),
  SavedAnalysisPage: lazy(() => import('../pages/SavedAnalysisPage').then((module) => ({ default: module.SavedAnalysisPage }))),
  SavedPage: lazy(() => import('../pages/SavedPage').then((module) => ({ default: module.SavedPage }))),
  SettingsPage: lazy(() => import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage }))),
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
