import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
axios.defaults.withCredentials = true

function Register() {
  let nameRef = useRef()
  let emailRef = useRef()
  let passRef = useRef()
  let confirmRef = useRef()
  let [error, setError] = useState('')
  let [success, setSuccess] = useState('')
  let [loading, setLoading] = useState(false)
  let navigate = useNavigate()

  async function handleRegister() {
    setError('')
    setSuccess('')
    if (passRef.current.value !== confirmRef.current.value) {
      return setError('Passwords do not match')
    }
    setLoading(true)
    try {
      let res = await axios.post("http://localhost:8080/auth/register", {
        name: nameRef.current.value,
        email: emailRef.current.value,
        password: passRef.current.value
      })
      if (res.data.success == true) {
        setSuccess('Registration successful! Please check your email to verify your account.')
      } else {
        setError(res.data.error)
        if (res.data.code == 11000) setError('Email already registered')
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📈</div>
          <h1 style={{ color: '#e2e8f0', fontSize: '28px', fontWeight: 700, margin: 0 }}>Create Account</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Start your investment journey</p>
        </div>

        <div className="card">
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>Register</h2>

          {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          {success && <div style={{ background: '#14532d', color: '#86efac', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{success}</div>}

          {[
            { ref: nameRef, label: 'Full Name', type: 'text', placeholder: 'Hamza Ali' },
            { ref: emailRef, label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { ref: passRef, label: 'Password', type: 'password', placeholder: 'Min 8 characters' },
            { ref: confirmRef, label: 'Confirm Password', type: 'password', placeholder: '••••••••' }
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{field.label}</label>
              <input ref={field.ref} type={field.type} placeholder={field.placeholder} className="input-field" />
            </div>
          ))}

          <button onClick={handleRegister} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: '#16a34a', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
