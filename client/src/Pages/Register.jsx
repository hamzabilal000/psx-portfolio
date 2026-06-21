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
      <span style={{ display:'block', transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', transform: show ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)' }}>
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
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    else if (form.name.trim().length < 2) errs.name = 'At least 2 characters'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'At least 8 characters'
    if (!form.confirm) errs.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleRegister(e) {
    e?.preventDefault()
    setServerError(''); setSuccess('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true); setSlowWarning(false)
    const wakeTimer = setTimeout(() => setSlowWarning(true), 5000)
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      if (res.data.success === true) {
        setSuccess('Account created! Redirecting...')
        setTimeout(() => navigate('/'), 2000)
      } else {
        const msg = res.data.error || 'Registration failed'
        if (res.data.code === 11000 || msg.toLowerCase().includes('already')) {
          setErrors({ email: 'This email is already registered' })
        } else { setServerError(msg) }
      }
    } catch (e) {
      setServerError(e.response?.data?.error || 'Registration failed. Please try again.')
    }
    clearTimeout(wakeTimer); setSlowWarning(false); setLoading(false)
  }

  const strengthLevel = () => {
    const p = form.password; if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strength = strengthLevel()
  const strengthColors = ['','#ff4d4d','#f59e0b','#60a5fa','#b9ff66']
  const strengthLabels = ['','Weak','Fair','Good','Strong']

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      {/* ── Animated background ── */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.07) 0%, transparent 65%)', animation:'floatOrb 8s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,255,102,0.05) 0%, transparent 65%)', animation:'floatOrb 10s ease-in-out 2s infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'50%', right:'15%', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 65%)', animation:'floatOrb 7s ease-in-out 1s infinite', pointerEvents:'none' }} />

      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.25, pointerEvents:'none' }} />

      {/* Animated chart line */}
      <svg style={{ position:'absolute', top:'5%', left:0, width:'100%', opacity:0.05, pointerEvents:'none' }} height="100" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <polyline points="0,80 150,60 300,70 450,35 600,50 750,20 900,38 1050,10 1200,25"
          fill="none" stroke="#b9ff66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="points" dur="7s" repeatCount="indefinite"
            values="0,80 150,60 300,70 450,35 600,50 750,20 900,38 1050,10 1200,25;
                    0,70 150,50 300,80 450,25 600,60 750,10 900,48 1050,20 1200,15;
                    0,80 150,60 300,70 450,35 600,50 750,20 900,38 1050,10 1200,25"/>
        </polyline>
      </svg>

      {/* Floating particles */}
      {[{x:'8%',y:'18%',s:4,d:'0s'},{x:'88%',y:'12%',s:3,d:'1.2s'},{x:'75%',y:'80%',s:5,d:'2.1s'},{x:'20%',y:'85%',s:3,d:'0.6s'},{x:'92%',y:'55%',s:4,d:'1.8s'},{x:'3%',y:'60%',s:3,d:'3.2s'}].map((p,i) => (
        <div key={i} style={{ position:'absolute', left:p.x, top:p.y, width:`${p.s}px`, height:`${p.s}px`, borderRadius:'50%', background:'var(--lime)', opacity:0.2, animation:`floatOrb ${6+i}s ease-in-out ${p.d} infinite`, pointerEvents:'none' }} />
      ))}

      {/* Theme toggle */}
      <button onClick={toggle} style={{ position:'fixed', top:'20px', right:'20px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'10px', padding:'8px 14px', cursor:'pointer', fontSize:'12px', fontWeight:600, color:'var(--muted)', display:'flex', alignItems:'center', gap:'6px', zIndex:10 }}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* ── Center Card ── */}
      <div className="animate-in" style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1, padding:'0 20px' }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'18px' }}>
          <div style={{ display:'inline-flex', marginBottom:'12px' }}><Logo /></div>
          <h1 style={{ fontSize:'22px', fontWeight:700, color:'var(--white)', margin:'0 0 3px' }}>PSX Portfolio</h1>
          <p style={{ color:'var(--lime)', fontSize:'12px', fontWeight:600, margin:0 }}>AI Investment Advisor</p>
        </div>

        {/* Card */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'20px', padding:'24px 28px', boxShadow:'0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(185,255,102,0.05)' }}>
          <div style={{ marginBottom:'16px' }}>
            <div className="section-tag" style={{ marginBottom:'7px' }}>Register</div>
            <h2 style={{ fontSize:'18px', fontWeight:700, color:'var(--white)', margin:'0 0 2px' }}>Create your account</h2>
            <p style={{ color:'var(--muted)', fontSize:'12px', margin:0 }}>Start your PSX investment journey today</p>
          </div>

          <form onSubmit={handleRegister} noValidate style={{ display:'flex', flexDirection:'column', gap:'11px' }}>
            {serverError && <div className="alert-error fade-in" style={{ padding:'9px 12px', fontSize:'12px' }}><span>⚠</span> {serverError}</div>}
            {success     && <div className="alert-success fade-in" style={{ padding:'9px 12px', fontSize:'12px' }}><span>✓</span> {success}</div>}

            <div>
              <label className="field-label">Full Name</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={`input-field${errors.name ? ' error' : ''}`}
                autoComplete="name" style={{ padding:'10px 13px' }}
              />
              {errors.name && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'3px' }}>⚠ {errors.name}</p>}
            </div>

            <div>
              <label className="field-label">Email Address</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className={`input-field${errors.email ? ' error' : ''}`}
                autoComplete="email" style={{ padding:'10px 13px' }}
              />
              {errors.email && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'3px' }}>⚠ {errors.email}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => handleChange('password', e.target.value)}
                  placeholder="At least 8 characters"
                  className={`input-field${errors.password ? ' error' : ''}`}
                  autoComplete="new-password" style={{ padding:'10px 42px 10px 13px' }}
                />
                <EyeToggle show={showPass} onToggle={() => setShowPass(p => !p)} />
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop:'5px' }}>
                  <div style={{ display:'flex', gap:'3px', marginBottom:'2px' }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:'2px', borderRadius:'99px', background: i <= strength ? strengthColors[strength] : 'var(--border)', transition:'background 0.3s' }} />)}
                  </div>
                  <p style={{ fontSize:'10px', color: strengthColors[strength] || 'var(--muted)', margin:0 }}>{strengthLabels[strength]} password</p>
                </div>
              )}
              {errors.password && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'3px' }}>⚠ {errors.password}</p>}
            </div>

            <div>
              <label className="field-label">Confirm Password</label>
              <div style={{ position:'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={e => handleChange('confirm', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field${errors.confirm ? ' error' : ''}`}
                  autoComplete="new-password" style={{ padding:'10px 42px 10px 13px' }}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
              </div>
              {errors.confirm && <p className="fade-in" style={{ color:'var(--danger)', fontSize:'11px', marginTop:'3px' }}>⚠ {errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading || !!success} className="btn-primary" style={{ width:'100%', padding:'12px', fontSize:'14px', marginTop:'3px' }}>
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account →'}
            </button>

            {slowWarning && <p className="fade-in" style={{ textAlign:'center', color:'#f59e0b', fontSize:'11px', margin:0 }}>⏳ Server waking up — please wait up to 60 seconds...</p>}
          </form>

          <p style={{ textAlign:'center', color:'var(--muted)', marginTop:'14px', fontSize:'13px', marginBottom:0 }}>
            Already have an account?{' '}
            <Link to="/" style={{ color:'var(--lime)', textDecoration:'none', fontWeight:600 }}>Sign In</Link>
          </p>
        </div>

        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'11px', marginTop:'12px', opacity:0.4 }}>
          🔒 Your data is encrypted and secure · Built by <span style={{ color:'var(--lime)', opacity:1 }}>Hamza Bilal</span>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Register
