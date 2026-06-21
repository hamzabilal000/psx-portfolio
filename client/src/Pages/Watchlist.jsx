import { useEffect, useRef, useState } from 'react'
import api from '../api'
import Layout from '../components/Layout'

function Watchlist() {
  let [items, setItems] = useState([])
  let [loading, setLoading] = useState(true)
  let [adding, setAdding] = useState(false)
  let symbolRef = useRef()

  async function load() {
    try {
      let res = await api.get("/watchlist")
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
      let res = await api.post("/watchlist", { symbol })
      if (res.data.success == true) { symbolRef.current.value = ''; load() }
      else if (res.data.code == 11000) alert('Already in watchlist')
      else alert(res.data.error)
    } catch { alert('Failed to add') }
    setAdding(false)
  }

  async function handleRemove(symbol) {
    try {
      await api.delete(`/watchlist/${symbol}`)
      load()
    } catch {}
  }

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>⭐ Watchlist</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Track stocks you're interested in</p>

      {/* Add */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Add Stock Symbol</label>
          <input ref={symbolRef} type="text" placeholder="e.g. MEBL, HBL, SYS" className="input-field"
            onKeyDown={e => e.key === 'Enter' && handleAdd()} style={{ textTransform: 'uppercase' }} />
        </div>
        <button onClick={handleAdd} disabled={adding} className="btn-primary">
          {adding ? 'Adding...' : '+ Add to Watchlist'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
          <p style={{ color: 'var(--muted)' }}>Your watchlist is empty. Add stocks above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {items.map(item => (
            <div key={item.symbol} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '18px' }}>{item.symbol}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{item.stock?.name}</div>
                </div>
                <button onClick={() => handleRemove(item.symbol)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>PRICE</div>
                  <div style={{ color: 'var(--white)', fontWeight: 600 }}>{item.currentPrice ? `PKR ${item.currentPrice.toLocaleString()}` : '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>CHANGE</div>
                  <div className={item.changePct >= 0 ? 'positive' : 'negative'}>
                    {item.changePct != null ? `${item.changePct >= 0 ? '+' : ''}${item.changePct}%` : '—'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="chip">{item.stock?.sector}</span>
                {item.stock?.riskLevel && <span className={`badge-${item.stock.riskLevel.toLowerCase()}`}>{item.stock.riskLevel}</span>}
                {item.stock?.avgDividendYield > 0 && (
                  <span style={{ color: 'var(--warn)', fontSize: '11px', fontWeight: 600 }}>💰 {item.stock.avgDividendYield}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default Watchlist
