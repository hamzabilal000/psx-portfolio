import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

const Logo = () => (
  <div style={{
    width: '48px', height: '48px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #1a2f1a 0%, #0d1a0d 100%)',
    border: '1.5px solid rgba(185,255,102,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(185,255,102,0.2)',
  }}>
    <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
      <polyline points="2,16 7,10 11,13 15,6 20,3" stroke="#b9ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
    </svg>
  </div>
)

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{
      position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
      display: 'flex', alignItems: 'center', padding: '4px',
      borderRadius: '6px', transition: 'color 0.2s, background 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--lime)'; e.currentTarget.style.background = 'var(--lime-subtle)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ display: 'block', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s', transform: show ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)' }}>
        {show ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        )}
      </span>
    </button>
  )
}

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

  const bars = [35, 55, 42, 68, 52, 78, 62, 88, 70, 95, 82, 100]

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* ── Animated background ── */}
      {/* Floating orbs */}
      <div style={{ position:'absolute', top:'-10%', right:'-5%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.07) 0%, transparent 65%)', animation:'floatOrb 8s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-8%', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 65%)', animation:'floatOrb 11s ease-in-out 3s infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', left:'15%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 65%)', animation:'floatOrb 9s ease-in-out 1.5s infinite', pointerEvents:'none' }} />

      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.25, pointerEvents:'none' }} />

      {/* Animated chart line in background */}
      <svg style={{ position:'absolute', bottom:'8%', left:'0', width:'100%', opacity:0.06, pointerEvents:'none' }} height="120" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <polyline points="0,90 100,70 200,80 300,50 400,65 500,30 600,45 700,20 800,35 900,10 1000,25 1100,5 1200,15"
          fill="none" stroke="#b9ff66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="points" dur="6s" repeatCount="indefinite"
            values="0,90 100,70 200,80 300,50 400,65 500,30 600,45 700,20 800,35 900,10 1000,25 1100,5 1200,15;
                    0,80 100,60 200,90 300,40 400,75 500,20 600,55 700,10 800,45 900,20 1000,15 1100,15 1200,5;
                    0,90 100,70 200,80 300,50 400,65 500,30 600,45 700,20 800,35 900,10 1000,25 1100,5 1200,15"/>
        </polyline>
      </svg>

      {/* Floating particles */}
      {[
        {x:'12%',y:'20%',s:4,d:'0s'}, {x:'85%',y:'15%',s:3,d:'1s'}, {x:'70%',y:'75%',s:5,d:'2s'},
        {x:'25%',y:'80%',s:3,d:'0.5s'}, {x:'90%',y:'50%',s:4,d:'1.5s'}, {x:'5%',y:'55%',s:3,d:'3s'},
      ].map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:p.x, top:p.y,
          width:`${p.s}px`, height:`${p.s}px`, borderRadius:'50%',
          background:'var(--lime)', opacity:0.25,
          animation:`floatOrb ${6+i}s ease-in-out ${p.d} infinite`,
          pointerEvents:'none',
        }} />
      ))}

      {/* Theme toggle */}
      <button onClick={toggle} style={{
        position:'fixed', top:'20px', right:'20px',
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:'10px', padding:'8px 14px', cursor:'pointer',
        fontSize:'12px', fontWeight:600, color:'var(--muted)',
        display:'flex', alignItems:'center', gap:'6px', zIndex:10,
      }}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ── Center Card ── */}
      <div className="animate-in" style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1, padding:'0 20px' }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ display:'inline-flex', marginBottom:'14px' }}><Logo /></div>
          <h1 style={{ fontSize:'24px', fontWeight:700, color:'var(--white)', margin:'0 0 4px' }}>PSX Portfolio</h1>
          <p style={{ color:'var(--lime)', fontSize:'12px', fontWeight:600, margin:0 }}>AI Investment Advisor</p>
        </div>

        {/* Card */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'20px', padding:'28px 30px',
          boxShadow:'0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(185,255,102,0.05)',
        }}>
          <div style={{ marginBottom:'20px' }}>
            <div className="section-tag" style={{ marginBottom:'8px' }}>Sign In</div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'var(--white)', margin:'0 0 3px' }}>Welcome back</h2>
            <p style={{ color:'var(--muted)', fontSize:'13px', margin:0 }}>Enter your credentials to access your portfolio</p>
          </div>

          <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {serverError && <div className="alert-error fade-in" style={{ padding:'10px 14px', fontSize:'13px' }}><span>⚠</span> {serverError}</div>}

            <div>
              <label className="field-label">Email Address</label>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email:'' })) }}
                placeholder="you@example.com"
                className={`input-field${errors.email ? ' error' : ''}`}
                autoComplete="email"
                style={{ padding:'11px 14px' }}
              />
              {errors.email && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'4px' }}>⚠ {errors.email}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password:'' })) }}
                  placeholder="••••••••"
                  className={`input-field${errors.password ? ' error' : ''}`}
                  autoComplete="current-password"
                  style={{ paddingRight:'42px', padding:'11px 42px 11px 14px' }}
                />
                <EyeToggle show={showPass} onToggle={() => setShowPass(p => !p)} />
              </div>
              {errors.password && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'4px' }}>⚠ {errors.password}</p>}
            </div>

            <div style={{ textAlign:'right', marginTop:'-4px' }}>
              <Link to="/forgot-password" style={{ color:'var(--lime)', fontSize:'12px', textDecoration:'none', fontWeight:500 }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', padding:'12px', fontSize:'14px' }}>
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>

            {slowWarning && <p className="fade-in" style={{ textAlign:'center', color:'#f59e0b', fontSize:'12px', margin:0 }}>⏳ Server waking up — please wait up to 60 seconds...</p>}
          </form>

          <p style={{ textAlign:'center', color:'var(--muted)', marginTop:'18px', fontSize:'13px', marginBottom:0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--lime)', textDecoration:'none', fontWeight:600 }}>Create Account</Link>
          </p>
        </div>

        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'11px', marginTop:'14px', opacity:0.4 }}>
          🔒 Your data is encrypted and secure · Built by <span style={{ color:'var(--lime)', opacity:1 }}>Hamza Bilal</span>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Login
