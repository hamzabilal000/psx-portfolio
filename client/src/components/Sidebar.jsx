import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
axios.defaults.withCredentials = true

let navItems = [
  { path: '/dashboard',      icon: '📊', label: 'Dashboard' },
  { path: '/portfolio',      icon: '💼', label: 'Portfolio' },
  { path: '/recommendations',icon: '🤖', label: 'AI Picks' },
  { path: '/watchlist',      icon: '⭐', label: 'Watchlist' },
  { path: '/calculators',    icon: '🧮', label: 'Calculators' },
  { path: '/compare',        icon: '📈', label: 'Compare' },
  { path: '/risk-analyzer',  icon: '🛡️', label: 'Risk Analyzer' },
  { path: '/news',           icon: '📰', label: 'News' },
  { path: '/alerts',         icon: '🔔', label: 'Alerts' },
  { path: '/transactions',   icon: '📋', label: 'Transactions' },
  { path: '/profile',        icon: '👤', label: 'Profile' },
]

function Sidebar() {
  let navigate = useNavigate()
  let location = useLocation()

  async function handleLogout() {
    try {
      await axios.post("http://localhost:8080/auth/logout")
    } catch {}
    localStorage.removeItem('user')
    navigate('/')
  }

  let user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div style={{
      width: '220px', minHeight: '100vh', background: '#151924',
      borderRight: '1px solid #2d3347', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #2d3347' }}>
        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '18px' }}>📈 PSX Portfolio</div>
        <div style={{ color: '#64748b', fontSize: '12px', marginTop: 4 }}>AI Investment Advisor</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(item => {
          let active = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px', cursor: 'pointer', fontSize: '14px',
                color: active ? '#22c55e' : '#94a3b8',
                background: active ? '#1a2a1a' : 'transparent',
                borderLeft: active ? '3px solid #16a34a' : '3px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )
        })}
        {user.role === 'admin' && (
          <div
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', cursor: 'pointer', fontSize: '14px',
              color: location.pathname === '/admin' ? '#22c55e' : '#f59e0b',
              background: location.pathname === '/admin' ? '#1a2a1a' : 'transparent',
              borderLeft: location.pathname === '/admin' ? '3px solid #16a34a' : '3px solid transparent'
            }}
          >
            <span>🔧</span><span>Admin</span>
          </div>
        )}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #2d3347' }}>
        <div style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: 8 }}>{user.name || 'User'}</div>
        <div style={{ color: '#64748b', fontSize: '11px', marginBottom: 12 }}>{user.email || ''}</div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px', background: '#7f1d1d', color: '#fca5a5',
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
