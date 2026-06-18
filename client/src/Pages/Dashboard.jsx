import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

let COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']

function Dashboard() {
  let [portfolio, setPortfolio] = useState(null)
  let [stocks, setStocks] = useState([])
  let [prices, setPrices] = useState([])
  let [loading, setLoading] = useState(true)
  let navigate = useNavigate()
  let user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    async function load() {
      try {
        let [portRes, stockRes, priceRes] = await Promise.all([
          axios.get("http://localhost:8080/portfolio"),
          axios.get("http://localhost:8080/stocks"),
          axios.get("http://localhost:8080/stocks/prices")
        ])
        if (portRes.data.success) setPortfolio(portRes.data.data)
        if (stockRes.data.success) setStocks(stockRes.data.data)
        if (priceRes.data.success) setPrices(priceRes.data.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  let metrics = portfolio?.metrics
  let holdings = portfolio?.portfolio?.holdings || []

  let sectorData = holdings.reduce((acc, h) => {
    let sector = h.stock?.sector || h.symbol
    acc[sector] = (acc[sector] || 0) + (h.currentValue || h.totalInvested)
    return acc
  }, {})
  let pieData = Object.entries(sectorData).map(([name, value]) => ({ name, value: Math.round(value) }))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, margin: 0 }}>
            Welcome back, {user.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Here's your investment summary for today.</p>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Invested', value: metrics ? `PKR ${metrics.totalInvested?.toLocaleString()}` : 'N/A', icon: '💰' },
            { label: 'Current Value', value: metrics ? `PKR ${metrics.currentValue?.toLocaleString()}` : 'N/A', icon: '📈' },
            { label: 'Profit / Loss', value: metrics ? `PKR ${metrics.totalProfitLoss?.toLocaleString()}` : 'N/A', icon: metrics?.totalProfitLoss >= 0 ? '✅' : '❌', positive: metrics?.totalProfitLoss >= 0 },
            { label: 'ROI', value: metrics ? `${metrics.roi}%` : 'N/A', icon: '🎯', positive: metrics?.roi >= 0 },
          ].map(card => (
            <div key={card.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>{card.label}</div>
              <div style={{ color: card.positive === false ? '#ef4444' : card.positive === true ? '#22c55e' : '#e2e8f0', fontSize: '18px', fontWeight: 700 }}>
                {loading ? '...' : card.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
          {/* Sector Allocation */}
          <div className="card">
            <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Sector Allocation</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: '#232938', border: '1px solid #2d3347', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💼</div>
                No holdings yet.{' '}
                <span style={{ color: '#16a34a', cursor: 'pointer' }} onClick={() => navigate('/portfolio')}>Add holdings</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: '🤖 Get AI Picks', path: '/recommendations', color: '#16a34a' },
                { label: '💼 Add Holdings', path: '/portfolio', color: '#3b82f6' },
                { label: '🧮 Calculators', path: '/calculators', color: '#8b5cf6' },
                { label: '⭐ Watchlist', path: '/watchlist', color: '#f59e0b' },
                { label: '📰 Market News', path: '/news', color: '#06b6d4' },
                { label: '🛡️ Risk Analyzer', path: '/risk-analyzer', color: '#ec4899' },
              ].map(action => (
                <button key={action.path} onClick={() => navigate(action.path)}
                  style={{ padding: '12px', background: '#1a1f2e', border: `1px solid ${action.color}33`, borderRadius: '8px', color: action.color, cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s' }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Stocks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: '16px' }}>PSX Market — Top Stocks</h3>
            <button onClick={() => navigate('/compare')} style={{ background: 'none', border: '1px solid #2d3347', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Compare Stocks</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2d3347' }}>
                  {['Symbol', 'Name', 'Sector', 'Price (PKR)', 'Change', 'Div Yield', 'Risk'].map(h => (
                    <th key={h} style={{ color: '#64748b', padding: '8px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.slice(0, 10).map(s => (
                  <tr key={s.symbol} style={{ borderBottom: '1px solid #1a1f2e', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2d3347'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 600 }}>{s.symbol}</td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{s.name}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{s.sector}</td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{s.currentPrice ? s.currentPrice.toLocaleString() : '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={s.changePct >= 0 ? 'positive' : 'negative'}>
                        {s.changePct != null ? `${s.changePct >= 0 ? '+' : ''}${s.changePct}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#f59e0b' }}>{s.avgDividendYield ? `${s.avgDividendYield}%` : '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge-${s.riskLevel?.toLowerCase()}`}>{s.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
