import { useRef, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import axios from 'axios'
import Layout from '../components/Layout'
axios.defaults.withCredentials = true

function StockCompare() {
  let s1Ref = useRef(), s2Ref = useRef()
  let [stocks, setStocks] = useState([])
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState('')
  let [verdict, setVerdict] = useState('')
  let [verdictLoading, setVerdictLoading] = useState(false)

  async function handleCompare() {
    let s1 = s1Ref.current.value.trim().toUpperCase()
    let s2 = s2Ref.current.value.trim().toUpperCase()
    if (!s1 || !s2) return setError('Enter both symbols')
    setError(''); setVerdict(''); setLoading(true)
    try {
      let res = await axios.get(`http://localhost:8080/stocks/compare?symbols=${s1},${s2}`)
      if (res.data.success == true) setStocks(res.data.data)
      else setError(res.data.error)
    } catch { setError('Comparison failed') }
    setLoading(false)
  }

  async function getAIVerdict() {
    if (stocks.length < 2) return
    setVerdictLoading(true); setVerdict('')
    try {
      let res = await axios.post('http://localhost:8080/gemini/compare', { stock_a: stocks[0], stock_b: stocks[1] })
      setVerdict(res.data?.data?.verdict || res.data?.data || 'No verdict available.')
    } catch {
      setVerdict('AI service offline. Start it: cd ai-service && python main.py')
    }
    setVerdictLoading(false)
  }

  let metrics = [
    { key: 'avgPeRatio',        label: 'P/E Ratio',        fmt: v => v ? v.toFixed(1) + 'x' : '—', note: 'Lower = better value' },
    { key: 'avgDividendYield',  label: 'Dividend Yield',   fmt: v => v ? v + '%' : '—',             better: 'higher' },
    { key: 'avgRoe',            label: 'ROE',              fmt: v => v ? v + '%' : '—',             better: 'higher' },
    { key: 'beta',              label: 'Beta',             fmt: v => v || '—',                      note: '<1 = low volatility' },
    { key: 'avgAnnualReturn5yr',label: '5yr Annual Return',fmt: v => v ? v + '%' : '—',             better: 'higher' },
    { key: 'volatilityScore',   label: 'Volatility Score', fmt: v => v ? `${v}/100` : '—',         note: 'Lower = less volatile' },
    { key: 'avgPbRatio',        label: 'P/B Ratio',        fmt: v => v ? v.toFixed(1) + 'x' : '—' },
    { key: 'maxDrawdown',       label: 'Max Drawdown',     fmt: v => v ? v + '%' : '—',             note: 'Less negative = better' },
  ]

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📊 Stock Comparison</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Compare two PSX stocks side by side</p>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[{ ref: s1Ref, label: 'Stock 1' }, { ref: s2Ref, label: 'Stock 2' }].map(f => (
            <div key={f.label} style={{ flex: 1, minWidth: '160px' }}>
              <label className="field-label">{f.label}</label>
              <input ref={f.ref} type="text" placeholder="e.g. MEBL" className="input-field" style={{ textTransform: 'uppercase' }} />
            </div>
          ))}
          <button onClick={handleCompare} disabled={loading} className="btn-primary" style={{ padding: '12px 24px' }}>
            {loading ? 'Comparing...' : 'Compare →'}
          </button>
        </div>
        {error && <div className="alert-error" style={{ marginTop: '12px' }}><span>⚠</span> {error}</div>}
      </div>

      {stocks.length >= 2 && (
        <>
          {/* AI Verdict bar */}
          <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={getAIVerdict} disabled={verdictLoading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              {verdictLoading ? '⏳ Analyzing...' : '✦ AI Verdict'}
            </button>
            {verdict && <p style={{ color: 'var(--white)', fontSize: '13px', margin: 0, flex: 1, lineHeight: 1.6 }}>{verdict}</p>}
          </div>

          {/* Stock Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: '4px', marginBottom: '4px' }}>
            <div />
            {stocks.map(s => (
              <div key={s.symbol} className="card" style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '22px' }}>{s.symbol}</div>
                <div style={{ color: 'var(--white)', fontSize: '13px', marginTop: '4px' }}>{s.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px' }}>{s.sector}</div>
                <span className={`badge-${s.riskLevel?.toLowerCase()}`} style={{ display: 'inline-block', marginTop: '8px' }}>{s.riskLevel}</span>
              </div>
            ))}
          </div>

          {/* Metric Rows */}
          {metrics.map(m => {
            let vals = stocks.map(s => s[m.key])
            let better0 = m.better === 'higher' ? vals[0] > vals[1] : vals[0] < vals[1]
            return (
              <div key={m.key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: '4px', marginBottom: '4px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--white)', fontSize: '13px', fontWeight: 600 }}>{m.label}</div>
                    {m.note && <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>{m.note}</div>}
                  </div>
                </div>
                {stocks.map((s, i) => (
                  <div key={s.symbol} style={{
                    background: m.better && (i === 0 ? better0 : !better0) ? 'var(--success-bg)' : 'var(--bg-card)',
                    border: `1px solid ${m.better && (i === 0 ? better0 : !better0) ? 'rgba(185,255,102,0.25)' : 'var(--border)'}`,
                    borderRadius: '8px', padding: '12px 16px', textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}>
                    <span style={{ color: 'var(--white)', fontSize: '15px', fontWeight: 600 }}>{m.fmt(s[m.key])}</span>
                    {m.better && (i === 0 ? better0 : !better0) && <span style={{ color: 'var(--success)' }}>✓</span>}
                  </div>
                ))}
              </div>
            )
          })}

          {/* Suitability */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: '4px', marginTop: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'var(--muted)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>Best For</div>
            {stocks.map(s => (
              <div key={s.symbol} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {s.suitableGoals?.map(g => (
                    <span key={g} className="chip" style={{ color: 'var(--success)' }}>{g}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}

export default StockCompare
