import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) {
      errs.name = 'Full name is required'
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid email address'
    }
    if (!form.password) {
      errs.password = 'Password is required'
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/.test(form.password)) {
      // just a soft hint, not blocking
    }
    if (!form.confirm) {
      errs.confirm = 'Please confirm your password'
    } else if (form.confirm !== form.password) {
      errs.confirm = 'Passwords do not match'
    }
    return errs
  }

  async function handleRegister(e) {
    e?.preventDefault()
    setServerError('')
    setSuccess('')

    // ── All-or-Nothing: validate ALL fields before any API call ──
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    setLoading(true)
    setSlowWarning(false)
    const wakeTimer = setTimeout(() => setSlowWarning(true), 5000)
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      if (res.data.success === true) {
        setSuccess('Account created! You can now sign in.')
        setTimeout(() => navigate('/'), 2000)
      } else {
        // Don't store ANYTHING — server rejected
        const msg = res.data.error || 'Registration failed'
        if (res.data.code === 11000 || msg.toLowerCase().includes('already')) {
          setErrors({ email: 'This email is already registered' })
        } else {
          setServerError(msg)
        }
      }
    } catch (e) {
      setServerError(e.response?.data?.error || 'Registration failed. Please try again.')
    }
    clearTimeout(wakeTimer)
    setSlowWarning(false)
    setLoading(false)
  }

  const strengthLevel = () => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strength = strengthLevel()
  const strengthColors = ['', '#ff4d4d', '#f59e0b', '#60a5fa', '#b9ff66']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

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
        position: 'absolute', top: '-15%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(185,255,102,0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }} className="animate-in">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'var(--lime)', marginBottom: '20px',
            fontSize: '28px', boxShadow: '0 8px 32px rgba(185,255,102,0.3)'
          }}>
            📈
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '14px' }}>
            Start your investment journey on PSX
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
            <div className="section-tag">Register</div>
            <h2 style={{ fontSize: '22px', marginTop: '10px', color: 'var(--white)' }}>
              New Account
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              All fields are required to create your account
            </p>
          </div>

          <form onSubmit={handleRegister} noValidate>

            {/* Server Error */}
            {serverError && (
              <div className="alert-error" style={{ marginBottom: '20px' }}>
                <span>⚠</span> {serverError}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="alert-success" style={{ marginBottom: '20px' }}>
                <span>✓</span> {success}
              </div>
            )}

            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={`input-field${errors.name ? ' error' : ''}`}
                autoComplete="name"
              />
              {errors.name && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className={`input-field${errors.email ? ' error' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '8px' }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="At least 8 characters"
                className={`input-field${errors.password ? ' error' : ''}`}
                autoComplete="new-password"
              />
              {/* Strength Meter */}
              {form.password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '99px',
                        background: i <= strength ? strengthColors[strength] : '#222',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: strengthColors[strength] || 'var(--muted)' }}>
                    {strengthLabels[strength] || ''} password
                  </p>
                </div>
              )}
              {errors.password && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>⚠ {errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '28px' }}>
              <label className="field-label">Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => handleChange('confirm', e.target.value)}
                placeholder="••••••••"
                className={`input-field${errors.confirm ? ' error' : ''}`}
                autoComplete="new-password"
              />
              {errors.confirm && (
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.confirm}</p>
              )}
            </div>

            <button type="submit" disabled={loading || !!success} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account →'}
            </button>
          </form>

          {slowWarning && (
            <p style={{ textAlign: 'center', color: '#f59e0b', marginTop: '12px', fontSize: '13px' }}>
              ⏳ Server is waking up from sleep — this may take up to 60 seconds. Please wait...
            </p>
          )}

          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '24px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: 'var(--lime)', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>

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

export default Register
