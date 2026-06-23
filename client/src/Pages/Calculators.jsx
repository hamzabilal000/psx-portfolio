import { useRef, useState, forwardRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'
import Layout from '../components/Layout'

let tools = ['CAGR', 'ROI', 'Future Value', 'Dividend', 'Goal', 'Real Return', 'Sharpe']

// Keys that represent percentages so we can display them with %
const PCT_KEYS = new Set([
  'cagrPct', 'roiPct', 'realReturnPct', 'sharpeRatio',
  'nominalReturnPct', 'inflationPct', 'annualReturnPct',
  'yieldPct', 'growthRatePct',
])
// Keys that are multipliers
const MULT_KEYS = new Set(['growthMultiple'])

function fmtValue(key, val) {
  if (typeof val !== 'number') return val
  if (PCT_KEYS.has(key))  return `${val}%`
  if (MULT_KEYS.has(key)) return `${val}x`
  if (val > 999)          return `PKR ${val.toLocaleString()}`
  return val
}

function Calculators() {
  let [active, setActive] = useState('CAGR')
  let [result, setResult] = useState(null)
  let [error, setError] = useState('')
  let [calculating, setCalculating] = useState(false)
  let [slowWarn, setSlowWarn] = useState(false)

  let initRef = useRef(), finalRef = useRef(), yearsRef = useRef()
  let investRef = useRef(), currValRef = useRef()
  let fvInitRef = useRef(), fvMonthlyRef = useRef(), fvReturnRef = useRef(), fvYearsRef = useRef()
  let divInvRef = useRef(), divYieldRef = useRef(), divYearsRef = useRef(), divGrowthRef = useRef()
  let goalTargetRef = useRef(), goalYearsRef = useRef(), goalReturnRef = useRef(), goalSavingsRef = useRef()
  let nomRef = useRef(), inflRef = useRef()
  let portRetRef = useRef(), rfRef = useRef(), stdRef = useRef()

  async function calculate() {
    if (calculating) return
    setError(''); setResult(null); setCalculating(true); setSlowWarn(false)
    const slowTimer = setTimeout(() => setSlowWarn(true), 6000)
    let url, body
    try {
      if (active === 'CAGR') {
        url = '/cagr'; body = { initial: +initRef.current.value, final: +finalRef.current.value, years: +yearsRef.current.value }
      } else if (active === 'ROI') {
        url = '/roi'; body = { invested: +investRef.current.value, currentValue: +currValRef.current.value }
      } else if (active === 'Future Value') {
        url = '/future-value'; body = { initialInvestment: +fvInitRef.current.value, monthlyContribution: +fvMonthlyRef.current.value, annualReturnPct: +fvReturnRef.current.value, years: +fvYearsRef.current.value }
      } else if (active === 'Dividend') {
        url = '/dividend'; body = { investment: +divInvRef.current.value, yieldPct: +divYieldRef.current.value, years: +divYearsRef.current.value, growthRatePct: +divGrowthRef.current.value }
      } else if (active === 'Goal') {
        url = '/goal'; body = { targetAmount: +goalTargetRef.current.value, years: +goalYearsRef.current.value, annualReturnPct: +goalReturnRef.current.value, currentSavings: +goalSavingsRef.current.value }
      } else if (active === 'Real Return') {
        url = '/real-return'; body = { nominalReturnPct: +nomRef.current.value, inflationPct: +inflRef.current.value }
      } else if (active === 'Sharpe') {
        url = '/sharpe'; body = { portfolioReturnPct: +portRetRef.current.value, riskFreeRatePct: +rfRef.current.value, portfolioStdDevPct: +stdRef.current.value }
      }
      let res = await api.post(`/calc${url}`, body)
      if (res.data.success == true) setResult(res.data.data)
      else setError(res.data.error || 'Invalid inputs')
    } catch { setError('Server unreachable — please try again') }
    clearTimeout(slowTimer)
    setCalculating(false); setSlowWarn(false)
  }

  // eslint-disable-next-line react/display-name
  let Input = forwardRef(({ label, placeholder, type = 'number' }, ref) => (
    <div style={{ marginBottom: '14px' }}>
      <label className="field-label">{label}</label>
      <input ref={ref} type={type} placeholder={placeholder} className="input-field" />
    </div>
  ))

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🧮 Financial Calculators</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '28px' }}>8 professional investment calculators</p>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {tools.map(t => (
          <button key={t} onClick={() => { setActive(t); setResult(null); setError('') }}
            style={{
              padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: active === t ? 'var(--lime)' : 'var(--bg-card)',
              color: active === t ? '#0d0d0d' : 'var(--muted)',
              border: `1px solid ${active === t ? 'var(--lime)' : 'var(--border)'}`,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <h3 style={{ color: 'var(--white)', margin: '0 0 20px', fontSize: '16px', fontWeight: 700 }}>{active} Calculator</h3>

          {active === 'CAGR'         && <><Input ref={initRef}       label="Initial Value (PKR)"         placeholder="100000" /><Input ref={finalRef}      label="Final Value (PKR)"           placeholder="200000" /><Input ref={yearsRef}     label="Number of Years"             placeholder="5" /></>}
          {active === 'ROI'          && <><Input ref={investRef}     label="Amount Invested (PKR)"       placeholder="100000" /><Input ref={currValRef}    label="Current Value (PKR)"         placeholder="148000" /></>}
          {active === 'Future Value' && <><Input ref={fvInitRef}     label="Initial Investment (PKR)"    placeholder="100000" /><Input ref={fvMonthlyRef}  label="Monthly Contribution (PKR)"  placeholder="10000"  /><Input ref={fvReturnRef}  label="Annual Return (%)"           placeholder="18"     /><Input ref={fvYearsRef}   label="Years"                       placeholder="10"     /></>}
          {active === 'Dividend'     && <><Input ref={divInvRef}     label="Investment Amount (PKR)"     placeholder="500000" /><Input ref={divYieldRef}   label="Dividend Yield (%)"          placeholder="8.5"    /><Input ref={divYearsRef}  label="Years"                       placeholder="5"      /><Input ref={divGrowthRef} label="Dividend Growth Rate (%)"    placeholder="5"      /></>}
          {active === 'Goal'         && <><Input ref={goalTargetRef} label="Target Amount (PKR)"         placeholder="3000000"/><Input ref={goalYearsRef}  label="Years to Goal"               placeholder="5"      /><Input ref={goalReturnRef} label="Annual Return (%)"           placeholder="18"     /><Input ref={goalSavingsRef} label="Current Savings (PKR)"      placeholder="0"      /></>}
          {active === 'Real Return'  && <><Input ref={nomRef}        label="Nominal Return (%)"          placeholder="22"     /><Input ref={inflRef}       label="Inflation Rate (%) — PKT avg ~12%" placeholder="12" /></>}
          {active === 'Sharpe'       && <><Input ref={portRetRef}    label="Portfolio Return (%)"        placeholder="22"     /><Input ref={rfRef}         label="Risk-Free Rate (%) — T-bill ~22%" placeholder="22"  /><Input ref={stdRef}        label="Portfolio Std Dev (%)"       placeholder="15"     /></>}

          {error && <div className="alert-error" style={{ marginBottom: '12px' }}><span>⚠</span> {error}</div>}
          {slowWarn && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--warn)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: 'var(--warn)', fontSize: '13px' }}>
              ⏳ Server is warming up, please wait…
            </div>
          )}

          <button onClick={calculate} disabled={calculating} className="btn-primary" style={{ width: '100%', marginTop: '4px', opacity: calculating ? 0.7 : 1 }}>
            {calculating ? '⌛ Calculating…' : 'Calculate'}
          </button>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="card">
              <h3 style={{ color: 'var(--white)', margin: '0 0 20px', fontSize: '16px', fontWeight: 700 }}>Results</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {Object.entries(result).filter(([k]) => !['yearlyBreakdown', 'yearlyDividend'].includes(k)).map(([key, val]) => (
                  <div key={key} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ color: 'var(--lime)', fontSize: '20px', fontWeight: 700 }}>
                      {fmtValue(key, val)}
                    </div>
                  </div>
                ))}
              </div>

              {result.yearlyBreakdown && (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.yearlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" stroke="var(--muted)" tick={{ fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -4, fill: 'var(--muted)' }} />
                    <YAxis stroke="var(--muted)" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                    <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }} />
                    <Line type="monotone" dataKey={result.yearlyBreakdown[0]?.value !== undefined ? 'value' : 'dividend'} stroke="var(--lime)" strokeWidth={2} dot={{ fill: 'var(--lime)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧮</div>
              <p style={{ color: 'var(--muted)' }}>Enter values and click <strong style={{ color: 'var(--lime)' }}>Calculate</strong> to see results</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Calculators
