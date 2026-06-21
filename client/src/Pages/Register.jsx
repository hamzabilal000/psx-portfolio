import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

const Logo = () => (
  <div style={{
    width: '44px', height: '44px', borderRadius: '13px',
    background: 'linear-gradient(135deg, #1a2f1a 0%, #0d1a0d 100%)',
    border: '1.5px solid rgba(185,255,102,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 0 20px rgba(185,255,102,0.15)',
  }}>
    <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
      <polyline points="2,16 7,10 11,13 15,6 20,3"
        stroke="#b9ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
    </svg>
  </div>
)

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

function Register() {
  const [form, setForm]               = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess]         = useState('')
  const [loading, setLoading]         = useState(false)
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
    if (!form.name.trim()) errs.name = 'Full name is required'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!form.confirm) errs.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleRegister(e) {
    e?.preventDefault()
    setServerError('')
    setSuccess('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
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
        setSuccess('Account created! Redirecting to sign in...')
        setTimeout(() => navigate('/'), 2000)
      } else {
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

  const features = [
    { icon: '◈', label: 'Track 68 PSX stocks' },
    { icon: '✦', label: 'AI-powered recommendations' },
    { icon: '◬', label: 'Real-time risk analysis' },
    { icon: '⊟', label: 'Dividend & wealth calculators' },
  ]

  return (
    <div style={{ height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Left Panel ── */}
      <div style={{
        flex: 1, display: 'none',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(145deg, #0a1a0a 0%, #0d0d12 50%, #0a120a 100%)',
        borderRight: '1px solid rgba(185,255,102,0.1)',
        padding: '40px', position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">

        <div style={{ position:'absolute', top:'15%', right:'10%', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.07) 0%, transparent 70%)', animation:'floatOrb 8s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', left:'5%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 70%)', animation:'floatOrb 10s ease-in-out 3s infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(185,255,102,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(185,255,102,0.03) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:'360px', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'20px' }}>
            <Logo />
            <div style={{ textAlign:'left' }}>
              <div style={{ color:'var(--white)', fontWeight:700, fontSize:'16px' }}>PSX Portfolio</div>
              <div style={{ color:'var(--lime)', fontSize:'11px', fontWeight:600 }}>AI Investment Advisor</div>
            </div>
          </div>
          <h2 style={{ color:'var(--white)', fontSize:'22px', fontWeight:700, marginBottom:'10px', lineHeight:1.3 }}>
            Everything you need<br/>to invest smarter
          </h2>
          <p style={{ color:'var(--muted)', fontSize:'13px', lineHeight:1.7, marginBottom:'20px' }}>
            Join and get access to Pakistan's most comprehensive AI-powered stock portfolio platform.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
            {features.map((f, i) => (
              <div key={i} className={`stagger-${i+1}`} style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(185,255,102,0.04)', border:'1px solid rgba(185,255,102,0.1)', borderRadius:'10px', padding:'10px 14px', textAlign:'left' }}>
                <span style={{ color:'var(--lime)', fontSize:'14px', flexShrink:0 }}>{f.icon}</span>
                <span style={{ color:'var(--muted)', fontSize:'12px' }}>{f.label}</span>
              </div>
            ))}
          </div>

          <div style={{ color:'var(--muted)', fontSize:'11px', opacity:0.5 }}>
            Built by <span style={{ color:'var(--lime)', fontWeight:700, opacity:1 }}>Hamza Bilal</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        width:'100%', maxWidth:'460px', height:'100vh', overflowY:'auto',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'40px 44px', position:'relative', background:'var(--bg)',
        flexShrink: 0,
      }} className="auth-right-panel animate-in">

        <button onClick={toggle} style={{
          position:'fixed', top:'20px', right:'20px',
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'10px', padding:'8px 14px', cursor:'pointer',
          fontSize:'12px', fontWeight:600, color:'var(--muted)',
          display:'flex', alignItems:'center', gap:'6px', zIndex:10,
        }}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        <div style={{ marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
            <Logo />
            <div>
              <div style={{ color:'var(--white)', fontWeight:700, fontSize:'16px', lineHeight:1.2 }}>PSX Portfolio</div>
              <div style={{ color:'var(--lime)', fontSize:'11px', fontWeight:600 }}>AI Investment Advisor</div>
            </div>
          </div>
          <div className="section-tag" style={{ marginBottom:'10px' }}>Register</div>
          <h1 style={{ fontSize:'24px', fontWeight:700, color:'var(--white)', margin:'0 0 4px' }}>Create your account</h1>
          <p style={{ color:'var(--muted)', fontSize:'13px', margin:0 }}>Start your PSX investment journey today</p>
        </div>

        <form onSubmit={handleRegister} noValidate style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {serverError && <div className="alert-error fade-in"><span>⚠</span> {serverError}</div>}
          {success     && <div className="alert-success fade-in"><span>✓</span> {success}</div>}

          <div>
            <label className="field-label">Full Name</label>
            <input type="text" value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={`input-field${errors.name ? ' error' : ''}`}
              autoComplete="name"
            />
            {errors.name && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'12px', marginTop:'5px' }}>⚠ {errors.name}</p>}
          </div>

          <div>
            <label className="field-label">Email Address</label>
            <input type="email" value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              className={`input-field${errors.email ? ' error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'12px', marginTop:'5px' }}>⚠ {errors.email}</p>}
          </div>

          <div>
            <label className="field-label">Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="At least 8 characters"
                className={`input-field${errors.password ? ' error' : ''}`}
                autoComplete="new-password"
                style={{ paddingRight:'44px' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'var(--muted)',
                display:'flex', alignItems:'center', padding:0,
              }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
            {form.password.length > 0 && (
              <div style={{ marginTop:'7px' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'3px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:'3px', borderRadius:'99px', background: i <= strength ? strengthColors[strength] : 'var(--border)', transition:'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize:'11px', color: strengthColors[strength] || 'var(--muted)' }}>
                  {strengthLabels[strength]} password
                </p>
              </div>
            )}
            {errors.password && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'12px', marginTop:'4px' }}>⚠ {errors.password}</p>}
          </div>

          <div>
            <label className="field-label">Confirm Password</label>
            <div style={{ position:'relative' }}>
              <input type={showConfirm ? 'text' : 'password'} value={form.confirm}
                onChange={e => handleChange('confirm', e.target.value)}
                placeholder="••••••••"
                className={`input-field${errors.confirm ? ' error' : ''}`}
                autoComplete="new-password"
                style={{ paddingRight:'44px' }}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={{
                position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'var(--muted)',
                display:'flex', alignItems:'center', padding:0,
              }}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirm && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'12px', marginTop:'5px' }}>⚠ {errors.confirm}</p>}
          </div>

          <button type="submit" disabled={loading || !!success} className="btn-primary" style={{ width:'100%', padding:'13px', fontSize:'15px', marginTop:'4px' }}>
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation:'spin 0.8s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Creating Account...
              </>
            ) : 'Create Account →'}
          </button>

          {slowWarning && (
            <p className="fade-in" style={{ textAlign:'center', color:'#f59e0b', fontSize:'13px' }}>
              ⏳ Server is waking up — this may take up to 60 seconds. Please wait...
            </p>
          )}
        </form>

        <p style={{ textAlign:'center', color:'var(--muted)', marginTop:'20px', fontSize:'14px' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color:'var(--lime)', textDecoration:'none', fontWeight:600 }}>Sign In</Link>
        </p>
        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'12px', marginTop:'8px', opacity:0.4 }}>
          🔒 Your data is encrypted and secure
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 860px) {
          .auth-left-panel { display: flex !important; }
          .auth-right-panel { border-left: 1px solid var(--sidebar-border); }
        }
      `}</style>
    </div>
  )
}

export default Register
