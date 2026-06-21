import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{
      position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
      background:'none', border:'none', cursor:'pointer', color:'#6b7280',
      display:'flex', alignItems:'center', padding:'4px', borderRadius:'6px',
      transition:'color 0.2s',
    }}>
      <span style={{ display:'block', transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)', transform: show ? 'scale(1.2) rotate(12deg)' : 'scale(1) rotate(0deg)' }}>
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
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    return e
  }

  async function handleLogin(ev) {
    ev?.preventDefault()
    setServerError('')
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setLoading(true)
    const t = setTimeout(() => setSlowWarning(true), 5000)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user))
        navigate('/dashboard')
      } else setServerError(res.data.error || 'Login failed')
    } catch (err) { setServerError(err.response?.data?.error || 'Login failed. Please try again.') }
    clearTimeout(t); setSlowWarning(false); setLoading(false)
  }

  const isDark = theme === 'dark'

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: isDark ? '#0a0f0a' : '#f0f4f0', padding:'20px', position:'relative' }}>

      {/* Subtle bg texture */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'radial-gradient(circle at 20% 50%, rgba(22,101,52,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(22,101,52,0.08) 0%, transparent 40%)', pointerEvents:'none' }} />

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position:'fixed', top:'18px', right:'18px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius:'10px', padding:'7px 13px', cursor:'pointer', fontSize:'12px', fontWeight:600, color: isDark ? '#9ca3af' : '#374151', display:'flex', alignItems:'center', gap:'6px', zIndex:20 }}>
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ── CARD ── */}
      <div className="animate-in" style={{
        display:'flex', width:'100%', maxWidth:'860px',
        borderRadius:'24px', overflow:'hidden',
        boxShadow: isDark
          ? '0 32px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 32px 100px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      }}>

        {/* ── LEFT PANEL (green branding) ── */}
        <div style={{
          width:'42%', flexShrink:0,
          background:'linear-gradient(160deg, #166534 0%, #14532d 40%, #0d3d1e 100%)',
          padding:'44px 36px', display:'flex', flexDirection:'column',
          justifyContent:'space-between', position:'relative', overflow:'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-80px', left:'-40px', width:'260px', height:'260px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'50%', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(185,255,102,0.08)', pointerEvents:'none' }} />

          {/* Top: logo */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}>
              <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
                <polyline points="2,16 7,10 11,13 15,6 20,3" stroke="#b9ff66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
              </svg>
            </div>
            <div style={{ color:'#ffffff', fontSize:'13px', fontWeight:600, letterSpacing:'0.06em', opacity:0.7, marginBottom:'4px' }}>PSX PORTFOLIO</div>
          </div>

          {/* Middle: headline */}
          <div style={{ position:'relative', zIndex:1 }}>
            <h1 style={{ color:'#ffffff', fontSize:'32px', fontWeight:700, lineHeight:1.2, margin:'0 0 12px' }}>
              Welcome<br/>Back!
            </h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'13px', lineHeight:1.65, margin:'0 0 28px' }}>
              To stay connected with your investments, please login with your personal info.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                background:'transparent', border:'1.5px solid rgba(255,255,255,0.5)',
                borderRadius:'99px', color:'#ffffff', fontWeight:600,
                fontSize:'12px', padding:'10px 28px', cursor:'pointer',
                letterSpacing:'0.06em', textTransform:'uppercase',
                transition:'background 0.2s, border-color 0.2s',
                fontFamily:'inherit',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.borderColor='rgba(255,255,255,0.8)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'}}
            >
              Sign Up
            </button>
          </div>

          {/* Bottom */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', letterSpacing:'0.04em' }}>
              CREATOR <span style={{ color:'#b9ff66', fontWeight:700 }}>HAMZA BILAL</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (form) ── */}
        <div style={{
          flex:1, background: isDark ? '#111714' : '#ffffff',
          padding:'44px 44px', display:'flex', flexDirection:'column', justifyContent:'center',
        }}>
          <div style={{ marginBottom:'28px' }}>
            <h2 style={{ color: isDark ? '#ffffff' : '#111827', fontSize:'28px', fontWeight:700, margin:'0 0 6px', lineHeight:1.2 }}>welcome</h2>
            <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize:'13px', margin:0 }}>Login to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {serverError && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'10px 13px', color:'#ef4444', fontSize:'12px', display:'flex', gap:'8px' }}>
                <span>⚠</span>{serverError}
              </div>
            )}

            <div>
              <input type="email" value={email}
                onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:''}))}}
                placeholder="Email............"
                autoComplete="email"
                style={{
                  width:'100%', padding:'13px 16px', borderRadius:'12px', fontSize:'14px',
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f9f0',
                  border: errors.email ? '1.5px solid #ef4444' : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #d1fae5',
                  color: isDark ? '#ffffff' : '#111827',
                  outline:'none', boxSizing:'border-box', fontFamily:'inherit',
                  transition:'border-color 0.2s',
                }}
                onFocus={e=>{if(!errors.email)e.target.style.borderColor='#166534'}}
                onBlur={e=>{if(!errors.email)e.target.style.borderColor=isDark?'rgba(255,255,255,0.08)':'#d1fae5'}}
              />
              {errors.email && <p style={{ color:'#ef4444', fontSize:'11px', margin:'4px 0 0' }}>⚠ {errors.email}</p>}
            </div>

            <div>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={password}
                  onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:''}))}}
                  placeholder="Password............"
                  autoComplete="current-password"
                  style={{
                    width:'100%', padding:'13px 42px 13px 16px', borderRadius:'12px', fontSize:'14px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f9f0',
                    border: errors.password ? '1.5px solid #ef4444' : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #d1fae5',
                    color: isDark ? '#ffffff' : '#111827',
                    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={e=>{if(!errors.password)e.target.style.borderColor='#166534'}}
                  onBlur={e=>{if(!errors.password)e.target.style.borderColor=isDark?'rgba(255,255,255,0.08)':'#d1fae5'}}
                />
                <EyeToggle show={showPass} onToggle={()=>setShowPass(p=>!p)} />
              </div>
              {errors.password && <p style={{ color:'#ef4444', fontSize:'11px', margin:'4px 0 0' }}>⚠ {errors.password}</p>}
            </div>

            <div style={{ textAlign:'right', marginTop:'-4px' }}>
              <Link to="/forgot-password" style={{ color:'#16a34a', fontSize:'12px', textDecoration:'none', fontWeight:500 }}>
                Forgot your password?
              </Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', borderRadius:'12px', fontSize:'14px', fontWeight:700,
              background:'linear-gradient(135deg, #166534, #15803d)',
              color:'#ffffff', border:'none', cursor:'pointer', fontFamily:'inherit',
              letterSpacing:'0.04em', textTransform:'uppercase',
              transition:'opacity 0.2s, transform 0.15s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              opacity: loading ? 0.75 : 1,
            }}
              onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform='translateY(-1px)' }}}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)' }}
            >
              {loading
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Signing in...</>
                : 'Log In'
              }
            </button>

            {slowWarning && (
              <p style={{ textAlign:'center', color:'#f59e0b', fontSize:'11px', margin:0 }}>
                ⏳ Server waking up — please wait up to 60 seconds...
              </p>
            )}
          </form>

          <p style={{ textAlign:'center', color: isDark ? '#9ca3af' : '#6b7280', fontSize:'13px', marginTop:'20px', marginBottom:0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#16a34a', textDecoration:'none', fontWeight:700 }}>sign up</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  )
}

export default Login
