import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

let COLORS = ['#16a34a', '#22c55e', '#4ade80', '#f59e0b', '#3b82f6', '#8b5cf6']

function Recommendations() {
  let [rec, setRec] = useState(null)
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState('')
  let navigate = useNavigate()

  async function fetchRecommendations() {
    setError(''); setLoading(true)
    try {
      let res = await axios.get("http://localhost:8080/ai")
      if (res.data.success == true) {
        setRec(res.data.data)
      } else {
        setError(res.data.error)
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to get recommendations')
    }
    setLoading(false)
  }

  useEffect(() => { fetchRecommendations() }, [])

  let items = rec?.recommendation?.items || []
  let pieData = items.map(i => ({ name: i.symbol, value: i.allocationPct }))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, margin: 0 }}>🤖 AI Stock Recommendations</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Personalized picks based on your investor profile</p>
          </div>
          <button onClick={fetchRecommendations} disabled={loading} className="btn-primary">
            {loading ? 'Analyzing...' : '🔄 Refresh Picks'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
            {error.includes('risk profile') && (
              <button onClick={() => navigate('/profile')} style={{ marginLeft: '12px', background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                Complete Profile
              </button>
            )}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <p style={{ color: '#94a3b8' }}>AI is analyzing stocks for your profile...</p>
          </div>
        )}

        {rec && !loading && (
          <>
            {/* Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Investment', value: `PKR ${rec.recommendation.totalInvestment?.toLocaleString()}` },
                { label: 'Expected Return', value: `${rec.recommendation.expectedReturnMin}–${rec.recommendation.expectedReturnMax}%` },
                { label: 'Annual Dividend', value: `PKR ${rec.recommendation.expectedAnnualDividend?.toLocaleString()}` },
                { label: 'Portfolio Risk', value: `${rec.recommendation.portfolioRiskScore}/100` },
              ].map(m => (
                <div key={m.label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '6px' }}>{m.label}</div>
                  <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            {rec.recommendation.aiSummary && (
              <div className="card" style={{ marginBottom: '24px', background: '#14532d20', border: '1px solid #16a34a44' }}>
                <p style={{ color: '#86efac', margin: 0, fontSize: '14px', lineHeight: 1.7 }}>
                  💡 <strong>AI Insight:</strong> {rec.recommendation.aiSummary}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
              {/* Pie */}
              <div className="card">
                <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Recommended Allocation</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                      label={({ name, value }) => `${name} ${value}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `${v}%`} contentStyle={{ background: '#232938', border: '1px solid #2d3347' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stock Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, idx) => (
                  <div key={item.symbol} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>{item.symbol}</span>
                        <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '8px' }}>{item.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#f59e0b', fontWeight: 700 }}>{item.allocationPct}%</div>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>PKR {item.amountPkr?.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ background: '#1a1f2e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#94a3b8' }}>{item.sector}</span>
                      <span className={`badge-${item.riskLevel?.toLowerCase()}`}>{item.riskLevel}</span>
                      <span style={{ color: '#22c55e', fontSize: '12px' }}>📈 {item.expectedReturn}% return</span>
                      <span style={{ color: '#f59e0b', fontSize: '12px' }}>💰 {item.dividendYield}% div</span>
                    </div>
                    {item.reason && (
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                        {item.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Recommendations
