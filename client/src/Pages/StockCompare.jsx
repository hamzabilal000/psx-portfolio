import { useRef, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

function StockCompare() {
  let s1Ref = useRef(), s2Ref = useRef()
  let [stocks, setStocks] = useState([])
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState('')

  async function handleCompare() {
    let s1 = s1Ref.current.value.trim().toUpperCase()
    let s2 = s2Ref.current.value.trim().toUpperCase()
    if (!s1 || !s2) return setError('Enter both symbols')
    setError(''); setLoading(true)
    try {
      let res = await axios.get(`http://localhost:8080/stocks/compare?symbols=${s1},${s2}`)
      if (res.data.success == true) setStocks(res.data.data)
      else setError(res.data.error)
    } catch { setError('Comparison failed') }
    setLoading(false)
  }

  let metrics = [
    { key: 'avgPeRatio', label: 'P/E Ratio', fmt: v => v ? v.toFixed(1) + 'x' : '—', note: 'Lower = better value' },
    { key: 'avgDividendYield', label: 'Dividend Yield', fmt: v => v ? v + '%' : '—', better: 'higher' },
    { key: 'avgRoe', label: 'ROE', fmt: v => v ? v + '%' : '—', better: 'higher' },
    { key: 'beta', label: 'Beta', fmt: v => v || '—', note: '<1 = low volatility' },
    { key: 'avgAnnualReturn5yr', label: '5yr Annual Return', fmt: v => v ? v + '%' : '—', better: 'higher' },
    { key: 'volatilityScore', label: 'Volatility Score', fmt: v => v ? `${v}/100` : '—', note: 'Lower = less volatile' },
    { key: 'avgPbRatio', label: 'P/B Ratio', fmt: v => v ? v.toFixed(1) + 'x' : '—' },
    { key: 'maxDrawdown', label: 'Max Drawdown', fmt: v => v ? v + '%' : '—', note: 'Less negative = better' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📊 Stock Comparison</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Compare two PSX stocks side by side</p>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {[{ ref: s1Ref, label: 'Stock 1' }, { ref: s2Ref, label: 'Stock 2' }].map(f => (
              <div key={f.label} style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{f.label}</label>
                <input ref={f.ref} type="text" placeholder="e.g. MEBL" className="input-field" style={{ textTransform: 'uppercase' }} />
              </div>
            ))}
            <button onClick={handleCompare} disabled={loading} className="btn-primary" style={{ padding: '10px 24px' }}>
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
          {error && <div style={{ color: '#fca5a5', fontSize: '13px', marginTop: '10px' }}>{error}</div>}
        </div>

        {stocks.length >= 2 && (
          <>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '2px', marginBottom: '2px' }}>
              <div></div>
              {stocks.map(s => (
                <div key={s.symbol} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '22px' }}>{s.symbol}</div>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>{s.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{s.sector}</div>
                  <span className={`badge-${s.riskLevel?.toLowerCase()}`} style={{ display: 'inline-block', marginTop: '8px' }}>{s.riskLevel}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            {metrics.map(m => {
              let vals = stocks.map(s => s[m.key])
              let better0 = m.better === 'higher' ? vals[0] > vals[1] : vals[0] < vals[1]
              return (
                <div key={m.key} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '2px', marginBottom: '2px' }}>
                  <div style={{ background: '#232938', border: '1px solid #2d3347', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>{m.label}</div>
                      {m.note && <div style={{ color: '#475569', fontSize: '11px' }}>{m.note}</div>}
                    </div>
                  </div>
                  {stocks.map((s, i) => (
                    <div key={s.symbol} style={{
                      background: m.better && (i === 0 ? better0 : !better0) ? '#14532d20' : '#232938',
                      border: `1px solid ${m.better && (i === 0 ? better0 : !better0) ? '#16a34a44' : '#2d3347'}`,
                      padding: '12px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                      <span style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>{m.fmt(s[m.key])}</span>
                      {m.better && (i === 0 ? better0 : !better0) && <span style={{ color: '#22c55e' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Suitability */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '2px', marginTop: '16px' }}>
              <div style={{ background: '#232938', border: '1px solid #2d3347', padding: '12px 16px', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center' }}>Best For</div>
              {stocks.map(s => (
                <div key={s.symbol} className="card" style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {s.suitableGoals?.map(g => (
                      <span key={g} style={{ background: '#1a1f2e', color: '#86efac', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{g}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default StockCompare
