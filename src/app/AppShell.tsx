import { BookOpen, CheckSquare, FileSearch, Plus, Settings, ShieldCheck } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppState } from './stateContext'

const navigation = [
  { label: 'Analyze', to: '/analyze', icon: FileSearch },
  { label: 'Saved', to: '/saved', icon: ShieldCheck },
  { label: 'Scam Guide', to: '/guide', icon: BookOpen },
  { label: 'Checklist', to: '/checklist', icon: CheckSquare },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function AppShell() {
  const { user, isAuthLoading } = useAppState()
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/analyze" aria-label="Hunch Analyze">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>
            <strong>Hunch</strong>
            <small>Your second opinion before applying.</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <Link className="button button-primary button-compact" to="/analyze">
            <Plus size={16} aria-hidden="true" />
            New analysis
          </Link>
          <Link className="account-link" to={user ? '/settings' : '/auth/sign-in'}>{isAuthLoading ? 'Checking...' : user?.email?.split('@')[0] ?? 'Sign in'}</Link>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
