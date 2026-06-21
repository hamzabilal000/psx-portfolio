const axios = require("axios")

const AI = () => process.env.AI_SERVICE_URL || "http://localhost:8001"

const _aiPost = async (path, body) => {
    try {
        const res = await axios.post(`${AI()}${path}`, body, { timeout: 60000 })
        return res.data
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            throw new Error("AI service is not running. Start it with: cd ai-service && python main.py")
        }
        const detail = err.response?.data?.detail || err.message
        throw new Error(detail)
    }
}

async function analyzeStock(req, res) {
    try {
        const { stock } = req.body
        if (!stock) return res.status(400).json({ success: false, error: "stock object required" })
        const data = await _aiPost("/gemini/analyze-stock", { stock })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: error.message })
    }
}

async function portfolioAdvice(req, res) {
    try {
        const { holdings, profile } = req.body
        const data = await _aiPost("/gemini/portfolio-advice", {
            holdings: holdings || [],
            profile: profile || {}
        })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: error.message })
    }
}

async function chat(req, res) {
    try {
        const { message, context } = req.body
        if (!message) return res.status(400).json({ success: false, error: "message required" })
        const data = await _aiPost("/gemini/chat", { message, context: context || "" })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: error.message })
    }
}

async function compareStocks(req, res) {
    try {
        const { stock_a, stock_b } = req.body
        if (!stock_a || !stock_b) return res.status(400).json({ success: false, error: "stock_a and stock_b required" })
        const data = await _aiPost("/gemini/compare", { stock_a, stock_b })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: error.message })
    }
}

module.exports = { analyzeStock, portfolioAdvice, chat, compareStocks }
