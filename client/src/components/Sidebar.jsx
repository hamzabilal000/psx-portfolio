import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

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

function Sidebar({ onClose }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { theme, toggle } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  async function handleLogout() {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('user')
    navigate('/')
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  function handleNav(path) {
    navigate(path)
    onClose?.()
  }

  return (
    <div className="sidebar" style={{
      width: '240px',
      height: '100vh',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 200,
      overflow: 'hidden',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Custom SVG logo */}
          <div className="logo-pulse" style={{
            width: '38px', height: '38px', borderRadius: '11px',
            background: 'linear-gradient(135deg, #1a2f1a 0%, #0d1a0d 100%)',
            border: '1px solid rgba(185,255,102,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="2,16 7,10 11,13 15,6 20,3"
                stroke="#b9ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
              <polyline points="2,19 7,19 7,10" stroke="rgba(185,255,102,0.25)" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>
              PSX Portfolio
            </div>
            <div style={{ color: 'var(--lime)', fontSize: '10px', marginTop: '2px', fontWeight: 600, letterSpacing: '0.04em' }}>
              AI Investment Advisor
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 }}>
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
                onClick={() => handleNav(item.path)}
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
                onClick={() => handleNav('/admin')}
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
        flexShrink: 0,
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
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
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

        {/* Made by */}
        <div style={{
          marginTop: '12px', textAlign: 'center',
          fontSize: '10px', color: 'var(--muted)', opacity: 0.5,
          letterSpacing: '0.04em',
        }}>
          Built by{' '}
          <a href="https://hamzabilal-dev.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lime)', fontWeight: 700, opacity: 1, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            Hamza Bilal
          </a>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
