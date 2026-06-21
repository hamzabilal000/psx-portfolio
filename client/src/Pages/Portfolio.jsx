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
  let symbolRef = useRef()
  let qtyRef = useRef()
  let priceRef = useRef()

  async function loadPortfolio() {
    try {
      let res = await api.get("/portfolio")
      if (res.data.success) setPortfolio(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadPortfolio() }, [])

  async function handleAdd() {
    setError(''); setAddLoading(true)
    try {
      let res = await api.post("/portfolio/holding", {
        symbol: symbolRef.current.value,
        quantity: parseFloat(qtyRef.current.value),
        avgBuyPrice: parseFloat(priceRef.current.value)
      })
      if (res.data.success == true) {
        setAddModal(false)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, margin: 0 }}>My Portfolio</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Track your PSX investments</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary">+ Add Holding</button>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>
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
          <div className="card" style={{ width: '400px' }}>
            <h3 style={{ color: 'var(--white)', marginTop: 0 }}>Add Holding</h3>
            {error && <div className="alert-error" style={{ marginBottom: '12px' }}><span>⚠</span> {error}</div>}
            {[
              { ref: symbolRef, label: 'Stock Symbol (e.g. MEBL)', placeholder: 'MEBL', type: 'text' },
              { ref: qtyRef,    label: 'Quantity',                  placeholder: '100',  type: 'number' },
              { ref: priceRef,  label: 'Average Buy Price (PKR)',   placeholder: '284',  type: 'number' }
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '14px' }}>
                <label className="field-label">{f.label}</label>
                <input ref={f.ref} type={f.type} placeholder={f.placeholder} className="input-field" />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAdd} disabled={addLoading} className="btn-primary" style={{ flex: 1 }}>{addLoading ? 'Adding...' : 'Add'}</button>
              <button onClick={() => setAddModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Portfolio
