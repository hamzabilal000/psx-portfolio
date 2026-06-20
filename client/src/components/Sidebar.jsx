import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
axios.defaults.withCredentials = true

const navItems = [
  { path: '/dashboard',       icon: '⊞',  label: 'Dashboard' },
  { path: '/portfolio',       icon: '◈',  label: 'Portfolio' },
  { path: '/recommendations', icon: '✦',  label: 'AI Picks' },
  { path: '/watchlist',       icon: '◉',  label: 'Watchlist' },
  { path: '/calculators',     icon: '⊟',  label: 'Calculators' },
  { path: '/compare',         icon: '⇄',  label: 'Compare' },
  { path: '/risk-analyzer',   icon: '◬',  label: 'Risk Analyzer' },
  { path: '/news',            icon: '⊙',  label: 'News' },
  { path: '/alerts',          icon: '◎',  label: 'Alerts' },
  { path: '/transactions',    icon: '⊕',  label: 'Transactions' },
  { path: '/profile',         icon: '◯',  label: 'Profile' },
]

function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { theme, toggle } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  async function handleLogout() {
    try { await axios.post('http://localhost:8080/auth/logout') } catch {}
    localStorage.removeItem('user')
    navigate('/')
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--lime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0
          }}>
            📈
          </div>
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>
              PSX Portfolio
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>
              AI Investment Advisor
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 8px' }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '0 8px', marginBottom: '8px', marginTop: '4px', opacity: 0.6
          }}>
            Navigation
          </p>

          {navItems.map((item, idx) => {
            const active = location.pathname === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={active ? 'nav-item nav-item--active' : 'nav-item'}
                style={{
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <span className="nav-item__icon">{item.icon}</span>
                <span className="nav-item__label">{item.label}</span>
                {active && <span className="nav-item__dot" />}
              </div>
            )
          })}

          {/* Admin */}
          {user.role === 'admin' && (
            <>
              <p style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '0 8px', margin: '16px 0 8px', opacity: 0.6
              }}>
                Admin
              </p>
              <div
                onClick={() => navigate('/admin')}
                className={location.pathname === '/admin' ? 'nav-item nav-item--active' : 'nav-item'}
                style={{ animationDelay: `${(navItems.length + 1) * 40}ms`, color: location.pathname !== '/admin' ? 'var(--warn)' : undefined }}
              >
                <span className="nav-item__icon">⚙</span>
                <span className="nav-item__label">Admin Panel</span>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── Theme Toggle ── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--sidebar-border)',
      }}>
        <div
          onClick={toggle}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          {/* Toggle pill */}
          <div className="theme-toggle">
            <div className="theme-toggle-knob" />
          </div>
        </div>
      </div>

      {/* ── User + Logout ── */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'var(--lime-subtle)',
            border: '1px solid var(--lime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--lime)', fontWeight: 700, fontSize: '13px', flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              color: 'var(--white)', fontSize: '13px', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {user.name || 'User'}
            </div>
            <div style={{
              color: 'var(--muted)', fontSize: '11px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {user.email || ''}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '9px',
            background: 'transparent',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600,
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--danger-bg)'
            e.currentTarget.style.color = 'var(--danger)'
            e.currentTarget.style.borderColor = 'var(--danger)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--muted)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          ↩ Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
