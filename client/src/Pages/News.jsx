import { useEffect, useRef, useState } from 'react'
import api from '../api'
import Layout from '../components/Layout'

function NewsLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="card" style={{ display: 'flex', gap: '16px', opacity: 0.5 }}>
          <div style={{
            width: '100px', height: '70px', borderRadius: '8px', flexShrink: 0,
            background: 'var(--border)',
            animation: `pulse-ring 1.8s ${i * 0.15}s ease-in-out infinite alternate`,
          }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <div style={{ height: '14px', borderRadius: '6px', background: 'var(--border)', width: '75%', animation: `pulse-ring 1.8s ${i*0.1}s ease-in-out infinite alternate` }} />
            <div style={{ height: '12px', borderRadius: '6px', background: 'var(--border)', width: '90%', animation: `pulse-ring 1.8s ${i*0.2}s ease-in-out infinite alternate` }} />
            <div style={{ height: '12px', borderRadius: '6px', background: 'var(--border)', width: '55%', animation: `pulse-ring 1.8s ${i*0.12}s ease-in-out infinite alternate` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ symbol, serviceDown, onRetry }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '18px',
      animation: 'fadeSlideUp 0.4s ease both',
    }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'rgba(185,255,102,0.07)', border: '1px solid rgba(185,255,102,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', margin: '0 auto 20px',
      }}>
        {serviceDown ? '📡' : symbol ? '🔍' : '📰'}
      </div>

      <h3 style={{ color: 'var(--white)', fontSize: '17px', fontWeight: 700, margin: '0 0 8px' }}>
        {serviceDown
          ? 'News Service Is Starting Up'
          : symbol
          ? `No News Found for ${symbol}`
          : 'No Market News Available'}
      </h3>

      <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 24px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
        {serviceDown
          ? 'The news service is waking up — this usually takes about 30–60 seconds on first load. Try again in a moment.'
          : symbol
          ? `We couldn't find recent news for "${symbol}". Try a different symbol like MEBL, HBL, or ENGRO.`
          : 'No PSX market news is available right now. The service may be warming up — try refreshing in a moment.'}
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onRetry} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '14px' }}>↺</span> Try Again
        </button>
        {symbol && (
          <button onClick={() => { onRetry(true) }} className="btn-outline">
            Load Market News Instead
          </button>
        )}
      </div>

      {serviceDown && (
        <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '20px', opacity: 0.6 }}>
          Free-tier hosting powers this service — it sleeps when idle and takes a moment to wake up.
        </p>
      )}
    </div>
  )
}

