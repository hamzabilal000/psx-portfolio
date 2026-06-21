import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { theme, toggle } = useTheme()

  async function handleSubmit(e) {
    e?.preventDefault()
    setError(''); setMsg(''); setEmailError('')

    if (!email.trim()) return setEmailError('Email is required')
    if (!/\S+@\S+\.\S+/.test(email)) return setEmailError('Enter a valid email address')

    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() })
      if (res.data.success === true) setMsg(res.data.data.message)
      else setError(res.data.error || 'Request failed')
    } catch {
      setError('Request failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',      overflow: 'hidden'
    }}>
      {/* ── Floating Theme Toggle ── */}
      <button
        onClick={toggle}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{
          position: 'fixed', top: '20px', right: '20px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 14px',
          cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px',
          zIndex: 999,
        }}
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'var(--lime)', marginBottom: '16px',
            fontSize: '24px', boxShadow: '0 8px 32px rgba(185,255,102,0.25)'
          }}>
            🔑
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '14px' }}>
            We'll send a reset link to your inbox
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '32px'
        }}>
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert-error" style={{ marginBottom: '18px' }}><span>⚠</span> {error}</div>}
            {msg   && <div className="alert-success" style={{ marginBottom: '18px' }}><span>✓</span> {msg}</div>}

            <div style={{ marginBottom: '24px' }}>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                placeholder="you@example.com"
                className={`input-field${emailError ? ' error' : ''}`}
                autoComplete="email"
              />
              {emailError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>⚠ {emailError}</p>}
            </div>

            <button type="submit" disabled={loading || !!msg} className="btn-primary" style={{ width: '100%', padding: '13px' }}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '24px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'var(--lime)', textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
