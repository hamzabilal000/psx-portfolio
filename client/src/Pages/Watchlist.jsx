import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

function Watchlist() {
  let [items, setItems] = useState([])
  let [loading, setLoading] = useState(true)
  let [adding, setAdding] = useState(false)
  let symbolRef = useRef()

  async function load() {
    try {
      let res = await axios.get("http://localhost:8080/watchlist")
      if (res.data.success) setItems(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    let symbol = symbolRef.current.value.trim().toUpperCase()
    if (!symbol) return
    setAdding(true)
    try {
      let res = await axios.post("http://localhost:8080/watchlist", { symbol })
      if (res.data.success == true) { symbolRef.current.value = ''; load() }
      else if (res.data.code == 11000) alert('Already in watchlist')
      else alert(res.data.error)
    } catch { alert('Failed to add') }
    setAdding(false)
  }

  async function handleRemove(symbol) {
    try {
      await axios.delete(`http://localhost:8080/watchlist/${symbol}`)
      load()
    } catch {}
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>⭐ Watchlist</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Track stocks you're interested in</p>

        {/* Add */}
        <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Add Stock Symbol</label>
            <input ref={symbolRef} type="text" placeholder="e.g. MEBL, HBL, SYS" className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleAdd()} style={{ textTransform: 'uppercase' }} />
          </div>
          <button onClick={handleAdd} disabled={adding} className="btn-primary">
            {adding ? 'Adding...' : '+ Add to Watchlist'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
            <p style={{ color: '#64748b' }}>Your watchlist is empty. Add stocks above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {items.map(item => (
              <div key={item.symbol} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '18px' }}>{item.symbol}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{item.stock?.name}</div>
                  </div>
                  <button onClick={() => handleRemove(item.symbol)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>PRICE</div>
                    <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.currentPrice ? `PKR ${item.currentPrice.toLocaleString()}` : '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>CHANGE</div>
                    <div className={item.changePct >= 0 ? 'positive' : 'negative'}>
                      {item.changePct != null ? `${item.changePct >= 0 ? '+' : ''}${item.changePct}%` : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#1a1f2e', color: '#94a3b8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                    {item.stock?.sector}
                  </span>
                  {item.stock?.riskLevel && <span className={`badge-${item.stock.riskLevel.toLowerCase()}`}>{item.stock.riskLevel}</span>}
                  {item.stock?.avgDividendYield > 0 && (
                    <span style={{ color: '#f59e0b', fontSize: '11px' }}>💰 {item.stock.avgDividendYield}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Watchlist
