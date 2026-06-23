import { useEffect, useRef, useState } from 'react'
import api from '../api'
import Layout from '../components/Layout'

function Watchlist() {
  let [items, setItems]   = useState([])
  let [stocks, setStocks] = useState([])
  let [query, setQuery]   = useState('')
  let [showDrop, setShowDrop] = useState(false)
  let [loading, setLoading]   = useState(true)
  let [adding, setAdding]     = useState(false)
  let [selected, setSelected] = useState(null)
  let dropRef = useRef()

  async function load() {
    try {
      let [wlRes, stRes] = await Promise.all([api.get('/watchlist'), api.get('/stocks')])
      if (wlRes.data.success) setItems(wlRes.data.data)
      if (stRes.data.success) setStocks(stRes.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  let filtered = query.length >= 1
    ? stocks.filter(s =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  function selectStock(s) {
    setSelected(s)
    setQuery(`${s.symbol} — ${s.name}`)
    setShowDrop(false)
  }

  async function handleAdd() {
    const symbol = selected?.symbol || query.trim().toUpperCase()
    if (!symbol) return
    setAdding(true)
    try {
      let res = await api.post('/watchlist', { symbol })
      if (res.data.success) { setQuery(''); setSelected(null); load() }
      else if (res.data.code === 11000) alert('Already in watchlist')
      else alert(res.data.error || 'Stock not found')
    } catch { alert('Failed to add') }
    setAdding(false)
  }

  async function handleRemove(symbol) {
    try { await api.delete(`/watchlist/${symbol}`); load() } catch {}
  }

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>⭐ Watchlist</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Track stocks you're interested in</p>

      {/* Add row */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }} ref={dropRef}>
          <label className="field-label">Search Stock</label>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setShowDrop(true) }}
            onFocus={() => query && setShowDrop(true)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Type symbol or name…"
            className="input-field"
            style={{ textTransform: 'uppercase' }}
          />
          {showDrop && filtered.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', marginTop: '4px', overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {filtered.map(s => (
                <div key={s.symbol} onMouseDown={() => selectStock(s)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <span style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '13px' }}>{s.symbol}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '12px', marginLeft: '8px' }}>{s.name}</span>
                  </div>
                  <span className="chip" style={{ fontSize: '10px' }}>{s.sector}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleAdd} disabled={adding} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          {adding ? 'Adding…' : '+ Add to Watchlist'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px' }}>Loading…</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
          <p style={{ color: 'var(--muted)' }}>Your watchlist is empty. Add stocks above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {items.map(item => {
            const s = item.stock
            return (
              <div key={item.symbol} className="card hover-lift" style={{ position: 'relative' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '20px', lineHeight: 1 }}>{item.symbol}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '3px' }}>{s?.name || '—'}</div>
                  </div>
                  <button onClick={() => handleRemove(item.symbol)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px', borderRadius: '6px' }}>×</button>
                </div>

                {/* Price row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Current Price</div>
                    <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '15px' }}>
                      {item.currentPrice ? `PKR ${item.currentPrice.toLocaleString()}` : '—'}
                    </div>
                    {item.changePct != null && (
                      <div style={{ color: item.changePct >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>
                        {item.changePct >= 0 ? '▲' : '▼'} {Math.abs(item.changePct)}%
                        {item.changeAmt != null && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> ({item.changeAmt >= 0 ? '+' : ''}{item.changeAmt})</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Dividend Yield</div>
                    <div style={{ color: s?.avgDividendYield > 0 ? 'var(--warn)' : 'var(--muted)', fontWeight: 700, fontSize: '15px' }}>
                      {s?.avgDividendYield > 0 ? `${s.avgDividendYield}%` : '—'}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>Annual</div>
                  </div>
                </div>

                {/* Last Buy / Last Sell */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ color: 'var(--success)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Last Buy</div>
                    {item.lastBuy ? (
                      <>
                        <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '14px' }}>PKR {item.lastBuy.price.toLocaleString()}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', marginTop: '2px' }}>
                          {new Date(item.lastBuy.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No buy</div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Last Sell</div>
                    {item.lastSell ? (
                      <>
                        <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '14px' }}>PKR {item.lastSell.price.toLocaleString()}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '10px', marginTop: '2px' }}>
                          {new Date(item.lastSell.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No sell</div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {s?.sector && <span className="chip">{s.sector}</span>}
                  {s?.riskLevel && <span className={`badge-${s.riskLevel.toLowerCase()}`}>{s.riskLevel} Risk</span>}
                  {s?.avgPeRatio && <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 600 }}>P/E {s.avgPeRatio}x</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

export default Watchlist
