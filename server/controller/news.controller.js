require('dotenv').config()
const axios = require("axios")

async function getStockNews(req, res) {
    try {
        let { symbol } = req.params
        let newsApiKey = process.env.NEWS_API_KEY

        let articles = []
        if (newsApiKey && newsApiKey !== 'your_newsapi_key_here') {
            let newsRes = await axios.get(`https://newsapi.org/v2/everything`, {
                params: {
                    q: `${symbol} Pakistan stock PSX`,
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    apiKey: newsApiKey
                }
            })
            articles = newsRes.data.articles || []
        }

        // Analyze sentiment for each article via AI service
        let enriched = await Promise.all(articles.map(async article => {
            try {
                let sentRes = await axios.post(`${process.env.AI_SERVICE_URL}/sentiment`, {
                    text: `${article.title} ${article.description || ''}`
                })
                return { ...article, sentiment: sentRes.data }
            } catch {
                return { ...article, sentiment: { label: 'Neutral', score: 0.5 } }
            }
        }))

        res.json({ success: true, data: enriched })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getMarketNews(req, res) {
    try {
        let newsApiKey = process.env.NEWS_API_KEY
        let articles = []

        if (newsApiKey && newsApiKey !== 'your_newsapi_key_here') {
            let newsRes = await axios.get(`https://newsapi.org/v2/everything`, {
                params: {
                    q: 'PSX KSE100 Pakistan stock market',
                    sortBy: 'publishedAt',
                    pageSize: 20,
                    apiKey: newsApiKey
                }
            })
            articles = newsRes.data.articles || []
        }

        res.json({ success: true, data: articles })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getStockNews, getMarketNews }
