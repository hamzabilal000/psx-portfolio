import { useEffect, useState } from 'react'
import api from '../api'
import Layout from '../components/Layout'

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
      let res = await api.get('/transactions', { params })
      if (res.data.success) setData(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  let { transactions, summary } = data

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📋 Transaction History</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Complete record of your buy/sell transactions</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Bought', value: `PKR ${summary.totalBought?.toLocaleString() || 0}`, color: 'var(--success)' },
          { label: 'Total Sold',   value: `PKR ${summary.totalSold?.toLocaleString() || 0}`,   color: 'var(--danger)' },
          { label: 'Net Invested', value: `PKR ${summary.netInvested?.toLocaleString() || 0}`, color: 'var(--white)' },
        ].map(m => (
          <div key={m.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: '20px', fontWeight: 700 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Filter by Symbol</label>
          <input type="text" placeholder="e.g. MEBL" className="input-field"
            onChange={e => setFilter(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} style={{ textTransform: 'uppercase' }} />
        </div>
        <div>
          <label className="field-label">Type</label>
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
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <p style={{ color: 'var(--muted)' }}>No transactions yet. Add holdings from Portfolio page.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>{['Date', 'Symbol', 'Type', 'Qty', 'Price', 'Total', 'Brokerage'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td style={{ color: 'var(--muted)' }}>{new Date(t.executedAt).toLocaleDateString()}</td>
                    <td><span style={{ color: 'var(--lime)', fontWeight: 700 }}>{t.symbol}</span></td>
                    <td>
                      <span style={{
                        background: t.type === 'BUY' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: t.type === 'BUY' ? 'var(--success)' : 'var(--danger)',
                        padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--white)' }}>{t.quantity}</td>
                    <td style={{ color: 'var(--white)' }}>PKR {t.price.toLocaleString()}</td>
                    <td style={{ color: 'var(--white)', fontWeight: 600 }}>PKR {t.totalAmount.toLocaleString()}</td>
                    <td style={{ color: 'var(--muted)' }}>{t.brokerageFee ? `PKR ${t.brokerageFee}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Transactions
