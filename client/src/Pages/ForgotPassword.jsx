import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
axios.defaults.withCredentials = true

function ForgotPassword() {
  let emailRef = useRef()
  let [msg, setMsg] = useState('')
  let [error, setError] = useState('')
  let [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(''); setMsg(''); setLoading(true)
    try {
      let res = await axios.post("http://localhost:8080/auth/forgot-password", { email: emailRef.current.value })
      if (res.data.success == true) setMsg(res.data.data.message)
      else setError(res.data.error)
    } catch (e) {
      setError('Request failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '400px' }}>
        <div className="card">
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '8px' }}>Forgot Password</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Enter your email and we'll send a reset link.</p>

          {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          {msg && <div style={{ background: '#14532d', color: '#86efac', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{msg}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Email</label>
            <input ref={emailRef} type="email" placeholder="you@example.com" className="input-field" />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '14px' }}>
            <Link to="/" style={{ color: '#16a34a', textDecoration: 'none' }}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
