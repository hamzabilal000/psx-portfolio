import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

let COLORS = ['#16a34a', '#22c55e', '#4ade80', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']

function RiskAnalyzer() {
  let [analysis, setAnalysis] = useState(null)
  let [portfolio, setPortfolio] = useState(null)
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState('')

  useEffect(() => { loadPortfolio() }, [])

  async function loadPortfolio() {
    try {
      let res = await axios.get("http://localhost:8080/portfolio")
      if (res.data.success) setPortfolio(res.data.data)
    } catch {}
  }

  async function analyze() {
    if (!portfolio?.portfolio?.holdings?.length) return setError('No holdings to analyze')
    setError(''); setLoading(true)
    try {
      let holdings = portfolio.portfolio.holdings.map(h => ({
        symbol: h.symbol,
        sector: h.stock?.sector || 'Unknown',
        allocationPct: portfolio.metrics.currentValue > 0 ? (h.currentValue / portfolio.metrics.currentValue * 100) : 0,
        volatilityScore: h.stock?.volatilityScore || 50
      }))
      let res = await axios.post("http://localhost:8080/calc/portfolio-risk", { holdings })
      if (res.data.success == true) setAnalysis(res.data.data)
      else setError(res.data.error)
    } catch { setError('Analysis failed') }
    setLoading(false)
  }

  let sectorData = portfolio?.portfolio?.holdings?.reduce((acc, h) => {
    let sector = h.stock?.sector || h.symbol
    acc[sector] = (acc[sector] || 0) + (h.currentValue || h.totalInvested)
    return acc
  }, {}) || {}
  let pieData = Object.entries(sectorData).map(([name, value]) => ({ name, value: Math.round(value) }))

  let riskColor = analysis ? (analysis.riskScore < 35 ? '#22c55e' : analysis.riskScore < 65 ? '#f59e0b' : '#ef4444') : '#64748b'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, margin: 0 }}>🛡️ Risk Analyzer</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Portfolio risk breakdown and warnings</p>
          </div>
          <button onClick={analyze} disabled={loading} className="btn-primary">
            {loading ? 'Analyzing...' : '🔍 Analyze Risk'}
          </button>
        </div>

        {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Sector Chart */}
          <div className="card">
            <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: '16px' }}>Sector Exposure</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: '#232938', border: '1px solid #2d3347' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>No holdings in portfolio</div>
            )}
          </div>

          {/* Risk Score */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {analysis ? (
              <>
                <div style={{ fontSize: '80px', fontWeight: 800, color: riskColor, lineHeight: 1 }}>{analysis.riskScore}</div>
                <div style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>out of 100</div>
                <span className={`badge-${analysis.riskLabel.toLowerCase()}`} style={{ fontSize: '16px', padding: '6px 20px' }}>
                  {analysis.riskLabel} Risk
                </span>

                {analysis.warnings?.length > 0 && (
                  <div style={{ marginTop: '20px', width: '100%' }}>
                    <h4 style={{ color: '#fbbf24', margin: '0 0 10px', fontSize: '14px' }}>⚠️ Warnings</h4>
                    {analysis.warnings.map((w, i) => (
                      <div key={i} style={{ background: '#713f1220', border: '1px solid #71540044', borderRadius: '6px', padding: '8px 12px', marginBottom: '8px', color: '#fbbf24', fontSize: '13px' }}>
                        {w}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.breakdown && (
                  <div style={{ marginTop: '16px', width: '100%' }}>
                    <h4 style={{ color: '#94a3b8', margin: '0 0 10px', fontSize: '13px' }}>BREAKDOWN</h4>
                    {[
                      { label: 'Weighted Volatility', val: analysis.breakdown.weightedVolatility },
                      { label: 'Concentration Penalty', val: analysis.breakdown.concentrationPenalty },
                      { label: 'Sector Penalty', val: analysis.breakdown.sectorPenalty },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2d3347', fontSize: '13px' }}>
                        <span style={{ color: '#64748b' }}>{item.label}</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>+{item.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
                <p>Click <strong style={{ color: '#16a34a' }}>Analyze Risk</strong> to get your portfolio risk score</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default RiskAnalyzer
