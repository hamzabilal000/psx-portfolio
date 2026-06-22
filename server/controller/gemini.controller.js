const axios = require("axios")

const AI = () => process.env.AI_SERVICE_URL || "http://localhost:8001"

const _aiPost = async (path, body) => {
    try {
        const res = await axios.post(`${AI()}${path}`, body, { timeout: 65000 })
        return res.data
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
            throw new Error("AI_SLEEPING")
        }
        if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            throw new Error("AI_TIMEOUT")
        }
        if (err.response?.status === 503) {
            throw new Error("AI_SLEEPING")
        }
        const detail = err.response?.data?.detail || err.message
        throw new Error(detail)
    }
}

function _userMsg(err) {
    if (err.message === 'AI_SLEEPING')  return "The AI service is starting up. Please wait 30–60 seconds and try again."
    if (err.message === 'AI_TIMEOUT')   return "The AI service took too long to respond. Please try again."
    return err.message || "AI request failed. Please try again."
}

async function status(req, res) {
    try {
        const r = await axios.get(`${AI()}/health`, { timeout: 8000 })
        res.json({ success: true, data: { status: 'ready', gemini: r.data?.gemini ?? true } })
    } catch {
        res.json({ success: true, data: { status: 'sleeping' } })
    }
}

async function analyzeStock(req, res) {
    try {
        const { stock } = req.body
        if (!stock) return res.status(400).json({ success: false, error: "stock object required" })
        const data = await _aiPost("/gemini/analyze-stock", { stock })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: _userMsg(error), sleeping: error.message === 'AI_SLEEPING' })
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
        res.status(503).json({ success: false, error: _userMsg(error), sleeping: error.message === 'AI_SLEEPING' })
    }
}

async function chat(req, res) {
    try {
        const { message, context } = req.body
        if (!message) return res.status(400).json({ success: false, error: "message required" })
        const data = await _aiPost("/gemini/chat", { message, context: context || "" })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: _userMsg(error), sleeping: error.message === 'AI_SLEEPING' })
    }
}

async function compareStocks(req, res) {
    try {
        const { stock_a, stock_b } = req.body
        if (!stock_a || !stock_b) return res.status(400).json({ success: false, error: "stock_a and stock_b required" })
        const data = await _aiPost("/gemini/compare", { stock_a, stock_b })
        res.json({ success: true, data })
    } catch (error) {
        res.status(503).json({ success: false, error: _userMsg(error), sleeping: error.message === 'AI_SLEEPING' })
    }
}

module.exports = { status, analyzeStock, portfolioAdvice, chat, compareStocks }
