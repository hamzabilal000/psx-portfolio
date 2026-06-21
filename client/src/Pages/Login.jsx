import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useTheme } from '../context/ThemeContext'

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{
      position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
      background:'none', border:'none', cursor:'pointer', color:'var(--muted)',
      display:'flex', alignItems:'center', padding:'4px', borderRadius:'6px',
      transition:'color 0.2s, background 0.2s',
    }}
      onMouseEnter={e=>{e.currentTarget.style.color='var(--lime)';e.currentTarget.style.background='rgba(185,255,102,0.08)'}}
      onMouseLeave={e=>{e.currentTarget.style.color='var(--muted)';e.currentTarget.style.background='transparent'}}
    >
      <span style={{ display:'block', transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)', transform: show ? 'scale(1.25) rotate(12deg)' : 'scale(1) rotate(0deg)' }}>
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const bars = [30, 52, 38, 65, 50, 80, 60, 92, 70, 100, 82, 95]

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      {/* ── Background layer ── */}
      <div style={{ position:'absolute', top:'-15%', right:'-8%', width:'550px', height:'550px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.08) 0%, transparent 65%)', animation:'floatOrb 9s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-8%', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 65%)', animation:'floatOrb 12s ease-in-out 3s infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'35%', left:'18%', width:'220px', height:'220px', borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)', animation:'floatOrb 8s ease-in-out 1.5s infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.22, pointerEvents:'none' }} />
      <svg style={{ position:'absolute', bottom:'6%', left:0, width:'100%', opacity:0.07, pointerEvents:'none' }} height="100" viewBox="0 0 1400 100" preserveAspectRatio="none">
        <polyline points="0,80 120,60 280,72 420,42 560,58 700,25 840,40 980,15 1120,30 1260,8 1400,18" fill="none" stroke="#b9ff66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="points" dur="6s" repeatCount="indefinite"
            values="0,80 120,60 280,72 420,42 560,58 700,25 840,40 980,15 1120,30 1260,8 1400,18;0,70 120,50 280,82 420,32 560,68 700,15 840,50 980,25 1120,20 1260,18 1400,8;0,80 120,60 280,72 420,42 560,58 700,25 840,40 980,15 1120,30 1260,8 1400,18"/>
        </polyline>
      </svg>
      {[{x:'10%',y:'18%',s:4},{x:'86%',y:'14%',s:3},{x:'72%',y:'78%',s:5},{x:'22%',y:'82%',s:3},{x:'91%',y:'52%',s:4},{x:'4%',y:'57%',s:3}].map((p,i)=>(
        <div key={i} style={{ position:'absolute', left:p.x, top:p.y, width:`${p.s}px`, height:`${p.s}px`, borderRadius:'50%', background:'var(--lime)', opacity:0.22, animation:`floatOrb ${6+i}s ease-in-out ${i*0.6}s infinite`, pointerEvents:'none' }} />
      ))}

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position:'fixed', top:'18px', right:'18px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'10px', padding:'7px 13px', cursor:'pointer', fontSize:'12px', fontWeight:600, color:'var(--muted)', display:'flex', alignItems:'center', gap:'6px', zIndex:20 }}>
        {theme==='dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ── Left decoration (lg screens only) ── */}
      <div className="auth-side-deco auth-side-left">
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'18px', width:'200px', marginBottom:'12px', animation:'floatOrb 6s ease-in-out infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Portfolio Today</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'4px', height:'50px', marginBottom:'10px' }}>
            {bars.slice(0,8).map((h,i)=>(
              <div key={i} style={{ flex:1, height:`${h}%`, background:`rgba(185,255,102,${0.2+i*0.08})`, borderRadius:'3px 3px 0 0', animation:`cardEnter 0.4s ease ${i*60}ms both` }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ color:'var(--lime)', fontWeight:700, fontSize:'15px' }}>PKR 2.4M</div>
            <div style={{ color:'var(--lime)', fontSize:'11px', fontWeight:600, background:'rgba(185,255,102,0.1)', padding:'2px 7px', borderRadius:'5px' }}>+18.4%</div>
          </div>
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px 16px', width:'200px', animation:'floatOrb 8s ease-in-out 2s infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.07em' }}>Top Pick Today</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ color:'var(--white)', fontWeight:700, fontSize:'13px' }}>ENGRO</div>
              <div style={{ color:'var(--muted)', fontSize:'10px' }}>Fertilizer</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ color:'var(--lime)', fontSize:'12px', fontWeight:700 }}>+4.2%</div>
              <div style={{ color:'var(--muted)', fontSize:'10px' }}>PKR 312</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right decoration (lg screens only) ── */}
      <div className="auth-side-deco auth-side-right">
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'16px 18px', width:'200px', marginBottom:'12px', animation:'floatOrb 7s ease-in-out 1s infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'10px' }}>Features</div>
          {['68 PSX Stocks','AI Chat Advisor','Risk Analysis','Wealth Calculator'].map((f,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 0', borderBottom: i<3 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color:'var(--lime)', fontSize:'11px' }}>✓</span>
              <span style={{ color:'var(--muted)', fontSize:'11px' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px 16px', width:'200px', animation:'floatOrb 9s ease-in-out 3s infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'6px' }}>Market Pulse</div>
          {[['KSE-100','43,280','+0.8%'],['KSE-30','16,940','+1.1%']].map(([name,val,chg],i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', borderBottom: i<1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ color:'var(--white)', fontSize:'11px', fontWeight:600 }}>{name}</div>
                <div style={{ color:'var(--muted)', fontSize:'10px' }}>{val}</div>
              </div>
              <div style={{ color:'var(--lime)', fontSize:'11px', fontWeight:700 }}>{chg}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER CARD ── */}
      <div className="animate-in" style={{ width:'100%', maxWidth:'480px', position:'relative', zIndex:1, padding:'0 16px' }}>
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'22px', padding:'28px 32px',
          boxShadow:'0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(185,255,102,0.06)',
        }}>
          {/* Brand header */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px', paddingBottom:'18px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#1a2f1a,#0d1a0d)', border:'1.5px solid rgba(185,255,102,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 20px rgba(185,255,102,0.18)' }}>
              <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
                <polyline points="2,16 7,10 11,13 15,6 20,3" stroke="#b9ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:'var(--white)', fontWeight:700, fontSize:'15px', lineHeight:1.2 }}>PSX Portfolio</div>
              <div style={{ color:'var(--lime)', fontSize:'10px', fontWeight:600, letterSpacing:'0.04em' }}>AI Investment Advisor</div>
            </div>
            <div style={{ background:'rgba(185,255,102,0.1)', border:'1px solid rgba(185,255,102,0.2)', borderRadius:'6px', padding:'3px 8px' }}>
              <div style={{ fontSize:'9px', color:'var(--lime)', fontWeight:700, letterSpacing:'0.06em' }}>LIVE</div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:'18px' }}>
            <div className="section-tag" style={{ marginBottom:'7px' }}>Sign In</div>
            <h1 style={{ fontSize:'21px', fontWeight:700, color:'var(--white)', margin:'0 0 3px' }}>Welcome back</h1>
            <p style={{ color:'var(--muted)', fontSize:'13px', margin:0 }}>Enter your credentials to access your portfolio</p>
          </div>

          <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            {serverError && <div className="alert-error fade-in" style={{ padding:'9px 13px', fontSize:'12px' }}><span>⚠</span> {serverError}</div>}

            <div>
              <label className="field-label">Email Address</label>
              <input type="email" value={email}
                onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:''}))}}
                placeholder="you@example.com"
                className={`input-field${errors.email?' error':''}`}
                autoComplete="email" style={{ padding:'10px 13px' }}
              />
              {errors.email && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'4px', margin:'4px 0 0' }}>⚠ {errors.email}</p>}
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                <label className="field-label" style={{ margin:0 }}>Password</label>
                <Link to="/forgot-password" style={{ color:'var(--lime)', fontSize:'11px', textDecoration:'none', fontWeight:500 }}>Forgot Password?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={password}
                  onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:''}))}}
                  placeholder="••••••••"
                  className={`input-field${errors.password?' error':''}`}
                  autoComplete="current-password" style={{ padding:'10px 40px 10px 13px' }}
                />
                <EyeToggle show={showPass} onToggle={()=>setShowPass(p=>!p)} />
              </div>
              {errors.password && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', margin:'4px 0 0' }}>⚠ {errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', padding:'12px', fontSize:'14px', marginTop:'2px' }}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Signing in...</>
              ) : 'Sign In →'}
            </button>

            {slowWarning && <p className="fade-in" style={{ textAlign:'center', color:'#f59e0b', fontSize:'11px', margin:'2px 0 0' }}>⏳ Server waking up — please wait up to 60 seconds...</p>}
          </form>

          <div style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ color:'var(--muted)', fontSize:'12px', margin:0 }}>
              No account?{' '}<Link to="/register" style={{ color:'var(--lime)', textDecoration:'none', fontWeight:600 }}>Create one →</Link>
            </p>
            <p style={{ color:'var(--muted)', fontSize:'10px', margin:0, opacity:0.4 }}>
              Built by <span style={{ color:'var(--lime)', opacity:1 }}>Hamza Bilal</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .auth-side-deco { position:absolute; display:none; flex-direction:column; gap:0; z-index:1; }
        .auth-side-left  { left: calc(50% - 380px); top:50%; transform:translateY(-50%); }
        .auth-side-right { right: calc(50% - 380px); top:50%; transform:translateY(-50%); }
        @media (min-width:1100px) { .auth-side-deco { display:flex; } }
      `}</style>
    </div>
  )
}

export default Login
