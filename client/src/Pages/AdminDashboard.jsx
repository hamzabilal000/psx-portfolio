import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

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
          axios.get("http://localhost:8080/admin/stats"),
          axios.get("http://localhost:8080/admin/users")
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
      let res = await axios.put(`http://localhost:8080/admin/stocks/${symbol}/price`, { price })
      if (res.data.success == true) setPriceMsg(`✅ Updated ${symbol} to PKR ${price}`)
      else setPriceMsg('❌ ' + res.data.error)
    } catch { setPriceMsg('❌ Failed') }
  }

  async function triggerPriceUpdate() {
    try {
      let res = await axios.post("http://localhost:8080/admin/prices/update")
      if (res.data.success == true) setPriceMsg('✅ Live price update triggered')
    } catch { setPriceMsg('❌ Update failed') }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🔧 Admin Dashboard</h1>
        <p style={{ color: '#f59e0b', marginBottom: '24px', fontSize: '13px' }}>Admin-only — restricted access</p>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Total Users', value: stats.userCount, icon: '👥' },
              { label: 'Verified Users', value: stats.verifiedUsers, icon: '✅' },
              { label: 'Profiled Users', value: stats.profiledUsers, icon: '📊' },
              { label: 'Active Stocks', value: stats.stockCount, icon: '📈' },
            ].map(m => (
              <div key={m.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>{m.icon}</div>
                <div style={{ color: '#22c55e', fontSize: '28px', fontWeight: 700 }}>{m.value}</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[{ key: 'stats', label: 'Price Update' }, { key: 'users', label: 'Users' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 20px', background: tab === t.key ? '#16a34a' : '#232938', color: tab === t.key ? 'white' : '#94a3b8', border: `1px solid ${tab === t.key ? '#16a34a' : '#2d3347'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '4px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'stats' && (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 20px' }}>Manual Price Update</h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Stock Symbol</label>
              <input ref={symbolRef} type="text" placeholder="MEBL" className="input-field" style={{ textTransform: 'uppercase' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>New Price (PKR)</label>
              <input ref={priceRef} type="number" placeholder="284" className="input-field" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={updatePrice} className="btn-primary">Update Price</button>
              <button onClick={triggerPriceUpdate} className="btn-outline">🔄 Fetch Live Prices</button>
            </div>
            {priceMsg && <div style={{ marginTop: '12px', color: priceMsg.startsWith('✅') ? '#86efac' : '#fca5a5', fontSize: '13px' }}>{priceMsg}</div>}
          </div>
        )}

        {tab === 'users' && (
          loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading...</div> :
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d3347' }}>
                    {['Name', 'Email', 'Role', 'Verified', 'Has Profile', 'Joined'].map(h => (
                      <th key={h} style={{ color: '#64748b', padding: '8px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #1a1f2e' }}>
                      <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{u.name}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: u.role === 'admin' ? '#713f12' : '#1a1f2e', color: u.role === 'admin' ? '#fbbf24' : '#94a3b8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: u.isVerified ? '#22c55e' : '#ef4444' }}>{u.isVerified ? '✓' : '✗'}</td>
                      <td style={{ padding: '10px 12px', color: u.riskProfile ? '#22c55e' : '#64748b' }}>{u.riskProfile ? '✓' : '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
