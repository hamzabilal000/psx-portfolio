import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Layout from '../components/Layout'
import AIThinking from '../components/AIThinking'
import WakeUpAI from '../components/WakeUpAI'

let AMOUNTS  = [50000, 100000, 500000, 1000000, 5000000]
let HORIZONS = [1, 3, 5, 10]
let MONTHLY  = [0, 5000, 10000, 25000, 50000]

function RiskQuestionnaire() {
  let [form, setForm] = useState({
    investmentAmount: '', timeHorizonYears: '', riskTolerance: '',
    dividendPreference: '', ageRange: '', monthlyInvestment: 0, investmentGoal: ''
  })
  let [result, setResult]   = useState(null)
  let [loading, setLoading] = useState(false)
  let [sleeping, setSleeping] = useState(false)
  let [savedForm, setSavedForm] = useState(null)
  let [error, setError]     = useState('')
  let navigate = useNavigate()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(formOverride) {
    let data = formOverride || form
    let required = ['investmentAmount', 'timeHorizonYears', 'riskTolerance', 'dividendPreference', 'ageRange', 'investmentGoal']
    if (!formOverride && required.some(k => !data[k])) return setError('Please answer all questions')
    setError(''); setSleeping(false); setLoading(true)
    try {
      let res = await api.post('/user/risk-profile', data)
      if (res.data.success) {
        setResult(res.data.data.riskProfile)
      } else if (res.data.sleeping) {
        setSavedForm(data); setSleeping(true)
      } else {
        setError(res.data.error || 'Submission failed')
      }
    } catch (e) {
      if (e.response?.data?.sleeping) {
        setSavedForm(data); setSleeping(true)
      } else {
        setError(e.response?.data?.error || 'Submission failed. Please try again.')
      }
    }
    setLoading(false)
  }

  let SelectGroup = ({ label, field, options }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', color: 'var(--white)', fontSize: '15px', fontWeight: 500, marginBottom: '10px' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => set(field, opt.value)}
            style={{
              padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
              background: form[field] == opt.value ? 'var(--lime)' : 'var(--bg)',
              color: form[field] == opt.value ? '#0d0d0d' : 'var(--muted)',
              border: `1px solid ${form[field] == opt.value ? 'var(--lime)' : 'var(--border)'}`,
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Investor Profile</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Answer these questions so our AI can build your personalized investment profile.</p>

      {result ? (
        <div>
          <div className="card" style={{ marginBottom: '20px', background: 'var(--success-bg)', border: '1px solid rgba(185,255,102,0.3)' }}>
            <h2 style={{ color: 'var(--lime)', marginTop: 0 }}>🎯 Your Investor Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Investor Type</div>
                <div style={{ color: 'var(--white)', fontSize: '22px', fontWeight: 700 }}>{result.investorType}</div>
              </div>
              <div>
                <div style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Expected Return</div>
                <div style={{ color: 'var(--white)', fontSize: '22px', fontWeight: 700 }}>{result.expectedReturnMin}–{result.expectedReturnMax}%</div>
              </div>
              <div>
                <div style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Profile Score</div>
                <div style={{ color: 'var(--white)', fontSize: '22px', fontWeight: 700 }}>{result.profileScore} / 100</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--white)', marginTop: 0 }}>📊 Suggested Allocation</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(result.suggestedAllocation || {}).map(([sector, pct]) => (
                <div key={sector} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--lime)', fontSize: '20px', fontWeight: 700 }}>{pct}%</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{sector}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/recommendations')} className="btn-primary">🤖 Get AI Stock Picks</button>
            <button onClick={() => setResult(null)} className="btn-outline">Retake Questionnaire</button>
          </div>
        </div>
      ) : loading ? (
        <div className="card" style={{ maxWidth: '760px' }}>
          <AIThinking mode="full" label="AI is analyzing your investor profile" />
        </div>
      ) : sleeping ? (
        <div className="card" style={{ maxWidth: '760px' }}>
          <WakeUpAI onReady={() => { setSleeping(false); handleSubmit(savedForm) }} />
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '760px' }}>
          {error && <div className="alert-error" style={{ marginBottom: '16px' }}><span>⚠</span> {error}</div>}

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
              { value: 'Passive Income',  label: '💤 Passive Income'  },
              { value: 'Retirement',      label: '🌴 Retirement'      },
              { value: 'Capital Growth',  label: '🚀 Capital Growth'  },
            ]} />

          <button onClick={() => handleSubmit()} disabled={loading} className="btn-primary" style={{ marginTop: '8px', padding: '12px 32px' }}>
            🤖 Generate My Profile
          </button>
        </div>
      )}
    </Layout>
  )
}

export default RiskQuestionnaire
