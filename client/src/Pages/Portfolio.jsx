import { useEffect, useRef, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

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
      let res = await axios.get("http://localhost:8080/portfolio")
      if (res.data.success) setPortfolio(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadPortfolio() }, [])

  async function handleAdd() {
    setError(''); setAddLoading(true)
    try {
      let res = await axios.post("http://localhost:8080/portfolio/holding", {
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
      let res = await axios.delete(`http://localhost:8080/portfolio/holding/${symbol}`)
      if (res.data.success == true) loadPortfolio()
    } catch {}
  }

  let metrics = portfolio?.metrics
  let holdings = portfolio?.portfolio?.holdings || []
  let pieData = holdings.map(h => ({ name: h.symbol, value: Math.round(h.currentValue || h.totalInvested) }))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, margin: 0 }}>My Portfolio</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Track your PSX investments</p>
          </div>
          <button onClick={() => setAddModal(true)} className="btn-primary">+ Add Holding</button>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Invested', value: metrics ? `PKR ${metrics.totalInvested?.toLocaleString()}` : '—' },
            { label: 'Current Value', value: metrics ? `PKR ${metrics.currentValue?.toLocaleString()}` : '—' },
            { label: 'Profit / Loss', value: metrics ? `PKR ${metrics.totalProfitLoss?.toLocaleString()}` : '—', colored: true, val: metrics?.totalProfitLoss },
            { label: 'ROI', value: metrics ? `${metrics.roi}%` : '—', colored: true, val: metrics?.roi },
            { label: 'Annual Dividend', value: metrics ? `PKR ${metrics.estimatedAnnualDividend?.toLocaleString()}` : '—' },
          ].map(m => (
            <div key={m.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: m.colored ? (m.val >= 0 ? '#22c55e' : '#ef4444') : '#e2e8f0' }}>
                {loading ? '...' : m.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>
          {/* Pie Chart */}
          <div className="card">
            <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Stock Allocation</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: '#232938', border: '1px solid #2d3347' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>No holdings yet</div>
            )}
          </div>

          {/* Holdings Table */}
          <div className="card">
            <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Holdings</h3>
            {holdings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>💼</div>
                <p>No holdings yet. Click <strong>+ Add Holding</strong> to start.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2d3347' }}>
                      {['Symbol', 'Qty', 'Buy Price', 'Curr Price', 'P&L', 'P&L %', ''].map(h => (
                        <th key={h} style={{ color: '#64748b', padding: '8px 10px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(h => (
                      <tr key={h.symbol} style={{ borderBottom: '1px solid #1a1f2e' }}>
                        <td style={{ padding: '10px', color: '#22c55e', fontWeight: 600 }}>{h.symbol}</td>
                        <td style={{ padding: '10px', color: '#e2e8f0' }}>{h.quantity}</td>
                        <td style={{ padding: '10px', color: '#e2e8f0' }}>{h.avgBuyPrice?.toLocaleString()}</td>
                        <td style={{ padding: '10px', color: '#e2e8f0' }}>{h.currentPrice?.toLocaleString() || '—'}</td>
                        <td style={{ padding: '10px', color: h.profitLoss >= 0 ? '#22c55e' : '#ef4444' }}>
                          {h.profitLoss >= 0 ? '+' : ''}{h.profitLoss?.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px', color: h.profitLossPct >= 0 ? '#22c55e' : '#ef4444' }}>
                          {h.profitLossPct >= 0 ? '+' : ''}{h.profitLossPct}%
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button onClick={() => handleRemove(h.symbol)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>🗑</button>
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div className="card" style={{ width: '400px' }}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>Add Holding</h3>
              {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}
              {[
                { ref: symbolRef, label: 'Stock Symbol (e.g. MEBL)', placeholder: 'MEBL' },
                { ref: qtyRef, label: 'Quantity', placeholder: '100' },
                { ref: priceRef, label: 'Average Buy Price (PKR)', placeholder: '284' }
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{f.label}</label>
                  <input ref={f.ref} type={f.label.includes('Qty') || f.label.includes('Price') ? 'number' : 'text'}
                    placeholder={f.placeholder} className="input-field" />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAdd} disabled={addLoading} className="btn-primary" style={{ flex: 1 }}>
                  {addLoading ? 'Adding...' : 'Add'}
                </button>
                <button onClick={() => setAddModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Portfolio