function News() {
  let [news, setNews]               = useState([])
  let [loading, setLoading]         = useState(true)
  let [symbol, setSymbol]           = useState('')
  let [error, setError]             = useState('')
  let [serviceDown, setServiceDown] = useState(false)
  let searchRef = useRef()

  async function loadMarketNews() {
    setLoading(true); setSymbol(''); setError(''); setServiceDown(false)
    try {
      let res = await api.get('/news/market')
      if (res.data.success) {
        setNews(res.data.data || [])
        if (res.data.serviceDown) setServiceDown(true)
      } else {
        setError('Could not load news right now.'); setNews([])
      }
    } catch {
      setError('Could not reach the news service. Please try again.'); setNews([])
    }
    setLoading(false)
  }

  async function loadStockNews(sym) {
    let s = sym || searchRef.current?.value.trim().toUpperCase()
    if (!s) return
    setLoading(true); setSymbol(s); setError(''); setServiceDown(false)
    try {
      let res = await api.get(`/news/${s}`)
      if (res.data.success) {
        setNews(res.data.data || [])
        if (res.data.serviceDown) setServiceDown(true)
      } else {
        setError('Could not load news for this symbol.'); setNews([])
      }
    } catch {
      setError('Could not reach the news service. Please try again.'); setNews([])
    }
    setLoading(false)
  }

  useEffect(() => { loadMarketNews() }, [])

  let sentimentColor = l => l === 'Positive' ? 'var(--success)' : l === 'Negative' ? 'var(--danger)' : 'var(--muted)'
  let sentimentBg    = l => l === 'Positive' ? 'var(--success-bg)' : l === 'Negative' ? 'var(--danger-bg)' : 'var(--bg-hover)'
  let sentimentIcon  = l => l === 'Positive' ? '↑' : l === 'Negative' ? '↓' : '–'

  return (
    <Layout>
      <h1 style={{ color:'var(--white)', fontSize:'24px', fontWeight:700, marginBottom:'8px' }}>📰 News & Sentiment</h1>
      <p style={{ color:'var(--muted)', marginBottom:'24px' }}>AI-powered news sentiment analysis for PSX stocks</p>

      {/* Search bar */}
      <div className="card" style={{ marginBottom:'24px' }}>
        <label className="field-label">Search Stock News</label>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Stock symbol (e.g. MEBL)"
            className="input-field"
            style={{ flex:1, minWidth:'180px', textTransform:'uppercase' }}
            onKeyDown={e => e.key === 'Enter' && loadStockNews()}
          />
          <button onClick={() => loadStockNews()} className="btn-primary" style={{ whiteSpace:'nowrap' }}>Search</button>
          <button onClick={loadMarketNews} className="btn-outline" style={{ whiteSpace:'nowrap' }}>Market News</button>
        </div>
      </div>

      {/* Header row */}
      {!loading && !error && (
        <div style={{ marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ color:'var(--white)', margin:0, fontSize:'16px', fontWeight:700 }}>
            {symbol ? `${symbol} News` : 'Market News'}
          </h3>
          <span style={{ color:'var(--muted)', fontSize:'13px' }}>{news.length} articles</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          borderRadius:'12px', padding:'14px 18px', marginBottom:'20px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap',
        }}>
          <span style={{ color:'var(--danger)', fontSize:'13px' }}>⚠ {error}</span>
          <button onClick={loadMarketNews} className="btn-ghost" style={{ fontSize:'12px', whiteSpace:'nowrap' }}>↺ Retry</button>
        </div>
      )}

      {/* States */}
      {loading ? (
        <NewsLoading />
      ) : news.length === 0 ? (
        <EmptyState
          symbol={symbol}
          serviceDown={serviceDown}
          onRetry={goMarket => goMarket === true ? loadMarketNews() : symbol ? loadStockNews(symbol) : loadMarketNews()}
        />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {news.map((article, i) => (
            <div key={i} className="card animate-in" style={{ display:'flex', gap:'16px', animationDelay:`${i*40}ms` }}>
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt=""
                  onError={e => { e.currentTarget.style.display = 'none' }}
                  style={{ width:'100px', height:'70px', objectFit:'cover', borderRadius:'8px', flexShrink:0 }}
                />
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px', marginBottom:'6px' }}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color:'var(--white)', fontWeight:600, fontSize:'14px', textDecoration:'none', lineHeight:1.4, flex:1 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--white)'}
                  >
                    {article.title}
                  </a>
                  {article.sentiment && (
                    <div style={{
                      background: sentimentBg(article.sentiment.label),
                      border:`1px solid ${sentimentColor(article.sentiment.label)}44`,
                      borderRadius:'8px', padding:'5px 10px', textAlign:'center', flexShrink:0,
                    }}>
                      <div style={{ color:sentimentColor(article.sentiment.label), fontSize:'13px', fontWeight:700 }}>
                        {sentimentIcon(article.sentiment.label)} {article.sentiment.label}
                      </div>
                      <div style={{ color:'var(--muted)', fontSize:'10px' }}>{article.sentiment.confidence}% confidence</div>
                    </div>
                  )}
                </div>
                {article.description && (
                  <p style={{ color:'var(--muted)', fontSize:'13px', margin:'0 0 8px', lineHeight:1.5 }}>
                    {article.description.slice(0, 160)}{article.description.length > 160 ? '...' : ''}
                  </p>
                )}
                <div style={{ color:'var(--muted)', fontSize:'11px', opacity:0.55, display:'flex', gap:'8px' }}>
                  {article.source?.name && <span>{article.source.name}</span>}
                  {article.source?.name && <span>·</span>}
                  <span>{new Date(article.publishedAt).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default News
