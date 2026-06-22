import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import api, { aiSleeping } from '../api'
import Layout from '../components/Layout'
import AIThinking from '../components/AIThinking'
import WakeUpAI from '../components/WakeUpAI'

let COLORS = ['#b9ff66', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185', '#34d399']

function Recommendations() {
  let [rec, setRec] = useState(null)
  let [loading, setLoading]   = useState(false)
  let [error, setError]       = useState('')
  let [sleeping, setSleeping] = useState(false)
  let navigate = useNavigate()

  async function fetchRecommendations() {
    setError(''); setLoading(true); setSleeping(false)
    try {
      let res = await api.get('/ai')
      if (res.data.success == true) setRec(res.data.data)
      else if (res.data.sleeping) setSleeping(true)
      else setError(res.data.error || 'Failed to get recommendations')
    } catch (e) {
      if (aiSleeping(e)) setSleeping(true)
      else setError(e.response?.data?.error || 'Failed to get recommendations. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => { fetchRecommendations() }, [])

  let items = rec?.recommendation?.items || []
  let pieData = items.map(i => ({ name: i.symbol, value: i.allocationPct }))

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, margin: 0 }}>🤖 AI Stock Recommendations</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Personalized picks based on your investor profile</p>
        </div>
        <button onClick={fetchRecommendations} disabled={loading} className="btn-primary">
          {loading ? 'Analyzing...' : '🔄 Refresh Picks'}
        </button>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '20px' }}>
          <span>⚠</span> {error}
          {error.includes('risk profile') && (
            <button onClick={() => navigate('/profile')}
              style={{ marginLeft: '12px', background: 'var(--lime)', color: '#0d0d0d', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}>
              Complete Profile
            </button>
          )}
        </div>
      )}

      {loading && <AIThinking mode="full" label="AI is building your portfolio" />}
      {sleeping && !loading && <WakeUpAI onReady={() => { setSleeping(false); fetchRecommendations() }} />}

      {rec && !loading && (
        <>
          {/* Summary Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Investment',      value: `PKR ${rec.recommendation.totalInvestment?.toLocaleString()}` },
              { label: 'Expected Return', value: `${rec.recommendation.expectedReturnMin}–${rec.recommendation.expectedReturnMax}%` },
              { label: 'Annual Dividend', value: `PKR ${rec.recommendation.expectedAnnualDividend?.toLocaleString()}` },
              { label: 'Portfolio Risk',  value: `${rec.recommendation.portfolioRiskScore}/100` },
            ].map(m => (
              <div key={m.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--muted)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
                <div style={{ color: 'var(--lime)', fontSize: '18px', fontWeight: 700 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          {rec.recommendation.aiSummary && (
            <div className="card" style={{ marginBottom: '24px', background: 'var(--success-bg)', border: '1px solid rgba(185,255,102,0.2)' }}>
              <p style={{ color: 'var(--lime)', margin: 0, fontSize: '14px', lineHeight: 1.7 }}>
                💡 <strong>AI Insight:</strong> {rec.recommendation.aiSummary}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
            {/* Pie */}
            <div className="card">
              <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Recommended Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, value }) => `${name} ${value}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(item => (
                <div key={item.symbol} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '16px' }}>{item.symbol}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '13px', marginLeft: '8px' }}>{item.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--warn)', fontWeight: 700 }}>{item.allocationPct}%</div>
                      <div style={{ color: 'var(--muted)', fontSize: '12px' }}>PKR {item.amountPkr?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span className="chip">{item.sector}</span>
                    <span className={`badge-${item.riskLevel?.toLowerCase()}`}>{item.riskLevel}</span>
                    <span style={{ color: 'var(--success)', fontSize: '12px' }}>📈 {item.expectedReturn}% return</span>
                    <span style={{ color: 'var(--warn)', fontSize: '12px' }}>💰 {item.dividendYield}% div</span>
                  </div>
                  {item.reason && <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{item.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

export default Recommendations
