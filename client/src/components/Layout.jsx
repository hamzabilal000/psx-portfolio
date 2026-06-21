import { useState } from 'react'
import Sidebar from './Sidebar'
import { useTheme } from '../context/ThemeContext'

function Layout({ children }) {
  const { theme, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`page-wrapper${sidebarOpen ? ' sidebar-open' : ''}`}>
      <Sidebar onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />

      {/* Top bar */}
      <div className="topbar" style={{
        position: 'fixed', top: 0, right: 0,
        height: '52px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px 0 20px',
        zIndex: 150,
        backdropFilter: 'blur(8px)',
      }}>
        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            display: 'none',
            alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            borderRadius: '8px', cursor: 'pointer', color: 'var(--white)',
            fontSize: '16px', flexShrink: 0,
          }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        <div style={{ flex: 1 }} />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
            color: 'var(--muted)', fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.color = 'var(--lime)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          <div style={{
            width: '30px', height: '17px', borderRadius: '99px',
            background: theme === 'dark' ? 'var(--border)' : 'var(--lime)',
            position: 'relative', flexShrink: 0, transition: 'background 0.3s',
          }}>
            <div style={{
              position: 'absolute', top: '2.5px',
              left: theme === 'dark' ? '3px' : '14px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: theme === 'dark' ? 'var(--muted)' : '#fff',
              transition: 'left 0.3s',
            }} />
          </div>
        </button>
      </div>

      <main className="page-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
