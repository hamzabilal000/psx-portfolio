import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

let AMOUNTS = [50000, 100000, 500000, 1000000, 5000000]
let HORIZONS = [1, 3, 5, 10]
let MONTHLY = [0, 5000, 10000, 25000, 50000]

function RiskQuestionnaire() {
  let [form, setForm] = useState({
    investmentAmount: '', timeHorizonYears: '', riskTolerance: '',
    dividendPreference: '', ageRange: '', monthlyInvestment: 0, investmentGoal: ''
  })
  let [result, setResult] = useState(null)
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState('')
  let navigate = useNavigate()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit() {
    let required = ['investmentAmount', 'timeHorizonYears', 'riskTolerance', 'dividendPreference', 'ageRange', 'investmentGoal']
    if (required.some(k => !form[k])) return setError('Please answer all questions')
    setError(''); setLoading(true)
    try {
      let res = await axios.post("http://localhost:8080/user/risk-profile", form)
      if (res.data.success == true) {
        setResult(res.data.data.riskProfile)
      } else setError(res.data.error)
    } catch (e) { setError('Submission failed') }
    setLoading(false)
  }

  let SelectGroup = ({ label, field, options }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '15px', fontWeight: 500, marginBottom: '10px' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => set(field, opt.value)}
            style={{
              padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
              background: form[field] == opt.value ? '#16a34a' : '#1a1f2e',
              color: form[field] == opt.value ? 'white' : '#94a3b8',
              border: `1px solid ${form[field] == opt.value ? '#16a34a' : '#2d3347'}`,
              transition: 'all 0.15s'
            }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px', maxWidth: '800px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Investor Profile</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Answer these questions so our AI can build your personalized investment profile.</p>

        {result ? (
          <div>
            <div className="card" style={{ marginBottom: '20px', background: '#14532d', border: '1px solid #16a34a' }}>
              <h2 style={{ color: '#86efac', marginTop: 0 }}>🎯 Your Investor Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><div style={{ color: '#86efac', fontSize: '12px' }}>INVESTOR TYPE</div><div style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700 }}>{result.investorType}</div></div>
                <div><div style={{ color: '#86efac', fontSize: '12px' }}>EXPECTED RETURN</div><div style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700 }}>{result.expectedReturnMin}–{result.expectedReturnMax}%</div></div>
                <div><div style={{ color: '#86efac', fontSize: '12px' }}>PROFILE SCORE</div><div style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700 }}>{result.profileScore} / 100</div></div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>📊 Suggested Allocation</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {Object.entries(result.suggestedAllocation || {}).map(([sector, pct]) => (
                  <div key={sector} style={{ background: '#1a1f2e', border: '1px solid #2d3347', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ color: '#16a34a', fontSize: '20px', fontWeight: 700 }}>{pct}%</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{sector}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => navigate('/recommendations')} className="btn-primary">🤖 Get AI Stock Picks</button>
              <button onClick={() => setResult(null)} className="btn-outline">Retake Questionnaire</button>
            </div>
          </div>
        ) : (
          <div className="card">
            {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <SelectGroup label="1. How much are you investing?" field="investmentAmount"
              options={AMOUNTS.map(a => ({ value: a, label: `PKR ${a.toLocaleString()}` }))} />
            <SelectGroup label="2. Investment time horizon?" field="timeHorizonYears"
              options={HORIZONS.map(h => ({ value: h, label: `${h} Year${h > 1 ? 's' : ''}` }))} />
            <SelectGroup label="3. Risk tolerance?" field="riskTolerance"
              options={[{ value: 'Low', label: '🛡️ Low' }, { value: 'Medium', label: '⚖️ Medium' }, { value: 'High', label: '🚀 High' }]} />
            <SelectGroup label="4. Dividend preference?" field="dividendPreference"
              options={[{ value: 'High Dividend', label: '💵 High Dividend' }, { value: 'Balanced', label: '⚖️ Balanced' }, { value: 'Growth', label: '📈 Growth' }]} />
            <SelectGroup label="5. Age range?" field="ageRange"
              options={[{ value: '18-25', label: '18–25' }, { value: '25-40', label: '25–40' }, { value: '40+', label: '40+' }]} />
            <SelectGroup label="6. Monthly contribution?" field="monthlyInvestment"
              options={MONTHLY.map(m => ({ value: m, label: m === 0 ? 'None' : `PKR ${m.toLocaleString()}` }))} />
            <SelectGroup label="7. Investment goal?" field="investmentGoal"
              options={[
                { value: 'Wealth Building', label: '🏗️ Wealth Building' },
                { value: 'Passive Income', label: '💤 Passive Income' },
                { value: 'Retirement', label: '🌴 Retirement' },
                { value: 'Capital Growth', label: '🚀 Capital Growth' }
              ]} />

            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ marginTop: '8px', padding: '12px 32px' }}>
              {loading ? 'Analyzing...' : '🤖 Generate My Profile'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default RiskQuestionnaire
