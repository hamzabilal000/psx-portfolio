import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
axios.defaults.withCredentials = true

function News() {
  let [news, setNews] = useState([])
  let [loading, setLoading] = useState(true)
  let [symbol, setSymbol] = useState('')
  let searchRef = useRef()

  async function loadMarketNews() {
    setLoading(true); setSymbol('')
    try {
      let res = await axios.get("http://localhost:8080/news/market")
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

  let sentimentColor = label => label === 'Positive' ? '#22c55e' : label === 'Negative' ? '#ef4444' : '#94a3b8'
  let sentimentBg = label => label === 'Positive' ? '#14532d20' : label === 'Negative' ? '#7f1d1d20' : '#1a1f2e'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1f2e' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '28px 32px' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📰 News & Sentiment</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>AI-powered news sentiment analysis for PSX stocks</p>

        {/* Search */}
        <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Search Stock News</label>
            <input ref={searchRef} type="text" placeholder="Stock symbol (e.g. MEBL)" className="input-field" style={{ textTransform: 'uppercase' }} />
          </div>
          <button onClick={loadStockNews} className="btn-primary">Search</button>
          <button onClick={loadMarketNews} className="btn-outline">Market News</button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: '16px' }}>
            {symbol ? `${symbol} News` : 'Market News'}
          </h3>
          <span style={{ color: '#64748b', fontSize: '13px' }}>{news.length} articles</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>Loading news...</div>
        ) : news.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📰</div>
            <p style={{ color: '#64748b' }}>No news found. Configure NEWS_API_KEY in server .env to enable live news.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {news.map((article, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '16px' }}>
                {article.urlToImage && (
                  <img src={article.urlToImage} alt="" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <a href={article.url} target="_blank" rel="noreferrer"
                      style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px', textDecoration: 'none', lineHeight: 1.4, flex: 1, marginRight: '12px' }}>
                      {article.title}
                    </a>
                    {article.sentiment && (
                      <div style={{ background: sentimentBg(article.sentiment.label), border: `1px solid ${sentimentColor(article.sentiment.label)}44`, borderRadius: '6px', padding: '4px 10px', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ color: sentimentColor(article.sentiment.label), fontSize: '12px', fontWeight: 600 }}>{article.sentiment.label}</div>
                        <div style={{ color: '#64748b', fontSize: '10px' }}>{article.sentiment.confidence}%</div>
                      </div>
                    )}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {article.description?.slice(0, 150)}{article.description?.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ color: '#475569', fontSize: '11px' }}>
                    {article.source?.name} · {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default News
