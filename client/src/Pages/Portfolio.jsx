import { useEffect, useRef, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'
import Layout from '../components/Layout'

let COLORS = ['#16a34a', '#22c55e', '#4ade80', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

function Portfolio() {
  let [portfolio, setPortfolio] = useState(null)
  let [loading, setLoading] = useState(true)
  let [addModal, setAddModal] = useState(false)
  let [error, setError] = useState('')
  let [addLoading, setAddLoading] = useState(false)

  // Stock symbol search
  let [allStocks, setAllStocks]         = useState([])
  let [symQuery, setSymQuery]           = useState('')
  let [symSelected, setSymSelected]     = useState(null)
  let [showSymDrop, setShowSymDrop]     = useState(false)
  let symDropRef = useRef()

  let qtyRef = useRef()
  let priceRef = useRef()

  let symFiltered = symQuery.length >= 1
    ? allStocks.filter(s =>
        s.symbol.toLowerCase().includes(symQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(symQuery.toLowerCase())
      ).slice(0, 8)
    : []

  async function loadPortfolio() {
    try {
      let res = await api.get("/portfolio")
      if (res.data.success) setPortfolio(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadPortfolio() }, [])

  // Load stock list once for the symbol dropdown
  useEffect(() => {
    api.get('/stocks').then(r => { if (r.data.success) setAllStocks(r.data.data) }).catch(() => {})
  }, [])

  // Close symbol dropdown on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (symDropRef.current && !symDropRef.current.contains(e.target)) setShowSymDrop(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleAdd() {
    const symbol = symSelected?.symbol || symQuery.trim().toUpperCase()
    if (!symbol) { setError('Please select a stock symbol'); return }
    setError(''); setAddLoading(true)
    try {
      let res = await api.post("/portfolio/holding", {
        symbol,
        quantity: parseFloat(qtyRef.current.value),
        avgBuyPrice: parseFloat(priceRef.current.value)
      })
      if (res.data.success == true) {
        setAddModal(false)
        setSymQuery(''); setSymSelected(null)
        loadPortfolio()
      } else {
        setError(res.data.error)
      }
    } catch (e) { setError('Failed to add holding') }
    setAddLoading(false)
  }

  async function handleRemove(symbol) {
    if (!window.confirm(`Remove ${symbol} from portfolio?`)) return
    try {
      let res = await api.delete(`/portfolio/holding/${symbol}`)
      if (res.data.success == true) loadPortfolio()
    } catch {}
  }

  let metrics = portfolio?.metrics
  let holdings = portfolio?.portfolio?.holdings || []
  let pieData = holdings.map(h => ({ name: h.symbol, value: Math.round(h.currentValue || h.totalInvested) }))

  return (
    <Layout>
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '12px' }}>
        <div>
          <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, margin: 0 }}>My Portfolio</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Track your PSX investments</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary mobile-full">+ Add Holding</button>
      </div>

      {/* Metrics */}
      <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Invested',   value: metrics ? `PKR ${metrics.totalInvested?.toLocaleString()}` : '—' },
          { label: 'Current Value',    value: metrics ? `PKR ${metrics.currentValue?.toLocaleString()}`  : '—' },
          { label: 'Profit / Loss',    value: metrics ? `PKR ${metrics.totalProfitLoss?.toLocaleString()}`: '—', colored: true, val: metrics?.totalProfitLoss },
          { label: 'ROI',              value: metrics ? `${metrics.roi}%` : '—',                          colored: true, val: metrics?.roi },
          { label: 'Annual Dividend',  value: metrics ? `PKR ${metrics.estimatedAnnualDividend?.toLocaleString()}` : '—' },
        ].map(m => (
          <div key={m.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: m.colored ? (m.val >= 0 ? 'var(--success)' : 'var(--danger)') : 'var(--white)' }}>
              {loading ? '—' : m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>
        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Stock Allocation</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>No holdings yet</div>
          )}
        </div>

        {/* Holdings Table */}
        <div className="card">
          <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Holdings</h3>
          {holdings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>💼</div>
              <p>No holdings yet. Click <strong>+ Add Holding</strong> to start.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>{['Symbol','Qty','Buy Price','Curr Price','P&L','P&L %',''].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {holdings.map(h => (
                    <tr key={h.symbol}>
                      <td style={{ color: 'var(--lime)', fontWeight: 700 }}>{h.symbol}</td>
                      <td style={{ color: 'var(--white)' }}>{h.quantity}</td>
                      <td style={{ color: 'var(--white)' }}>{h.avgBuyPrice?.toLocaleString()}</td>
                      <td style={{ color: 'var(--white)' }}>{h.currentPrice?.toLocaleString() || '—'}</td>
                      <td style={{ color: h.profitLoss >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                        {h.profitLoss >= 0 ? '+' : ''}{h.profitLoss?.toLocaleString()}
                      </td>
                      <td style={{ color: h.profitLossPct >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                        {h.profitLossPct >= 0 ? '+' : ''}{h.profitLossPct}%
                      </td>
                      <td>
                        <button onClick={() => handleRemove(h.symbol)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '16px' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card modal-card" style={{ width: '420px' }}>
            <h3 style={{ color: 'var(--white)', marginTop: 0 }}>Add Holding</h3>
            {error && <div className="alert-error" style={{ marginBottom: '12px' }}><span>⚠</span> {error}</div>}

            {/* Stock symbol search */}
            <div style={{ marginBottom: '14px', position: 'relative' }} ref={symDropRef}>
              <label className="field-label">Stock Symbol</label>
              <input
                value={symQuery}
                onChange={e => { setSymQuery(e.target.value.toUpperCase()); setSymSelected(null); setShowSymDrop(true) }}
                onFocus={() => setShowSymDrop(true)}
                placeholder="Search symbol or name… (e.g. MEBL)"
                className="input-field"
              />
              {symSelected && (
                <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                  ✓ {symSelected.name} — {symSelected.sector}
                </div>
              )}
              {showSymDrop && symFiltered.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 400,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '10px', marginTop: '4px', overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {symFiltered.map(s => (
                    <div key={s.symbol}
                      onMouseDown={() => { setSymSelected(s); setSymQuery(s.symbol); setShowSymDrop(false) }}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '1px solid var(--border)',
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

            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Quantity</label>
              <input ref={qtyRef} type="number" placeholder="100" className="input-field" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Average Buy Price (PKR)</label>
              <input ref={priceRef} type="number" placeholder="284" className="input-field" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAdd} disabled={addLoading} className="btn-primary" style={{ flex: 1 }}>{addLoading ? 'Adding...' : 'Add'}</button>
              <button onClick={() => { setAddModal(false); setSymQuery(''); setSymSelected(null) }} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Portfolio
