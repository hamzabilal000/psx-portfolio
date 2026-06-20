import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import Layout from '../components/Layout'
axios.defaults.withCredentials = true

let COLORS = ['#b9ff66', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185', '#34d399', '#f87171', '#38bdf8']

function RiskAnalyzer() {
  let [analysis, setAnalysis] = useState(null)
  let [portfolio, setPortfolio] = useState(null)
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState('')

  useEffect(() => { loadPortfolio() }, [])

  async function loadPortfolio() {
    try {
      let res = await axios.get('http://localhost:8080/portfolio')
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
      let res = await axios.post('http://localhost:8080/calc/portfolio-risk', { holdings })
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

  let riskColor = analysis
    ? (analysis.riskScore < 35 ? 'var(--success)' : analysis.riskScore < 65 ? 'var(--warn)' : 'var(--danger)')
    : 'var(--muted)'

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, margin: 0 }}>🛡️ Risk Analyzer</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Portfolio risk breakdown and warnings</p>
        </div>
        <button onClick={analyze} disabled={loading} className="btn-primary">
          {loading ? 'Analyzing...' : '🔍 Analyze Risk'}
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '20px' }}><span>⚠</span> {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Sector Chart */}
        <div className="card">
          <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Sector Exposure</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>No holdings in portfolio</div>
          )}
        </div>

        {/* Risk Score */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {analysis ? (
            <>
              <div style={{ fontSize: '80px', fontWeight: 800, color: riskColor, lineHeight: 1 }}>{analysis.riskScore}</div>
              <div style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '16px' }}>out of 100</div>
              <span className={`badge-${analysis.riskLabel.toLowerCase()}`} style={{ fontSize: '16px', padding: '6px 20px' }}>
                {analysis.riskLabel} Risk
              </span>

              {analysis.warnings?.length > 0 && (
                <div style={{ marginTop: '20px', width: '100%' }}>
                  <h4 style={{ color: 'var(--warn)', margin: '0 0 10px', fontSize: '14px' }}>⚠️ Warnings</h4>
                  {analysis.warnings.map((w, i) => (
                    <div key={i} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px', color: 'var(--warn)', fontSize: '13px' }}>
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {analysis.breakdown && (
                <div style={{ marginTop: '16px', width: '100%' }}>
                  <h4 style={{ color: 'var(--muted)', margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Breakdown</h4>
                  {[
                    { label: 'Weighted Volatility',   val: analysis.breakdown.weightedVolatility },
                    { label: 'Concentration Penalty', val: analysis.breakdown.concentrationPenalty },
                    { label: 'Sector Penalty',        val: analysis.breakdown.sectorPenalty },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted)' }}>{item.label}</span>
                      <span style={{ color: 'var(--white)', fontWeight: 600 }}>+{item.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
              <p>Click <strong style={{ color: 'var(--lime)' }}>Analyze Risk</strong> to get your portfolio risk score</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RiskAnalyzer
