import Sidebar from './Sidebar'
import { useTheme } from '../context/ThemeContext'

function Layout({ children }) {
  const { theme, toggle } = useTheme()

  return (
    <div className="page-wrapper">
      <Sidebar />

      {/* Top bar — fixed, starts after sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, left: '240px', right: 0,
        height: '52px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        zIndex: 150,
        backdropFilter: 'blur(8px)',
      }}>
        <button
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
            color: 'var(--muted)',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--lime)'
            e.currentTarget.style.color = 'var(--lime)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          <div style={{
            width: '30px', height: '17px', borderRadius: '99px',
            background: theme === 'dark' ? 'var(--border)' : 'var(--lime)',
            position: 'relative', flexShrink: 0,
            transition: 'background 0.3s',
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
