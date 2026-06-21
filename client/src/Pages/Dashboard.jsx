import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import api from '../api'
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
  const [chatInput,   setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  async function sendChat(e) {
    e?.preventDefault()
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)
    try {
      const res = await api.post('/gemini/chat', { message: msg })
      const reply = res.data?.data?.reply || 'No response from AI.'
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'AI service offline. Start it: cd ai-service && python main.py' }])
    }
    setChatLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

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
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px' }}>{greeting},</p>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
            {user.name?.split(' ')[0] || 'Investor'} <span style={{ color: 'var(--lime)' }}>👋</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>Here's your portfolio snapshot for today.</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', color: 'var(--muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {metricCards.map(card => (
          <div key={card.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', transition: 'all 0.2s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + '44'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
              <span style={{ fontSize: '14px', color: card.color, background: card.color + '15', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</span>
            </div>
            <div style={{ color: card.color, fontSize: '19px', fontWeight: 700 }}>{loading ? <span style={{ color: 'var(--muted)' }}>—</span> : card.value}</div>
            <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Sector Allocation */}
        <div className="card">
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
        <div className="card">
          <div className="section-tag" style={{ marginBottom: '6px' }}>Shortcuts</div>
          <h3 style={{ color: 'var(--white)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div className="section-tag" style={{ marginBottom: '6px' }}>Live Market</div>
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
                      <td key={j}><div style={{ height: '14px', borderRadius: '4px', background: 'var(--bg-hover)', width: j === 1 ? '120px' : '60px' }} /></td>
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
        <div style={{
          position: 'fixed', bottom: '92px', right: '28px', zIndex: 499,
          width: '360px', height: '480px',
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
              <div key={i} style={{
                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
                  background: msg.role === 'user' ? 'var(--lime)' : 'var(--bg)',
                  color: msg.role === 'user' ? '#0d0d0d' : 'var(--white)',
                  fontSize: '13px', lineHeight: 1.5,
                  border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px 0' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--lime)', opacity: 0.6,
                    animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                  }} />
                ))}
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
