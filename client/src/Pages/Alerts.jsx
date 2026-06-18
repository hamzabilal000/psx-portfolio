import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

function Alerts() {
  let [alerts, setAlerts] = useState([])
  let [notifications, setNotifications] = useState([])
  let [tab, setTab] = useState('alerts')
  let [loading, setLoading] = useState(true)
  let symbolRef = useRef(), condRef = useRef(), priceRef = useRef()
  let [error, setError] = useState('')

  async function loadAll() {
    try {
      let [aRes, nRes] = await Promise.all([
        axios.get("http://localhost:8080/alerts"),
        axios.get("http://localhost:8080/alerts/notifications")
      ])
      if (aRes.data.success) setAlerts(aRes.data.data)
      if (nRes.data.success) setNotifications(nRes.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function createAlert() {
    setError('')
    try {
      let res = await axios.post("http://localhost:8080/alerts", {
        symbol: symbolRef.current.value.toUpperCase(),
        condition: condRef.current.value,
        targetPrice: parseFloat(priceRef.current.value)
      })
      if (res.data.success == true) {
        symbolRef.current.value = ''; priceRef.current.value = ''; loadAll()
      } else setError(res.data.error)
    } catch { setError('Failed to create alert') }
  }

  async function deleteAlert(id) {
    try {
      await axios.delete(`http://localhost:8080/alerts/${id}`)
      loadAll()
    } catch {}
  }

  async function markRead(id) {
    try {
      await axios.put(`http://localhost:8080/alerts/notifications/${id}/read`)
      loadAll()
    } catch {}
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🔔 Alerts</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Get notified when stock prices hit your targets</p>

        {/* Create Alert */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Create Price Alert</h3>
          {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Symbol</label>
              <input ref={symbolRef} type="text" placeholder="MEBL" className="input-field" style={{ width: '120px', textTransform: 'uppercase' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Condition</label>
              <select ref={condRef} className="input-field" style={{ width: '120px' }}>
                <option value="ABOVE">Above</option>
                <option value="BELOW">Below</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Price (PKR)</label>
              <input ref={priceRef} type="number" placeholder="300" className="input-field" style={{ width: '140px' }} />
            </div>
            <button onClick={createAlert} className="btn-primary">+ Create Alert</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
          {[{ key: 'alerts', label: `Alerts (${alerts.length})` }, { key: 'notifs', label: `Notifications (${notifications.filter(n => !n.isRead).length} unread)` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 20px', background: tab === t.key ? '#16a34a' : '#232938', color: tab === t.key ? 'white' : '#94a3b8', border: `1px solid ${tab === t.key ? '#16a34a' : '#2d3347'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '4px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'alerts' && (
          loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading...</div> :
          alerts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
              <p style={{ color: '#64748b' }}>No alerts set. Create one above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map(alert => (
                <div key={alert._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>{alert.symbol}</span>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                      {alert.condition === 'ABOVE' ? '📈 Above' : '📉 Below'} PKR {alert.targetPrice.toLocaleString()}
                    </span>
                    <span style={{ background: alert.isActive ? '#14532d' : '#374151', color: alert.isActive ? '#86efac' : '#9ca3af', padding: '2px 10px', borderRadius: '12px', fontSize: '11px' }}>
                      {alert.isActive ? 'Active' : 'Triggered'}
                    </span>
                    {alert.triggeredAt && <span style={{ color: '#64748b', fontSize: '12px' }}>{new Date(alert.triggeredAt).toLocaleDateString()}</span>}
                  </div>
                  <button onClick={() => deleteAlert(alert._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>🗑</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'notifs' && (
          notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
              <p style={{ color: '#64748b' }}>No notifications yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => (
                <div key={n._id} className="card" style={{ opacity: n.isRead ? 0.6 : 1, borderLeft: n.isRead ? '3px solid #2d3347' : '3px solid #16a34a', padding: '14px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '4px' }}>{n.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>{n.message}</div>
                    </div>
                    {!n.isRead && <button onClick={() => markRead(n._id)} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '12px' }}>Mark read</button>}
                  </div>
                  <div style={{ color: '#475569', fontSize: '11px', marginTop: '8px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}

export default Alerts
