import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
axios.defaults.withCredentials = true

function Login() {
  let emailRef = useRef()
  let passRef = useRef()
  let [error, setError] = useState('')
  let [loading, setLoading] = useState(false)
  let navigate = useNavigate()

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      let res = await axios.post("http://localhost:8080/auth/login", {
        email: emailRef.current.value,
        password: passRef.current.value
      })
      if (res.data.success == true) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user))
        navigate('/dashboard')
      } else {
        setError(res.data.error)
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1f2e', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📈</div>
          <h1 style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: 700, margin: 0 }}>PSX Portfolio</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>AI-Powered Investment Advisor</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>Sign In</h2>

          {error && (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Email</label>
            <input ref={emailRef} type="email" placeholder="you@example.com" className="input-field" />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Password</label>
            <input ref={passRef} type="password" placeholder="••••••••" className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link to="/forgot-password" style={{ color: '#16a34a', fontSize: '13px', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

          <button onClick={handleLogin} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#16a34a', textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
