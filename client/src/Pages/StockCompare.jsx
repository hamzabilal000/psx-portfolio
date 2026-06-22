import { useRef, useState } from 'react'
import api from '../api'
import Layout from '../components/Layout'
import AIThinking from '../components/AIThinking'

function NotFound({ error }) {
  return (
    <div style={{
      textAlign: 'center', padding: '36px 24px', marginTop: '16px',
      background: 'var(--bg-card)',
      border: '1px dashed rgba(239,68,68,0.35)',
      borderRadius: '18px',
      animation: 'fadeSlideUp 0.4s ease both',
    }}>
      {/* Pulsing icon */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
        <div style={{
          position: 'absolute', inset: '-8px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)',
          animation: 'pulse-ring 1.6s ease-out infinite',
        }} />
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.08)',
          border: '2px solid rgba(239,68,68,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px',
          animation: 'shake 0.5s ease 0.15s both',
        }}>🔍</div>
      </div>

      <h3 style={{ color: 'var(--white)', fontSize: '17px', fontWeight: 700, margin: '0 0 8px' }}>
        Stock Not Found
      </h3>
      <p style={{ color: 'var(--danger)', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.5 }}>
        {error}
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px 20px', display: 'inline-block', maxWidth: '480px',
      }}>
        <p style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 10px', fontWeight: 700 }}>
          Available symbols
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
          {['MEBL','HBL','UBL','MCB','ENGRO','LUCK','OGDC','PPL','PSO','TRG','SYS','FFC','SEARL','INDU','PTCL'].map(s => (
            <span key={s} style={{
              background: 'var(--lime-subtle)', color: 'var(--lime)',
              border: '1px solid rgba(185,255,102,0.2)',
              borderRadius: '6px', padding: '2px 9px', fontSize: '11px', fontWeight: 700,
            }}>{s}</span>
          ))}
          <span style={{ color: 'var(--muted)', fontSize: '11px', alignSelf: 'center' }}>+53 more</span>
        </div>
      </div>
    </div>
  )
}

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
    if (!s1 || !s2) return setError('Enter both stock symbols')
    setError(''); setVerdict(''); setStocks([]); setLoading(true)
    try {
      let res = await api.get(`/stocks/compare?symbols=${s1},${s2}`)
      if (res.data.success === true) setStocks(res.data.data)
      else setError(res.data.error || 'Comparison failed')
    } catch (e) { setError(e.response?.data?.error || 'Comparison failed. Please try again.') }
    setLoading(false)
  }

  async function getAIVerdict() {
    if (stocks.length < 2) return
    setVerdictLoading(true); setVerdict('')
    try {
      let res = await api.post('/gemini/compare', { stock_a: stocks[0], stock_b: stocks[1] })
      setVerdict(res.data?.data?.verdict || res.data?.data || 'No verdict available.')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || ''
      const isTimeout = err.code === 'ECONNABORTED' || msg.includes('timeout')
      setVerdict(isTimeout
        ? '⏳ AI service timed out. Please try again in 30 seconds.'
        : '⚠ AI service is temporarily unavailable. Please try again shortly.')
    }
    setVerdictLoading(false)
  }

  let metrics = [
    { key: 'avgPeRatio',         label: 'P/E Ratio',         fmt: v => v ? v.toFixed(1)+'x' : '—', note: 'Lower = better value' },
    { key: 'avgDividendYield',   label: 'Dividend Yield',    fmt: v => v ? v+'%' : '—',             better: 'higher' },
    { key: 'avgRoe',             label: 'ROE',               fmt: v => v ? v+'%' : '—',             better: 'higher' },
    { key: 'beta',               label: 'Beta',              fmt: v => v || '—',                    note: '<1 = low volatility' },
    { key: 'avgAnnualReturn5yr', label: '5yr Annual Return', fmt: v => v ? v+'%' : '—',             better: 'higher' },
    { key: 'volatilityScore',    label: 'Volatility Score',  fmt: v => v ? `${v}/100` : '—',        note: 'Lower = less volatile' },
    { key: 'avgPbRatio',         label: 'P/B Ratio',         fmt: v => v ? v.toFixed(1)+'x' : '—' },
    { key: 'maxDrawdown',        label: 'Max Drawdown',      fmt: v => v ? v+'%' : '—',             note: 'Less negative = better' },
  ]

  return (
    <Layout>
      <h1 style={{ color:'var(--white)', fontSize:'24px', fontWeight:700, marginBottom:'8px' }}>📊 Stock Comparison</h1>
      <p style={{ color:'var(--muted)', marginBottom:'24px' }}>Compare two PSX stocks side by side</p>

      <div className="card" style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap' }}>
          {[{ ref: s1Ref, label:'Stock 1', placeholder:'e.g. MEBL' }, { ref: s2Ref, label:'Stock 2', placeholder:'e.g. HBL' }].map(f => (
            <div key={f.label} style={{ flex:1, minWidth:'140px' }}>
              <label className="field-label">{f.label}</label>
              <input ref={f.ref} type="text" placeholder={f.placeholder} className="input-field"
                style={{ textTransform:'uppercase' }}
                onKeyDown={e => e.key === 'Enter' && handleCompare()} />
            </div>
          ))}
          <button onClick={handleCompare} disabled={loading} className="btn-primary" style={{ padding:'12px 24px', whiteSpace:'nowrap' }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ width:'14px', height:'14px', borderRadius:'50%', border:'2px solid rgba(0,0,0,0.25)', borderTopColor:'#0d0d0d', animation:'rotate-glow 0.7s linear infinite', display:'inline-block', flexShrink:0 }} />
                Comparing...
              </span>
            ) : 'Compare →'}
          </button>
        </div>

        {error
          ? <NotFound error={error} />
          : <p style={{ color:'var(--muted)', fontSize:'11px', marginTop:'10px', marginBottom:0 }}>
              Try: MEBL vs HBL · ENGRO vs FFC · TRG vs SYS · OGDC vs PPL
            </p>
        }
      </div>

      {stocks.length >= 2 && (
        <>
          {/* AI Verdict */}
          <div className="card" style={{ marginBottom:'16px' }}>
            {verdictLoading ? (
              <AIThinking mode="inline" label="AI comparing stocks" />
            ) : verdict ? (
              <div style={{ display:'flex', gap:'14px', alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{
                  width:'38px', height:'38px', borderRadius:'10px', flexShrink:0,
                  background:'rgba(185,255,102,0.1)', border:'1px solid rgba(185,255,102,0.25)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px',
                }}>✦</div>
                <div style={{ flex:1 }}>
                  <p style={{ color:'var(--lime)', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 5px' }}>AI Verdict</p>
                  <p style={{ color:'var(--white)', fontSize:'13px', margin:0, lineHeight:1.7 }}>{verdict}</p>
                </div>
                <button onClick={getAIVerdict} className="btn-ghost" style={{ flexShrink:0, fontSize:'12px' }}>↺ Re-run</button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
                <button onClick={getAIVerdict} className="btn-primary" style={{ whiteSpace:'nowrap' }}>✦ Get AI Verdict</button>
                <p style={{ color:'var(--muted)', fontSize:'13px', margin:0 }}>Let AI pick the better investment between these two stocks</p>
              </div>
            )}
          </div>

          {/* Stock Headers */}
          <div style={{ display:'grid', gridTemplateColumns:'180px 1fr 1fr', gap:'4px', marginBottom:'4px' }}>
            <div />
            {stocks.map(s => (
              <div key={s.symbol} className="card" style={{ textAlign:'center' }}>
                <div style={{ color:'var(--lime)', fontWeight:700, fontSize:'22px' }}>{s.symbol}</div>
                <div style={{ color:'var(--white)', fontSize:'13px', marginTop:'4px' }}>{s.name}</div>
                <div style={{ color:'var(--muted)', fontSize:'12px', marginTop:'2px' }}>{s.sector}</div>
                <span className={`badge-${s.riskLevel?.toLowerCase()}`} style={{ display:'inline-block', marginTop:'8px' }}>{s.riskLevel}</span>
              </div>
            ))}
          </div>

          {/* Metric Rows */}
          {metrics.map(m => {
            let vals = stocks.map(s => s[m.key])
            let better0 = m.better === 'higher' ? vals[0] > vals[1] : vals[0] < vals[1]
            return (
              <div key={m.key} style={{ display:'grid', gridTemplateColumns:'180px 1fr 1fr', gap:'4px', marginBottom:'4px' }}>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', padding:'12px 16px', borderRadius:'8px', display:'flex', alignItems:'center' }}>
                  <div>
                    <div style={{ color:'var(--white)', fontSize:'13px', fontWeight:600 }}>{m.label}</div>
                    {m.note && <div style={{ color:'var(--muted)', fontSize:'11px', marginTop:'2px' }}>{m.note}</div>}
                  </div>
                </div>
                {stocks.map((s, i) => (
                  <div key={s.symbol} style={{
                    background: m.better && (i===0 ? better0 : !better0) ? 'var(--success-bg)' : 'var(--bg-card)',
                    border: `1px solid ${m.better && (i===0 ? better0 : !better0) ? 'rgba(185,255,102,0.25)' : 'var(--border)'}`,
                    borderRadius:'8px', padding:'12px 16px', textAlign:'center',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                  }}>
                    <span style={{ color:'var(--white)', fontSize:'15px', fontWeight:600 }}>{m.fmt(s[m.key])}</span>
                    {m.better && (i===0 ? better0 : !better0) && <span style={{ color:'var(--success)' }}>✓</span>}
                  </div>
                ))}
              </div>
            )
          })}

          {/* Suitability */}
          <div style={{ display:'grid', gridTemplateColumns:'180px 1fr 1fr', gap:'4px', marginTop:'16px' }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'12px 16px', color:'var(--muted)', fontSize:'13px', fontWeight:600, display:'flex', alignItems:'center' }}>Best For</div>
            {stocks.map(s => (
              <div key={s.symbol} className="card" style={{ padding:'12px 16px' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {s.suitableGoals?.map(g => <span key={g} className="chip" style={{ color:'var(--success)' }}>{g}</span>)}
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
