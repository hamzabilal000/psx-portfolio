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
  const sColors = ['','#ef4444','#f59e0b','#3b82f6','#16a34a']
  const sLabels = ['','Weak','Fair','Good','Strong']

  const isDark = theme === 'dark'

  const inputStyle = (hasError) => ({
    width:'100%', padding:'11px 14px', borderRadius:'12px', fontSize:'13px',
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f9f0',
    border: hasError ? '1.5px solid #ef4444' : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #d1fae5',
    color: isDark ? '#ffffff' : '#111827',
    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
    transition:'border-color 0.2s',
  })

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: isDark ? '#0a0f0a' : '#f0f4f0', padding:'20px', position:'relative' }}>

      <div style={{ position:'fixed', inset:0, backgroundImage:'radial-gradient(circle at 80% 50%, rgba(22,101,52,0.12) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(22,101,52,0.08) 0%, transparent 40%)', pointerEvents:'none' }} />

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position:'fixed', top:'18px', right:'18px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius:'10px', padding:'7px 13px', cursor:'pointer', fontSize:'12px', fontWeight:600, color: isDark ? '#9ca3af' : '#374151', display:'flex', alignItems:'center', gap:'6px', zIndex:20 }}>
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ── CARD ── */}
      <div className="animate-in" style={{
        display:'flex', width:'100%', maxWidth:'900px',
        borderRadius:'24px', overflow:'hidden',
        boxShadow: isDark
          ? '0 32px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 32px 100px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width:'40%', flexShrink:0,
          background:'linear-gradient(160deg, #166534 0%, #14532d 40%, #0d3d1e 100%)',
          padding:'40px 32px', display:'flex', flexDirection:'column',
          justifyContent:'space-between', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-70px', left:'-30px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'45%', right:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(185,255,102,0.09)', pointerEvents:'none' }} />

          {/* Logo */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ width:'50px', height:'50px', borderRadius:'15px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'18px' }}>
              <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
                <polyline points="2,16 7,10 11,13 15,6 20,3" stroke="#b9ff66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="3" r="1.8" fill="#b9ff66"/>
              </svg>
            </div>
            <div style={{ color:'#ffffff', fontSize:'12px', fontWeight:600, letterSpacing:'0.06em', opacity:0.7 }}>PSX PORTFOLIO</div>
          </div>

          {/* Headline */}
          <div style={{ position:'relative', zIndex:1 }}>
            <h1 style={{ color:'#ffffff', fontSize:'28px', fontWeight:700, lineHeight:1.25, margin:'0 0 10px' }}>
              Hello,<br/>Friend!
            </h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:1.65, margin:'0 0 24px' }}>
              Enter your personal details and start your journey with us today.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                background:'transparent', border:'1.5px solid rgba(255,255,255,0.5)',
                borderRadius:'99px', color:'#ffffff', fontWeight:600,
                fontSize:'12px', padding:'9px 26px', cursor:'pointer',
                letterSpacing:'0.06em', textTransform:'uppercase',
                transition:'background 0.2s, border-color 0.2s', fontFamily:'inherit',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.borderColor='rgba(255,255,255,0.8)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'}}
            >
              Sign In
            </button>
          </div>

          {/* Footer */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', letterSpacing:'0.04em' }}>
              CREATOR <span style={{ color:'#b9ff66', fontWeight:700 }}>HAMZA BILAL</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex:1, background: isDark ? '#111714' : '#ffffff',
          padding:'36px 40px', display:'flex', flexDirection:'column', justifyContent:'center',
        }}>
          <div style={{ marginBottom:'22px' }}>
            <h2 style={{ color: isDark ? '#ffffff' : '#111827', fontSize:'26px', fontWeight:700, margin:'0 0 4px', lineHeight:1.2 }}>Create Account</h2>
            <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize:'13px', margin:0 }}>Start your PSX investment journey today</p>
          </div>

          <form onSubmit={handleRegister} noValidate style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {serverError && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'9px 13px', color:'#ef4444', fontSize:'12px', display:'flex', gap:'8px' }}>
                <span>⚠</span>{serverError}
              </div>
            )}
            {success && (
              <div style={{ background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.25)', borderRadius:'10px', padding:'9px 13px', color:'#16a34a', fontSize:'12px', display:'flex', gap:'8px' }}>
                <span>✓</span>{success}
              </div>
            )}

            {/* Name + Email row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <input type="text" value={form.name} onChange={e=>handleChange('name',e.target.value)}
                  placeholder="Full Name............"
                  autoComplete="name"
                  style={inputStyle(errors.name)}
                  onFocus={e=>{if(!errors.name)e.target.style.borderColor='#166534'}}
                  onBlur={e=>{if(!errors.name)e.target.style.borderColor=isDark?'rgba(255,255,255,0.08)':'#d1fae5'}}
                />
                {errors.name && <p style={{ color:'#ef4444', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.name}</p>}
              </div>
              <div>
                <input type="email" value={form.email} onChange={e=>handleChange('email',e.target.value)}
                  placeholder="Email............"
                  autoComplete="email"
                  style={inputStyle(errors.email)}
                  onFocus={e=>{if(!errors.email)e.target.style.borderColor='#166534'}}
                  onBlur={e=>{if(!errors.email)e.target.style.borderColor=isDark?'rgba(255,255,255,0.08)':'#d1fae5'}}
                />
                {errors.email && <p style={{ color:'#ef4444', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={form.password} onChange={e=>handleChange('password',e.target.value)}
                  placeholder="Password............"
                  autoComplete="new-password"
                  style={{ ...inputStyle(errors.password), paddingRight:'42px' }}
                  onFocus={e=>{if(!errors.password)e.target.style.borderColor='#166534'}}
                  onBlur={e=>{if(!errors.password)e.target.style.borderColor=isDark?'rgba(255,255,255,0.08)':'#d1fae5'}}
                />
                <EyeToggle show={showPass} onToggle={()=>setShowPass(p=>!p)} />
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop:'5px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'3px', flex:1 }}>
                    {[1,2,3,4].map(i=>(
                      <div key={i} style={{ flex:1, height:'3px', borderRadius:'99px', background: i<=strength ? sColors[strength] : isDark?'rgba(255,255,255,0.1)':'#e5e7eb', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:'10px', color: sColors[strength]||'#9ca3af', fontWeight:600, flexShrink:0 }}>{sLabels[strength]}</span>
                </div>
              )}
              {errors.password && <p style={{ color:'#ef4444', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <div style={{ position:'relative' }}>
                <input type={showConfirm?'text':'password'} value={form.confirm} onChange={e=>handleChange('confirm',e.target.value)}
                  placeholder="Confirm Password............"
                  autoComplete="new-password"
                  style={{ ...inputStyle(errors.confirm), paddingRight:'42px' }}
                  onFocus={e=>{if(!errors.confirm)e.target.style.borderColor='#166534'}}
                  onBlur={e=>{if(!errors.confirm)e.target.style.borderColor=isDark?'rgba(255,255,255,0.08)':'#d1fae5'}}
                />
                <EyeToggle show={showConfirm} onToggle={()=>setShowConfirm(p=>!p)} />
              </div>
              {errors.confirm && <p style={{ color:'#ef4444', fontSize:'10px', margin:'3px 0 0' }}>⚠ {errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading||!!success} style={{
              width:'100%', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:700,
              background:'linear-gradient(135deg, #166534, #15803d)',
              color:'#ffffff', border:'none', cursor: loading||success ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', letterSpacing:'0.04em', textTransform:'uppercase',
              transition:'opacity 0.2s, transform 0.15s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              opacity: loading||success ? 0.75 : 1, marginTop:'2px',
            }}
              onMouseEnter={e=>{ if(!loading&&!success){ e.currentTarget.style.transform='translateY(-1px)' }}}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)' }}
            >
              {loading
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Creating Account...</>
                : 'Sign Up'
              }
            </button>

            {slowWarning && <p style={{ textAlign:'center', color:'#f59e0b', fontSize:'11px', margin:0 }}>⏳ Server waking up — please wait up to 60 seconds...</p>}
          </form>

          <p style={{ textAlign:'center', color: isDark ? '#9ca3af' : '#6b7280', fontSize:'13px', marginTop:'18px', marginBottom:0 }}>
            Already have an account?{' '}
            <Link to="/" style={{ color:'#16a34a', textDecoration:'none', fontWeight:700 }}>sign in</Link>
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

export default Register
