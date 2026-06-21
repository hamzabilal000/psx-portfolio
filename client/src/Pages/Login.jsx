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

function Login() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
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
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    setSlowWarning(false)
    const wakeTimer = setTimeout(() => setSlowWarning(true), 5000)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.success === true) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user))
        navigate('/dashboard')
      } else {
        setServerError(res.data.error || 'Login failed')
      }
    } catch (e) {
      setServerError(e.response?.data?.error || 'Login failed. Please try again.')
    }
    clearTimeout(wakeTimer)
    setSlowWarning(false)
    setLoading(false)
  }

  const bars = [30, 50, 40, 70, 55, 85, 65, 90, 72, 95, 80, 100]

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

        <div style={{ position:'absolute', top:'10%', left:'10%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.07) 0%, transparent 70%)', animation:'floatOrb 7s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'5%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 70%)', animation:'floatOrb 9s ease-in-out 2s infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(185,255,102,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(185,255,102,0.03) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:'360px', width:'100%' }}>
          <div style={{ background:'rgba(185,255,102,0.04)', border:'1px solid rgba(185,255,102,0.12)', borderRadius:'20px', padding:'24px', marginBottom:'28px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:'5px', height:'70px', marginBottom:'14px', justifyContent:'center' }}>
              {bars.map((h, i) => (
                <div key={i} style={{
                  flex:1, maxWidth:'18px', height:`${h}%`,
                  background: i === bars.length-1 ? 'var(--lime)' : `rgba(185,255,102,${0.15 + i*0.06})`,
                  borderRadius:'4px 4px 0 0',
                  animation:`cardEnter 0.5s cubic-bezier(0.22,1,0.36,1) ${i*60}ms both`,
                }} />
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'var(--muted)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.08em' }}>Portfolio Value</div>
                <div style={{ color:'var(--lime)', fontSize:'20px', fontWeight:700, marginTop:'2px' }}>PKR 2.4M</div>
              </div>
              <div style={{ background:'rgba(185,255,102,0.12)', border:'1px solid rgba(185,255,102,0.2)', borderRadius:'8px', padding:'6px 10px' }}>
                <div style={{ color:'var(--lime)', fontSize:'12px', fontWeight:700 }}>+18.4%</div>
                <div style={{ color:'var(--muted)', fontSize:'10px' }}>This year</div>
              </div>
            </div>
          </div>

          <h2 style={{ color:'var(--white)', fontSize:'22px', fontWeight:700, marginBottom:'10px', lineHeight:1.3 }}>
            Smart investing<br/>starts here
          </h2>
          <p style={{ color:'var(--muted)', fontSize:'13px', lineHeight:1.7, marginBottom:'20px' }}>
            AI-powered insights across 68 PSX stocks.<br/>Track, analyze, and grow your portfolio.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
            {['18 comprehensive modules', 'Groq AI chat assistant', 'Real-time risk analysis'].map((f, i) => (
              <div key={i} className={`stagger-${i+1}`} style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(185,255,102,0.04)', border:'1px solid rgba(185,255,102,0.1)', borderRadius:'10px', padding:'9px 14px' }}>
                <span style={{ color:'var(--lime)', fontSize:'13px' }}>✓</span>
                <span style={{ color:'var(--muted)', fontSize:'12px' }}>{f}</span>
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

        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
            <Logo />
            <div>
              <div style={{ color:'var(--white)', fontWeight:700, fontSize:'16px', lineHeight:1.2 }}>PSX Portfolio</div>
              <div style={{ color:'var(--lime)', fontSize:'11px', fontWeight:600 }}>AI Investment Advisor</div>
            </div>
          </div>
          <div className="section-tag" style={{ marginBottom:'12px' }}>Sign In</div>
          <h1 style={{ fontSize:'26px', fontWeight:700, color:'var(--white)', margin:'0 0 6px' }}>Welcome back</h1>
          <p style={{ color:'var(--muted)', fontSize:'14px', margin:0 }}>Enter your credentials to access your portfolio</p>
        </div>

        <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {serverError && <div className="alert-error fade-in"><span>⚠</span> {serverError}</div>}

          <div>
            <label className="field-label">Email Address</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email:'' })) }}
              placeholder="you@example.com"
              className={`input-field${errors.email ? ' error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'12px', marginTop:'6px' }}>⚠ {errors.email}</p>}
          </div>

          <div>
            <label className="field-label">Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password:'' })) }}
                placeholder="••••••••"
                className={`input-field${errors.password ? ' error' : ''}`}
                autoComplete="current-password"
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
            {errors.password && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'12px', marginTop:'6px' }}>⚠ {errors.password}</p>}
          </div>

          <div style={{ textAlign:'right', marginTop:'-4px' }}>
            <Link to="/forgot-password" style={{ color:'var(--lime)', fontSize:'13px', textDecoration:'none', fontWeight:500 }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:'15px' }}>
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation:'spin 0.8s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>

          {slowWarning && (
            <p className="fade-in" style={{ textAlign:'center', color:'#f59e0b', fontSize:'13px' }}>
              ⏳ Server is waking up — this may take up to 60 seconds. Please wait...
            </p>
          )}
        </form>

        <p style={{ textAlign:'center', color:'var(--muted)', marginTop:'24px', fontSize:'14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--lime)', textDecoration:'none', fontWeight:600 }}>Create Account</Link>
        </p>
        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'12px', marginTop:'10px', opacity:0.4 }}>
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

export default Login
