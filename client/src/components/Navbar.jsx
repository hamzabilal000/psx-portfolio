import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
axios.defaults.withCredentials = true

const navItems = [
  { path: '/dashboard',       label: 'Dashboard' },
  { path: '/portfolio',       label: 'Portfolio' },
  { path: '/recommendations', label: 'AI Picks' },
  { path: '/watchlist',       label: 'Watchlist' },
  { path: '/calculators',     label: 'Calculators' },
  { path: '/compare',         label: 'Compare' },
  { path: '/risk-analyzer',   label: 'Risk' },
  { path: '/news',            label: 'News' },
  { path: '/alerts',          label: 'Alerts' },
  { path: '/transactions',    label: 'Transactions' },
  { path: '/profile',         label: 'Profile' },
]

function Navbar() {
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
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '58px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      zIndex: 200,
      gap: '4px',
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', marginRight: '16px', flexShrink: 0
        }}
      >
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'var(--lime)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px',
        }}>📈</div>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--white)', whiteSpace: 'nowrap' }}>
          PSX Portfolio
        </span>
      </div>

      {/* Nav Links — scrollable row */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        overflowX: 'auto', flex: 1,
        scrollbarWidth: 'none',
      }}>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '6px 12px',
                background: active ? 'var(--lime-subtle)' : 'transparent',
                border: `1px solid ${active ? 'var(--lime)' : 'transparent'}`,
                borderRadius: '8px',
                color: active ? 'var(--lime)' : 'var(--muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--white)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--muted)'
                }
              }}
            >
              {item.label}
            </button>
          )
        })}

        {/* Admin */}
        {user.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '6px 12px',
              background: location.pathname === '/admin' ? 'rgba(245,158,11,0.1)' : 'transparent',
              border: `1px solid ${location.pathname === '/admin' ? '#f59e0b' : 'transparent'}`,
              borderRadius: '8px',
              color: '#f59e0b',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              fontFamily: 'inherit', whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            ⚙ Admin
          </button>
        )}
      </nav>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '8px' }}>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px', fontWeight: 600,
            color: 'var(--muted)',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.color = 'var(--lime)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>

          {/* Mini pill */}
          <div style={{
            width: '30px', height: '16px', borderRadius: '99px',
            background: theme === 'dark' ? 'var(--border)' : 'var(--lime)',
            position: 'relative', transition: 'background 0.3s',
          }}>
            <div style={{
              position: 'absolute', top: '2px',
              left: theme === 'dark' ? '2px' : '14px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: theme === 'dark' ? 'var(--muted)' : '#fff',
              transition: 'left 0.3s',
            }} />
          </div>
        </button>

        {/* User avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-hover)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '5px 10px',
          cursor: 'default',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px',
            background: 'var(--lime-subtle)',
            border: '1px solid var(--lime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--lime)', fontWeight: 700, fontSize: '10px',
          }}>
            {initials}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--white)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name?.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--muted)',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            fontFamily: 'inherit',
            transition: 'all 0.2s',
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
          ↩ Out
        </button>
      </div>
    </header>
  )
}

export default Navbar
