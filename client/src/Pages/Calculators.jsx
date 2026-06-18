import { useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = false

let tools = ['CAGR', 'ROI', 'Future Value', 'Dividend', 'Goal', 'Real Return', 'Sharpe']

function Calculators() {
  let [active, setActive] = useState('CAGR')
  let [result, setResult] = useState(null)
  let [error, setError] = useState('')

  // CAGR
  let initRef = useRef(), finalRef = useRef(), yearsRef = useRef()
  // ROI
  let investRef = useRef(), currValRef = useRef()
  // Future Value
  let fvInitRef = useRef(), fvMonthlyRef = useRef(), fvReturnRef = useRef(), fvYearsRef = useRef()
  // Dividend
  let divInvRef = useRef(), divYieldRef = useRef(), divYearsRef = useRef(), divGrowthRef = useRef()
  // Goal
  let goalTargetRef = useRef(), goalYearsRef = useRef(), goalReturnRef = useRef(), goalSavingsRef = useRef()
  // Real Return
  let nomRef = useRef(), inflRef = useRef()
  // Sharpe
  let portRetRef = useRef(), rfRef = useRef(), stdRef = useRef()

  async function calculate() {
    setError(''); setResult(null)
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
      let res = await axios.post(`http://localhost:8080/calc${url}`, body)
      if (res.data.success == true) setResult(res.data.data)
      else setError(res.data.error)
    } catch { setError('Calculation failed') }
  }

  let inputStyle = { marginBottom: '14px' }
  let Input = ({ ref: r, label, placeholder, type = 'number' }) => (
    <div style={inputStyle}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{label}</label>
      <input ref={r} type={type} placeholder={placeholder} className="input-field" />
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🧮 Financial Calculators</h1>
        <p style={{ color: '#64748b', marginBottom: '28px' }}>8 professional investment calculators</p>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {tools.map(t => (
            <button key={t} onClick={() => { setActive(t); setResult(null); setError('') }}
              style={{
                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: active === t ? '#16a34a' : '#232938',
                color: active === t ? 'white' : '#94a3b8',
                border: `1px solid ${active === t ? '#16a34a' : '#2d3347'}`,
                transition: 'all 0.15s'
              }}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Form */}
          <div className="card">
            <h3 style={{ color: '#e2e8f0', margin: '0 0 20px' }}>{active} Calculator</h3>

            {active === 'CAGR' && <><Input ref={initRef} label="Initial Value (PKR)" placeholder="100000" /><Input ref={finalRef} label="Final Value (PKR)" placeholder="200000" /><Input ref={yearsRef} label="Number of Years" placeholder="5" /></>}
            {active === 'ROI' && <><Input ref={investRef} label="Amount Invested (PKR)" placeholder="100000" /><Input ref={currValRef} label="Current Value (PKR)" placeholder="148000" /></>}
            {active === 'Future Value' && <><Input ref={fvInitRef} label="Initial Investment (PKR)" placeholder="100000" /><Input ref={fvMonthlyRef} label="Monthly Contribution (PKR)" placeholder="10000" /><Input ref={fvReturnRef} label="Annual Return (%)" placeholder="18" /><Input ref={fvYearsRef} label="Years" placeholder="10" /></>}
            {active === 'Dividend' && <><Input ref={divInvRef} label="Investment Amount (PKR)" placeholder="500000" /><Input ref={divYieldRef} label="Dividend Yield (%)" placeholder="8.5" /><Input ref={divYearsRef} label="Years" placeholder="5" /><Input ref={divGrowthRef} label="Dividend Growth Rate (%)" placeholder="5" /></>}
            {active === 'Goal' && <><Input ref={goalTargetRef} label="Target Amount (PKR)" placeholder="3000000" /><Input ref={goalYearsRef} label="Years to Goal" placeholder="5" /><Input ref={goalReturnRef} label="Annual Return (%)" placeholder="18" /><Input ref={goalSavingsRef} label="Current Savings (PKR)" placeholder="0" /></>}
            {active === 'Real Return' && <><Input ref={nomRef} label="Nominal Return (%)" placeholder="22" /><Input ref={inflRef} label="Inflation Rate (%) — Pakistan avg ~12%" placeholder="12" /></>}
            {active === 'Sharpe' && <><Input ref={portRetRef} label="Portfolio Return (%)" placeholder="22" /><Input ref={rfRef} label="Risk-Free Rate (%) — T-bill ~22%" placeholder="22" /><Input ref={stdRef} label="Portfolio Std Dev (%)" placeholder="15" /></>}

            {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}

            <button onClick={calculate} className="btn-primary" style={{ width: '100%', marginTop: '4px' }}>Calculate</button>
          </div>

          {/* Result */}
          <div>
            {result && (
              <div className="card">
                <h3 style={{ color: '#e2e8f0', margin: '0 0 20px' }}>Results</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {Object.entries(result).filter(([k]) => !['yearlyBreakdown', 'yearlyDividend'].includes(k)).map(([key, val]) => (
                    <div key={key} style={{ background: '#1a1f2e', border: '1px solid #2d3347', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: 700 }}>
                        {typeof val === 'number' ? (val > 1000 ? `PKR ${val.toLocaleString()}` : `${val}`) : val}
                      </div>
                    </div>
                  ))}
                </div>

                {result.yearlyBreakdown && (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.yearlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d3347" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -4, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                      <Tooltip formatter={v => `PKR ${v.toLocaleString()}`} contentStyle={{ background: '#232938', border: '1px solid #2d3347' }} />
                      <Line type="monotone" dataKey={result.yearlyBreakdown[0]?.value !== undefined ? "value" : "dividend"} stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {!result && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧮</div>
                <p style={{ color: '#64748b' }}>Enter values and click <strong style={{ color: '#16a34a' }}>Calculate</strong> to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Calculators
