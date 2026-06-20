import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
axios.defaults.withCredentials = true

function News() {
  let [news, setNews] = useState([])
  let [loading, setLoading] = useState(true)
  let [symbol, setSymbol] = useState('')
  let searchRef = useRef()

  async function loadMarketNews() {
    setLoading(true); setSymbol('')
    try {
      let res = await axios.get('http://localhost:8080/news/market')
      if (res.data.success) setNews(res.data.data)
    } catch {}
    setLoading(false)
  }

  async function loadStockNews() {
    let sym = searchRef.current.value.trim().toUpperCase()
    if (!sym) return
    setLoading(true); setSymbol(sym)
    try {
      let res = await axios.get(`http://localhost:8080/news/${sym}`)
      if (res.data.success) setNews(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadMarketNews() }, [])

  let sentimentColor = label => label === 'Positive' ? 'var(--success)' : label === 'Negative' ? 'var(--danger)' : 'var(--muted)'
  let sentimentBg    = label => label === 'Positive' ? 'var(--success-bg)' : label === 'Negative' ? 'var(--danger-bg)' : 'var(--bg-hover)'

  return (
    <Layout>
      <h1 style={{ color: 'var(--white)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📰 News & Sentiment</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>AI-powered news sentiment analysis for PSX stocks</p>

      {/* Search */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Search Stock News</label>
          <input ref={searchRef} type="text" placeholder="Stock symbol (e.g. MEBL)" className="input-field" style={{ textTransform: 'uppercase' }} />
        </div>
        <button onClick={loadStockNews} className="btn-primary">Search</button>
        <button onClick={loadMarketNews} className="btn-outline">Market News</button>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--white)', margin: 0, fontSize: '16px', fontWeight: 700 }}>
          {symbol ? `${symbol} News` : 'Market News'}
        </h3>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{news.length} articles</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px' }}>Loading news...</div>
      ) : news.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📰</div>
          <p style={{ color: 'var(--muted)' }}>No news found. Make sure the AI service is running: <code style={{color:'var(--lime)'}}>cd ai-service && python main.py</code></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {news.map((article, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: '16px' }}>
              {article.urlToImage && (
                <img src={article.urlToImage} alt="" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <a href={article.url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--white)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', lineHeight: 1.4, flex: 1, marginRight: '12px' }}>
                    {article.title}
                  </a>
                  {article.sentiment && (
                    <div style={{ background: sentimentBg(article.sentiment.label), border: `1px solid ${sentimentColor(article.sentiment.label)}44`, borderRadius: '8px', padding: '4px 10px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ color: sentimentColor(article.sentiment.label), fontSize: '12px', fontWeight: 700 }}>{article.sentiment.label}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{article.sentiment.confidence}%</div>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {article.description?.slice(0, 150)}{article.description?.length > 150 ? '...' : ''}
                </p>
                <div style={{ color: 'var(--muted)', fontSize: '11px', opacity: 0.6 }}>
                  {article.source?.name} · {new Date(article.publishedAt).toLocaleDateString()}
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
