require('dotenv').config()
const axios = require("axios")

async function _rssNews(symbol = null) {
    const url = symbol
        ? `${process.env.AI_SERVICE_URL}/news/rss?symbol=${symbol}&limit=15`
        : `${process.env.AI_SERVICE_URL}/news/rss?limit=20`
    const res = await axios.get(url, { timeout: 10000 })
    return res.data.articles || []
}

async function _enrichSentiment(articles) {
    return Promise.all(articles.map(async article => {
        try {
            const sentRes = await axios.post(`${process.env.AI_SERVICE_URL}/gemini/news-sentiment`, {
                title: article.title,
                description: article.description || ''
            }, { timeout: 6000 })
            return { ...article, sentiment: sentRes.data }
        } catch {
            return { ...article, sentiment: { label: 'Neutral', score: 0.5, confidence: 50 } }
        }
    }))
}

async function getStockNews(req, res) {
    try {
        const { symbol } = req.params
        const newsApiKey = process.env.NEWS_API_KEY
        let articles = []

        if (newsApiKey && newsApiKey !== 'your_newsapi_key_here') {
            try {
                const newsRes = await axios.get(`https://newsapi.org/v2/everything`, {
                    params: {
                        q: `${symbol} Pakistan stock PSX`,
                        sortBy: 'publishedAt',
                        pageSize: 10,
                        apiKey: newsApiKey
                    },
                    timeout: 8000
                })
                articles = newsRes.data.articles || []
            } catch {
                articles = await _rssNews(symbol)
            }
        } else {
            articles = await _rssNews(symbol)
        }

        const enriched = await _enrichSentiment(articles)
        res.json({ success: true, data: enriched })
    } catch (error) {
        console.log('[News]', error.message)
        res.json({ success: false, error: error.message, data: [] })
    }
}

async function getMarketNews(req, res) {
    try {
        const newsApiKey = process.env.NEWS_API_KEY
        let articles = []

        if (newsApiKey && newsApiKey !== 'your_newsapi_key_here') {
            try {
                const newsRes = await axios.get(`https://newsapi.org/v2/everything`, {
                    params: {
                        q: 'PSX KSE100 Pakistan stock market',
                        sortBy: 'publishedAt',
                        pageSize: 20,
                        apiKey: newsApiKey
                    },
                    timeout: 8000
                })
                articles = newsRes.data.articles || []
            } catch {
                articles = await _rssNews()
            }
        } else {
            articles = await _rssNews()
        }

        // If RSS also returned nothing, return success with empty but don't error
        res.json({ success: true, data: articles })
    } catch (error) {
        console.log('[News]', error.message)
        // Return success:true so frontend shows proper empty state, not error
        res.json({ success: true, data: [], _error: error.message })
    }
}

module.exports = { getStockNews, getMarketNews }
