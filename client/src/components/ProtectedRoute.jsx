import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function ProtectedRoute({ children, adminOnly }) {
  let [loading, setLoading] = useState(true)
  let [user, setUser] = useState(null)
  let navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      try {
        let res = await api.get('/auth/me')
        if (res.data.success) {
          setUser(res.data.data)
          if (adminOnly && res.data.data.role !== 'admin') {
            navigate('/dashboard')
          }
        } else {
          navigate('/')
        }
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1f2e' }}>
        <div style={{ color: '#16a34a', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  return user ? children : null
}

export default ProtectedRoute
