import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
axios.defaults.withCredentials = true

function VerifyEmail() {
  let [status, setStatus] = useState('verifying')
  let [msg, setMsg] = useState('')
  let navigate = useNavigate()

  useEffect(() => {
    async function verify() {
      let token = new URLSearchParams(window.location.search).get('token')
      if (!token) { setStatus('error'); setMsg('No token found'); return }
      try {
        let res = await axios.post("http://localhost:8080/auth/verify-email", { token })
        if (res.data.success == true) {
          setStatus('success')
          setMsg(res.data.data.message)
          setTimeout(() => navigate('/'), 3000)
        } else {
          setStatus('error'); setMsg(res.data.error)
        }
      } catch {
        setStatus('error'); setMsg('Verification failed')
      }
    }
    verify()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px', textAlign: 'center' }}>
        {status === 'verifying' && <><div style={{ fontSize: '48px' }}>⏳</div><p style={{ color: '#94a3b8' }}>Verifying your email...</p></>}
        {status === 'success' && <><div style={{ fontSize: '48px' }}>✅</div><p style={{ color: '#86efac' }}>{msg}</p><p style={{ color: '#64748b', fontSize: '13px' }}>Redirecting to login...</p></>}
        {status === 'error' && <><div style={{ fontSize: '48px' }}>❌</div><p style={{ color: '#fca5a5' }}>{msg}</p><button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '16px' }}>Go to Login</button></>}
      </div>
    </div>
  )
}

export default VerifyEmail
