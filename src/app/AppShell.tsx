import { Icon } from '@iconify/react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from './stateContext'
import hunchLogo from '../assets/hunch-logo.svg'

const navigation = [
  { label: 'Analyze', to: '/analyze', icon: 'mdi:file-search-outline' },
  { label: 'Saved', to: '/saved', icon: 'mdi:shield-check-outline' },
  { label: 'Scam Guide', to: '/guide', icon: 'mdi:book-open-page-variant-outline' },
  { label: 'Checklist', to: '/checklist', icon: 'mdi:checkbox-marked-outline' },
  { label: 'Settings', to: '/settings', icon: 'mdi:cog-outline' },
]

export function AppShell() {
  const { user, isAuthLoading } = useAppState()
  const location = useLocation()

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <Link className="brand" to="/analyze" aria-label="Hunch Analyze">
          <img className="brand-logo" src={hunchLogo} alt="Hunch" />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(({ label, to, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon"><Icon icon={icon} width="16" height="16" aria-hidden="true" /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <Link className="account-link" to={user ? '/settings' : '/auth/sign-in'}>{isAuthLoading ? 'Checking...' : user?.email?.split('@')[0] ?? 'Sign in'}</Link>
        </div>
      </header>

      <main className="app-main" id="main-content" tabIndex={-1}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="route-frame"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">Loading this page...</div>}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon icon={icon} width="18" height="18" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      </div>
    </MotionConfig>
  )
}
