import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import AIThinking from '../components/AIThinking'
import WakeUpAI from '../components/WakeUpAI'
import api, { aiSleeping } from '../api'
import Layout from '../components/Layout'

const COLORS = ['#b9ff66', '#60a5fa', '#f59e0b', '#a78bfa', '#fb7185', '#34d399', '#f87171', '#38bdf8']

const quickActions = [
  { label: 'AI Picks',     icon: '✦', path: '/recommendations', color: '#b9ff66', bg: 'rgba(185,255,102,0.08)' },
  { label: 'Portfolio',    icon: '◈', path: '/portfolio',       color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  { label: 'Calculators', icon: '⊟', path: '/calculators',     color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  { label: 'Watchlist',   icon: '◉', path: '/watchlist',       color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { label: 'Market News', icon: '⊙', path: '/news',            color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  { label: 'Risk Analyzer',icon: '◬', path: '/risk-analyzer',  color: '#fb7185', bg: 'rgba(251,113,133,0.08)' },
]

function Dashboard() {
  const [portfolio, setPortfolio] = useState(null)
  const [stocks,    setStocks]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const navigate = useNavigate()

  // AI Chat state
  const [chatOpen,     setChatOpen]     = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m your PSX AI assistant. Ask me anything about stocks, dividends, or your portfolio.' }
  ])
  const [chatInput,    setChatInput]    = useState('')
  const [chatLoading,  setChatLoading]  = useState(false)
  const [aiSleeping,   setAiSleeping]   = useState(false)
  const [pendingMsg,   setPendingMsg]   = useState('')
  const chatEndRef = useRef(null)

  async function sendChat(e) {
    e?.preventDefault()
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setAiSleeping(false)
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)
    try {
      const res = await api.post('/gemini/chat', { message: msg })
      if (res.data?.success) {
        const reply = res.data?.data?.reply || 'No response from AI.'
        setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
      } else if (res.data?.sleeping) {
        setPendingMsg(msg)
        setAiSleeping(true)
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: res.data?.error || 'Could not get a response. Please try again.' }])
      }
    } catch (err) {
      if (aiSleeping(err)) {
        setPendingMsg(msg)
        setAiSleeping(true)
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: err.response?.data?.error || 'Could not get a response. Please try again.' }])
      }
    }
    setChatLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function handleAiReady() {
    setAiSleeping(false)
    if (pendingMsg) {
      setChatInput(pendingMsg)
      setPendingMsg('')
      setTimeout(() => sendChat(), 100)
    }
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const _h = new Date().getHours()
  const _seed = new Date().getDate() + new Date().getMonth()

  const _greetings = {
    dawn:      [ 'Rise and grind —',       'Early bird mode:',       'Up before the market —',   'Sunrise investor alert —' ],
    morning:   [ 'Markets are live —',     'KSE-100 is ticking —',   'Alpha hunter mode: on —',  'Time to make moves —'     ],
    midday:    [ 'Mid-session check-in —', 'Afternoon hustle —',     'Stay sharp —',             'Bulls & bears at war —'   ],
    afternoon: [ 'Session in full swing —','Charts looking spicy —',  'Keep your eyes open —',   'Smart money is moving —'  ],
    evening:   [ 'Markets closed for today —', 'Review & recharge —', 'Time to debrief —',      'Post-market mode —'       ],
    night:     [ 'Night owl investor —',   'Research never sleeps —', 'Planning tomorrow? —',    'After-hours thinker —'    ],
    latenight: [ 'Burning the midnight oil —', 'The charts wait for no one —', 'Hustle hours —', 'While others sleep —'    ],
  }
  const _subs = {
    dawn:      [ "The early investor catches the best entry points.", "KSE-100 opens soon — are you ready?", "You're already ahead of 90% of investors.", "The market rewards the disciplined." ],
    morning:   [ "Let's see what the market has for you today.", "Your portfolio is live and breathing.", "Opportunities don't wait — neither should you.", "Stay focused, stay profitable." ],
    midday:    [ "How's the portfolio holding up?", "Volatility is just opportunity in disguise.", "Momentum traders are watching closely.", "Keep your thesis, ignore the noise." ],
    afternoon: [ "Smart investors review before market close.", "The last hour is often the most decisive.", "Any moves to make before close?", "Discipline beats emotion — every time." ],
    evening:   [ "Solid session. Time to reflect and plan.", "Review today's moves before tomorrow.", "Your next big win starts with tonight's research.", "The best investors never stop learning." ],
    night:     [ "Great time to study the charts in peace.", "Futures are moving — stay informed.", "Plan your entries for tomorrow.", "Research tonight, profit tomorrow." ],
    latenight: [ "The most disciplined investors do this right now.", "Quiet hours, clear mind — best time to think.", "Even Warren Buffett reads at night.", "Tomorrow's alpha is hidden in tonight's data." ],
  }

  const _period = _h >= 5 && _h < 7 ? 'dawn' : _h >= 7 && _h < 12 ? 'morning' : _h >= 12 && _h < 14 ? 'midday' : _h >= 14 && _h < 17 ? 'afternoon' : _h >= 17 && _h < 21 ? 'evening' : _h >= 21 && _h < 24 ? 'night' : 'latenight'
  const _i = _seed % 4
  const greeting = _greetings[_period][_i]
  const greetingSub = _subs[_period][_i]

  useEffect(() => {
    async function load() {
      try {
        const [portRes, stockRes] = await Promise.all([
          api.get('/portfolio'),
          api.get('/stocks'),
        ])
        if (portRes.data.success) setPortfolio(portRes.data.data)
        if (stockRes.data.success) setStocks(stockRes.data.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const metrics  = portfolio?.metrics
  const holdings = portfolio?.portfolio?.holdings || []
  const sectorData = holdings.reduce((acc, h) => {
    const sector = h.stock?.sector || h.symbol
    acc[sector] = (acc[sector] || 0) + (h.currentValue || h.totalInvested)
    return acc
  }, {})
  const pieData = Object.entries(sectorData).map(([name, value]) => ({ name, value: Math.round(value) }))

  const metricCards = [
    { label: 'Total Invested', value: metrics ? `PKR ${metrics.totalInvested?.toLocaleString()}` : '—', icon: '◈', color: '#60a5fa', sub: 'Capital deployed' },
    { label: 'Current Value',  value: metrics ? `PKR ${metrics.currentValue?.toLocaleString()}`  : '—', icon: '⊞', color: '#b9ff66', sub: 'Market valuation' },
    { label: 'Profit / Loss',  value: metrics ? `PKR ${metrics.totalProfitLoss?.toLocaleString()}`: '—', icon: metrics?.totalProfitLoss >= 0 ? '▲' : '▼', color: metrics?.totalProfitLoss >= 0 ? '#b9ff66' : '#ff6b6b', sub: 'Unrealized P&L' },
    { label: 'ROI',            value: metrics ? `${metrics.roi}%` : '—', icon: '◎', color: metrics?.roi >= 0 ? '#b9ff66' : '#ff6b6b', sub: 'Return on investment' },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="animate-in mobile-stack" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <p style={{ color: 'var(--lime)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px', textTransform: 'uppercase' }}>{greeting}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            {user.name?.split(' ')[0] || 'Investor'} <span style={{ color: 'var(--lime)' }}>👋</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '5px', fontSize: '13px' }}>{greetingSub}</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', color: 'var(--muted)', flexShrink: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {metricCards.map((card, idx) => (
          <div key={card.label} className={`hover-lift glow-border stagger-${idx + 1}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
            <div className="float-orb" style={{ width: '80px', height: '80px', background: card.color, bottom: '-30px', right: '-20px', opacity: 0.06, animationDelay: `${idx * 1.2}s` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
              <span style={{ fontSize: '14px', color: card.color, background: card.color + '15', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</span>
            </div>
            <div className="stat-value" style={{ color: card.color, fontSize: '19px', fontWeight: 700 }}>{loading ? <span className="skeleton" style={{ display:'inline-block', width:'90px', height:'20px' }} /> : card.value}</div>
            <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Sector Allocation */}
        <div className="card hover-lift glow-border stagger-5">
          <div className="section-tag" style={{ marginBottom: '6px' }}>Allocation</div>
          <h3 style={{ color: 'var(--white)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Sector Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={v => [`PKR ${v.toLocaleString()}`, 'Value']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>◈</div>
              <p style={{ fontSize: '14px' }}>No holdings yet.</p>
              <button onClick={() => navigate('/portfolio')} className="btn-outline" style={{ marginTop: '12px', padding: '8px 20px', fontSize: '13px' }}>Add Holdings</button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card hover-lift glow-border stagger-6">
          <div className="section-tag" style={{ marginBottom: '6px' }}>Shortcuts</div>
          <h3 style={{ color: 'var(--white)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {quickActions.map(action => (
              <button key={action.path} onClick={() => navigate(action.path)}
                style={{ padding: '14px 10px', background: action.bg, border: `1px solid ${action.color}22`, borderRadius: '12px', color: action.color, cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = action.color + '55' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = action.color + '22' }}>
                <span style={{ fontSize: '18px' }}>{action.icon}</span>{action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Stocks */}
      <div className="card hover-lift animate-in" style={{ animationDelay: '0.45s' }}>
        <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div className="section-tag">Live Market</div>
              <span className="live-dot" />
            </div>
            <h3 style={{ color: 'var(--white)', fontSize: '16px', fontWeight: 700 }}>PSX Top Stocks</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/compare')} className="btn-ghost">Compare →</button>
            <button onClick={() => navigate('/news')}    className="btn-ghost">News →</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>{['Symbol', 'Company', 'Sector', 'Price (PKR)', 'Change', 'Div Yield', 'Risk'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: '14px', width: j === 1 ? '120px' : '60px' }} /></td>
                    ))}</tr>
                  ))
                : stocks.slice(0, 12).map(s => (
                    <tr key={s.symbol}>
                      <td><span style={{ color: 'var(--lime)', fontWeight: 700, fontSize: '13px', background: 'var(--lime-subtle)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(185,255,102,0.15)' }}>{s.symbol}</span></td>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>{s.name}</td>
                      <td><span className="chip">{s.sector}</span></td>
                      <td style={{ color: 'var(--white)', fontWeight: 600 }}>{s.currentPrice ? s.currentPrice.toLocaleString() : '—'}</td>
                      <td><span style={{ color: s.changePct >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{s.changePct != null ? `${s.changePct >= 0 ? '▲' : '▼'} ${Math.abs(s.changePct)}%` : '—'}</span></td>
                      <td style={{ color: 'var(--warn)', fontWeight: 600 }}>{s.avgDividendYield ? `${s.avgDividendYield}%` : '—'}</td>
                      <td><span className={`badge-${s.riskLevel?.toLowerCase()}`}>{s.riskLevel}</span></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
      {/* ── AI Chat Widget ──────────────────────────────────────── */}

      {/* Floating trigger button */}
      <button
        className="chat-fab"
        onClick={() => setChatOpen(o => !o)}
        title="Ask AI about PSX"
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 500,
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--lime)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', boxShadow: '0 4px 20px rgba(185,255,102,0.35)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {chatOpen ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div className="chat-panel" style={{
          position: 'fixed', bottom: '92px', right: '28px', zIndex: 499,
          width: 'min(380px, calc(100vw - 40px))',
          height: 'min(500px, calc(100vh - 120px))',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>✦</span>
            <div>
              <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: '14px' }}>PSX AI Assistant</div>
              <div style={{ color: 'var(--lime)', fontSize: '11px' }}>Powered by Gemini</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} className="msg-pop" style={{
                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animationDelay: '0s',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
                  background: msg.role === 'user' ? 'var(--lime)' : 'var(--bg)',
                  color: msg.role === 'user' ? '#0d0d0d' : 'var(--white)',
                  fontSize: '13px', lineHeight: 1.5,
                  border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                  boxShadow: msg.role === 'user' ? '0 2px 12px rgba(185,255,102,0.2)' : 'none',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '10px 14px', maxWidth: '80%',
              }}>
                <AIThinking mode="chat" />
              </div>
            )}
            {aiSleeping && !chatLoading && (
              <div style={{
                background: 'var(--bg)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '12px', maxWidth: '88%',
              }}>
                <WakeUpAI compact onReady={handleAiReady} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendChat} style={{
            padding: '12px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px',
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask about PSX stocks..."
              disabled={chatLoading}
              style={{
                flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '9px 12px', color: 'var(--white)',
                fontSize: '13px', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button type="submit" disabled={chatLoading || !chatInput.trim()}
              style={{
                padding: '9px 14px', background: 'var(--lime)', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                fontSize: '13px', color: '#0d0d0d', fontFamily: 'inherit',
                opacity: (!chatInput.trim() || chatLoading) ? 0.5 : 1,
              }}>
              ↑
            </button>
          </form>
        </div>
      )}
    </Layout>
  )
}

export default Dashboard
