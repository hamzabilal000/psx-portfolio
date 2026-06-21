import { useEffect, useRef, useState } from 'react'
import api from '../api'
import Layout from '../components/Layout'

function AdminDashboard() {
  let [stats, setStats] = useState(null)
  let [users, setUsers] = useState([])
  let [tab, setTab] = useState('stats')
  let [loading, setLoading] = useState(true)
  let symbolRef = useRef(), priceRef = useRef()
  let [priceMsg, setPriceMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        let [sRes, uRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ])
        if (sRes.data.success) setStats(sRes.data.data)
        if (uRes.data.success) setUsers(uRes.data.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  async function updatePrice() {
    let symbol = symbolRef.current.value.toUpperCase()
    let price = parseFloat(priceRef.current.value)
    if (!symbol || !price) return
    try {
      let res = await api.put(`/admin/stocks/${symbol}/price`, { price })
      if (res.data.success == true) setPriceMsg(`✅ Updated ${symbol} to PKR ${price}`)
      else setPriceMsg('❌ ' + res.data.error)
    } catch { setPriceMsg('❌ Failed') }
  }

  async function triggerPriceUpdate() {
    try {
      let res = await api.post('/admin/prices/update')
      if (res.data.success == true) setPriceMsg('✅ Live price update triggered')
    } catch { setPriceMsg('❌ Update failed') }
  }

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>🔧 Admin Dashboard</h1>
      <p style={{ color: 'var(--warn)', marginBottom: '24px', fontSize: '13px' }}>Admin-only — restricted access</p>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Users',    value: stats.userCount,    icon: '👥' },
            { label: 'Verified Users', value: stats.verifiedUsers, icon: '✅' },
            { label: 'Profiled Users', value: stats.profiledUsers, icon: '📊' },
            { label: 'Active Stocks',  value: stats.stockCount,   icon: '📈' },
          ].map(m => (
            <div key={m.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{m.icon}</div>
              <div style={{ color: 'var(--lime)', fontSize: '28px', fontWeight: 700 }}>{m.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ key: 'stats', label: 'Price Update' }, { key: 'users', label: 'Users' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '8px 20px',
              background: tab === t.key ? 'var(--lime)' : 'var(--bg-card)',
              color: tab === t.key ? '#0d0d0d' : 'var(--muted)',
              border: `1px solid ${tab === t.key ? 'var(--lime)' : 'var(--border)'}`,
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="card" style={{ maxWidth: '500px' }}>
          <h3 style={{ color: 'var(--white)', margin: '0 0 20px', fontSize: '16px', fontWeight: 700 }}>Manual Price Update</h3>
          <div style={{ marginBottom: '14px' }}>
            <label className="field-label">Stock Symbol</label>
            <input ref={symbolRef} type="text" placeholder="MEBL" className="input-field" style={{ textTransform: 'uppercase' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label className="field-label">New Price (PKR)</label>
            <input ref={priceRef} type="number" placeholder="284" className="input-field" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={updatePrice} className="btn-primary">Update Price</button>
            <button onClick={triggerPriceUpdate} className="btn-outline">🔄 Fetch Live Prices</button>
          </div>
          {priceMsg && (
            <div style={{ marginTop: '12px', color: priceMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)', fontSize: '13px' }}>
              {priceMsg}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        loading
          ? <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading...</div>
          : (
            <div className="card">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>{['Name', 'Email', 'Role', 'Verified', 'Has Profile', 'Joined'].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ color: 'var(--white)' }}>{u.name}</td>
                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                        <td>
                          <span style={{
                            background: u.role === 'admin' ? 'rgba(245,158,11,0.1)' : 'var(--bg-hover)',
                            color: u.role === 'admin' ? 'var(--warn)' : 'var(--muted)',
                            padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600
                          }}>{u.role}</span>
                        </td>
                        <td style={{ color: u.isVerified ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{u.isVerified ? '✓' : '✗'}</td>
                        <td style={{ color: u.riskProfile ? 'var(--success)' : 'var(--muted)' }}>{u.riskProfile ? '✓' : '—'}</td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}
    </Layout>
  )
}

export default AdminDashboard
