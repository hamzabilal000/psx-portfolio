import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
axios.defaults.withCredentials = true

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  function validate() {
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    return errs
  }

  async function handleLogin(e) {
    e?.preventDefault()
    setServerError('')

    // ── All-or-Nothing: validate everything first ──
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { email, password })
      if (res.data.success === true) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user))
        navigate('/dashboard')
      } else {
        setServerError(res.data.error || 'Login failed')
      }
    } catch (e) {
      setServerError(e.response?.data?.error || 'Login failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
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

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(185,255,102,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(185,255,102,0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }} className="animate-in">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'var(--lime)', marginBottom: '20px',
            fontSize: '28px', boxShadow: '0 8px 32px rgba(185,255,102,0.3)'
          }}>
            📈
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            PSX Portfolio
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '14px' }}>
            AI-Powered Investment Advisor
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '36px',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <div className="section-tag">Sign In</div>
            <h2 style={{ fontSize: '22px', marginTop: '10px', color: 'var(--white)' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              Enter your credentials to access your portfolio
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>
            {/* Server Error */}
            {serverError && (
              <div className="alert-error" style={{ marginBottom: '20px' }}>
                <span>⚠</span> {serverError}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                placeholder="you@example.com"
                className={`input-field${errors.email ? ' error' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>
                  ⚠ {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '12px' }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                placeholder="••••••••"
                className={`input-field${errors.password ? ' error' : ''}`}
                autoComplete="current-password"
              />
              {errors.password && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>
                  ⚠ {errors.password}
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{
                color: 'var(--lime)', fontSize: '13px', textDecoration: 'none', fontWeight: 500
              }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '24px', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--lime)', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: '#333', fontSize: '12px', marginTop: '24px' }}>
          🔒 Your data is encrypted and secure
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default Login
