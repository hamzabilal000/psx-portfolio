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

function Register() {
  const [form, setForm]               = useState({ name:'', email:'', password:'', confirm:'' })
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
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: '' }))
    setServerError('')
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    else if (form.name.trim().length < 2) e.name = 'At least 2 characters'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    if (!form.confirm) e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    return e
  }

  async function handleRegister(ev) {
    ev?.preventDefault()
    setServerError(''); setSuccess('')
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setLoading(true)
    const t = setTimeout(() => setSlowWarning(true), 5000)
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      if (res.data.success) {
        setSuccess('Account created! Redirecting to sign in...')
        setTimeout(() => navigate('/'), 2000)
      } else {
        const msg = res.data.error || 'Registration failed'
        if (res.data.code === 11000 || msg.toLowerCase().includes('already')) setErrors({ email: 'This email is already registered' })
        else setServerError(msg)
      }
    } catch (err) { setServerError(err.response?.data?.error || 'Registration failed. Please try again.') }
    clearTimeout(t); setSlowWarning(false); setLoading(false)
  }

  const strength = (() => {
    const p = form.password; if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const sColors = ['','#ff4d4d','#f59e0b','#60a5fa','#b9ff66']
  const sLabels = ['','Weak','Fair','Good','Strong']

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      {/* ── Background ── */}
      <div style={{ position:'absolute', top:'-12%', left:'-6%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.07) 0%, transparent 65%)', animation:'floatOrb 9s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-12%', right:'-6%', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 65%)', animation:'floatOrb 11s ease-in-out 2.5s infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'55%', right:'20%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)', animation:'floatOrb 7s ease-in-out 1s infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.22, pointerEvents:'none' }} />
      <svg style={{ position:'absolute', top:'4%', left:0, width:'100%', opacity:0.06, pointerEvents:'none' }} height="90" viewBox="0 0 1400 90" preserveAspectRatio="none">
        <polyline points="0,75 140,55 300,65 460,30 620,48 780,18 940,35 1100,10 1260,22 1400,5" fill="none" stroke="#b9ff66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="points" dur="7s" repeatCount="indefinite"
            values="0,75 140,55 300,65 460,30 620,48 780,18 940,35 1100,10 1260,22 1400,5;0,65 140,45 300,75 460,20 620,58 780,8 940,45 1100,20 1260,12 1400,15;0,75 140,55 300,65 460,30 620,48 780,18 940,35 1100,10 1260,22 1400,5"/>
        </polyline>
      </svg>
      {[{x:'8%',y:'16%',s:4},{x:'88%',y:'12%',s:3},{x:'74%',y:'80%',s:5},{x:'18%',y:'84%',s:3},{x:'93%',y:'55%',s:4},{x:'3%',y:'62%',s:3}].map((p,i)=>(
        <div key={i} style={{ position:'absolute', left:p.x, top:p.y, width:`${p.s}px`, height:`${p.s}px`, borderRadius:'50%', background:'var(--lime)', opacity:0.2, animation:`floatOrb ${6+i}s ease-in-out ${i*0.5}s infinite`, pointerEvents:'none' }} />
      ))}

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position:'fixed', top:'18px', right:'18px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'10px', padding:'7px 13px', cursor:'pointer', fontSize:'12px', fontWeight:600, color:'var(--muted)', display:'flex', alignItems:'center', gap:'6px', zIndex:20 }}>
        {theme==='dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ── Left decoration ── */}
      <div className="auth-side-deco auth-side-left">
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'16px 18px', width:'196px', marginBottom:'12px', animation:'floatOrb 7s ease-in-out infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'8px' }}>What you get</div>
          {['68 PSX stocks tracked','Groq AI chat advisor','Live risk analysis','Dividend calculator','Portfolio comparison','Sector breakdown'].map((f,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'4px 0', borderBottom: i<5 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color:'var(--lime)', fontSize:'10px', flexShrink:0 }}>✓</span>
              <span style={{ color:'var(--muted)', fontSize:'10px' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'13px 16px', width:'196px', animation:'floatOrb 9s ease-in-out 3s infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.07em' }}>Built by</div>
          <div style={{ color:'var(--lime)', fontWeight:700, fontSize:'13px' }}>Hamza Bilal</div>
          <div style={{ color:'var(--muted)', fontSize:'10px', marginTop:'2px' }}>MERN + AI Developer</div>
        </div>
      </div>

      {/* ── Right decoration ── */}
      <div className="auth-side-deco auth-side-right">
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'16px', padding:'16px 18px', width:'196px', marginBottom:'12px', animation:'floatOrb 8s ease-in-out 1s infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'8px' }}>Top Movers</div>
          {[['ENGRO','+4.2%'],['HBL','+3.1%'],['PSO','+2.8%'],['LUCK','-1.4%']].map(([sym,chg],i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom: i<3 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color:'var(--white)', fontSize:'11px', fontWeight:600 }}>{sym}</span>
              <span style={{ color: chg.startsWith('+') ? 'var(--lime)' : 'var(--danger)', fontSize:'11px', fontWeight:700 }}>{chg}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'13px 16px', width:'196px', animation:'floatOrb 10s ease-in-out 2s infinite' }}>
          <div style={{ fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'6px' }}>Free to use</div>
          <div style={{ color:'var(--white)', fontWeight:700, fontSize:'18px' }}>PKR 0</div>
          <div style={{ color:'var(--muted)', fontSize:'10px', marginTop:'2px' }}>No hidden charges</div>
        </div>
      </div>

      {/* ── CENTER CARD ── */}
      <div className="animate-in" style={{ width:'100%', maxWidth:'480px', position:'relative', zIndex:1, padding:'0 16px' }}>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'22px', padding:'24px 30px', boxShadow:'0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(185,255,102,0.06)' }}>

          {/* Brand header */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'11px', background:'linear-gradient(135deg,#1a2f1a,#0d1a0d)', border:'1.5px solid rgba(185,255,102,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 18px rgba(185,255,102,0.18)' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <polyline points="2,16 7,10 11,13 15,6 20,3" stroke="#b9ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:'var(--white)', fontWeight:700, fontSize:'14px', lineHeight:1.2 }}>PSX Portfolio</div>
              <div style={{ color:'var(--lime)', fontSize:'10px', fontWeight:600, letterSpacing:'0.04em' }}>AI Investment Advisor</div>
            </div>
            <div style={{ background:'rgba(185,255,102,0.1)', border:'1px solid rgba(185,255,102,0.2)', borderRadius:'6px', padding:'3px 8px' }}>
              <div style={{ fontSize:'9px', color:'var(--lime)', fontWeight:700, letterSpacing:'0.06em' }}>FREE</div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:'16px' }}>
            <div className="section-tag" style={{ marginBottom:'6px' }}>Register</div>
            <h1 style={{ fontSize:'20px', fontWeight:700, color:'var(--white)', margin:'0 0 2px' }}>Create your account</h1>
            <p style={{ color:'var(--muted)', fontSize:'12px', margin:0 }}>Start your PSX investment journey today</p>
          </div>

          <form onSubmit={handleRegister} noValidate style={{ display:'flex', flexDirection:'column', gap:'11px' }}>
            {serverError && <div className="alert-error fade-in" style={{ padding:'8px 12px', fontSize:'12px' }}><span>⚠</span> {serverError}</div>}
            {success     && <div className="alert-success fade-in" style={{ padding:'8px 12px', fontSize:'12px' }}><span>✓</span> {success}</div>}

            {/* Name + Email side by side */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label className="field-label">Full Name</label>
                <input type="text" value={form.name} onChange={e=>handleChange('name',e.target.value)}
                  placeholder="Your name"
                  className={`input-field${errors.name?' error':''}`}
                  autoComplete="name" style={{ padding:'9px 11px' }}
                />
                {errors.name && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.name}</p>}
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" value={form.email} onChange={e=>handleChange('email',e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field${errors.email?' error':''}`}
                  autoComplete="email" style={{ padding:'9px 11px' }}
                />
                {errors.email && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={form.password} onChange={e=>handleChange('password',e.target.value)}
                  placeholder="At least 8 characters"
                  className={`input-field${errors.password?' error':''}`}
                  autoComplete="new-password" style={{ padding:'9px 40px 9px 11px' }}
                />
                <EyeToggle show={showPass} onToggle={()=>setShowPass(p=>!p)} />
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop:'5px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'3px', flex:1 }}>
                    {[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:'2px', borderRadius:'99px', background: i<=strength ? sColors[strength] : 'var(--border)', transition:'background 0.3s' }} />)}
                  </div>
                  <span style={{ fontSize:'10px', color: sColors[strength]||'var(--muted)', fontWeight:600, flexShrink:0 }}>{sLabels[strength]}</span>
                </div>
              )}
              {errors.password && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="field-label">Confirm Password</label>
              <div style={{ position:'relative' }}>
                <input type={showConfirm?'text':'password'} value={form.confirm} onChange={e=>handleChange('confirm',e.target.value)}
                  placeholder="••••••••"
                  className={`input-field${errors.confirm?' error':''}`}
                  autoComplete="new-password" style={{ padding:'9px 40px 9px 11px' }}
                />
                <EyeToggle show={showConfirm} onToggle={()=>setShowConfirm(p=>!p)} />
              </div>
              {errors.confirm && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading||!!success} className="btn-primary" style={{ width:'100%', padding:'11px', fontSize:'14px', marginTop:'2px' }}>
              {loading ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Creating Account...</>
              ) : 'Create Account →'}
            </button>

            {slowWarning && <p className="fade-in" style={{ textAlign:'center', color:'#f59e0b', fontSize:'11px', margin:'2px 0 0' }}>⏳ Server waking up — please wait up to 60 seconds...</p>}
          </form>

          <div style={{ marginTop:'14px', paddingTop:'14px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ color:'var(--muted)', fontSize:'12px', margin:0 }}>
              Have an account?{' '}<Link to="/" style={{ color:'var(--lime)', textDecoration:'none', fontWeight:600 }}>Sign In →</Link>
            </p>
            <p style={{ color:'var(--muted)', fontSize:'10px', margin:0, opacity:0.4 }}>🔒 Encrypted</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .auth-side-deco { position:absolute; display:none; flex-direction:column; z-index:1; }
        .auth-side-left  { left: calc(50% - 390px); top:50%; transform:translateY(-50%); }
        .auth-side-right { right: calc(50% - 390px); top:50%; transform:translateY(-50%); }
        @media (min-width:1100px) { .auth-side-deco { display:flex; } }
      `}</style>
    </div>
  )
}

export default Register
