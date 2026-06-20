import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
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
        axios.get('http://localhost:8080/alerts'),
        axios.get('http://localhost:8080/alerts/notifications')
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
      let res = await axios.post('http://localhost:8080/alerts', {
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
    try { await axios.delete(`http://localhost:8080/alerts/${id}`); loadAll() } catch {}
  }

  async function markRead(id) {
    try { await axios.put(`http://localhost:8080/alerts/notifications/${id}/read`); loadAll() } catch {}
  }

  let unread = notifications.filter(n => !n.isRead).length

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🔔 Alerts</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Get notified when stock prices hit your targets</p>

      {/* Create Alert */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Create Price Alert</h3>
        {error && <div className="alert-error" style={{ marginBottom: '12px' }}><span>⚠</span> {error}</div>}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="field-label">Symbol</label>
            <input ref={symbolRef} type="text" placeholder="MEBL" className="input-field" style={{ width: '120px', textTransform: 'uppercase' }} />
          </div>
          <div>
            <label className="field-label">Condition</label>
            <select ref={condRef} className="input-field" style={{ width: '120px' }}>
              <option value="ABOVE">Above</option>
              <option value="BELOW">Below</option>
            </select>
          </div>
          <div>
            <label className="field-label">Price (PKR)</label>
            <input ref={priceRef} type="number" placeholder="300" className="input-field" style={{ width: '140px' }} />
          </div>
          <button onClick={createAlert} className="btn-primary">+ Create Alert</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'alerts', label: `Alerts (${alerts.length})` },
          { key: 'notifs', label: `Notifications (${unread} unread)` },
        ].map(t => (
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

      {tab === 'alerts' && (
        loading
          ? <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading...</div>
          : alerts.length === 0
            ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
                <p style={{ color: 'var(--muted)' }}>No alerts set. Create one above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map(alert => (
                  <div key={alert._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '16px' }}>{alert.symbol}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
                        {alert.condition === 'ABOVE' ? '📈 Above' : '📉 Below'} PKR {alert.targetPrice.toLocaleString()}
                      </span>
                      <span style={{
                        background: alert.isActive ? 'var(--success-bg)' : 'var(--bg-hover)',
                        color: alert.isActive ? 'var(--success)' : 'var(--muted)',
                        padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600
                      }}>
                        {alert.isActive ? 'Active' : 'Triggered'}
                      </span>
                      {alert.triggeredAt && <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(alert.triggeredAt).toLocaleDateString()}</span>}
                    </div>
                    <button onClick={() => deleteAlert(alert._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '18px' }}>🗑</button>
                  </div>
                ))}
              </div>
            )
      )}

      {tab === 'notifs' && (
        notifications.length === 0
          ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
              <p style={{ color: 'var(--muted)' }}>No notifications yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => (
                <div key={n._id} className="card" style={{
                  opacity: n.isRead ? 0.6 : 1,
                  borderLeft: `3px solid ${n.isRead ? 'var(--border)' : 'var(--lime)'}`,
                  padding: '14px 20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: '4px' }}>{n.title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{n.message}</div>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--lime)', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', fontWeight: 600 }}>
                        Mark read
                      </button>
                    )}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )
      )}
    </Layout>
  )
}

export default Alerts
