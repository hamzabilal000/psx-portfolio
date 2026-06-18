import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

function Transactions() {
  let [data, setData] = useState({ transactions: [], summary: {} })
  let [loading, setLoading] = useState(true)
  let [filter, setFilter] = useState({ symbol: '', type: '' })

  async function load() {
    setLoading(true)
    try {
      let params = {}
      if (filter.symbol) params.symbol = filter.symbol
      if (filter.type) params.type = filter.type
      let res = await axios.get("http://localhost:8080/transactions", { params })
      if (res.data.success) setData(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  let { transactions, summary } = data

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📋 Transaction History</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Complete record of your buy/sell transactions</p>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Bought', value: `PKR ${summary.totalBought?.toLocaleString() || 0}`, color: '#22c55e' },
            { label: 'Total Sold', value: `PKR ${summary.totalSold?.toLocaleString() || 0}`, color: '#ef4444' },
            { label: 'Net Invested', value: `PKR ${summary.netInvested?.toLocaleString() || 0}`, color: '#e2e8f0' },
          ].map(m => (
            <div key={m.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: '18px', fontWeight: 700 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Filter by Symbol</label>
            <input type="text" placeholder="e.g. MEBL" className="input-field"
              onChange={e => setFilter(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} style={{ textTransform: 'uppercase' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Type</label>
            <select className="input-field" onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
              <option value="">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading...</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <p style={{ color: '#64748b' }}>No transactions yet. Add holdings from Portfolio page.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d3347' }}>
                    {['Date', 'Symbol', 'Type', 'Qty', 'Price', 'Total', 'Brokerage'].map(h => (
                      <th key={h} style={{ color: '#64748b', padding: '8px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #1a1f2e' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(t.executedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 600 }}>{t.symbol}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: t.type === 'BUY' ? '#14532d' : '#7f1d1d', color: t.type === 'BUY' ? '#86efac' : '#fca5a5', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{t.quantity}</td>
                      <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>PKR {t.price.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 600 }}>PKR {t.totalAmount.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{t.brokerageFee ? `PKR ${t.brokerageFee}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Transactions
