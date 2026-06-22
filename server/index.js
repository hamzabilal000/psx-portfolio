require('dotenv').config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const rateLimit = require("express-rate-limit")

const { auth_router } = require("./routes/auth.route")
const { user_router } = require("./routes/user.route")
const { stock_router } = require("./routes/stock.route")
const { portfolio_router } = require("./routes/portfolio.route")
const { watchlist_router } = require("./routes/watchlist.route")
const { alert_router } = require("./routes/alert.route")
const { transaction_router } = require("./routes/transaction.route")
const { calculator_router } = require("./routes/calculator.route")
const { recommendation_router } = require("./routes/recommendation.route")
const { news_router } = require("./routes/news.route")
const { admin_router } = require("./routes/admin.route")
const { gemini_router } = require("./routes/gemini.route")
const { startScheduler } = require("./utils/priceScheduler")
const axios = require("axios")

let app = express()

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
        cb(new Error('Not allowed by CORS'))
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Rate limit auth endpoints
let authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, error: "Too many requests" } })
app.use('/auth/login', authLimiter)
app.use('/auth/register', authLimiter)

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/psx-portfolio")
    .then(() => {
        console.log("MongoDB Connected")
        startScheduler()
        startKeepAlive()
    })
    .catch(err => console.error("DB Connection Error:", err))

app.use('/auth', auth_router)
app.use('/user', user_router)
app.use('/stocks', stock_router)
app.use('/portfolio', portfolio_router)
app.use('/watchlist', watchlist_router)
app.use('/alerts', alert_router)
app.use('/transactions', transaction_router)
app.use('/calc', calculator_router)
app.use('/ai', recommendation_router)
app.use('/news', news_router)
app.use('/admin', admin_router)
app.use('/gemini', gemini_router)

// Keep the Python AI service awake on Render free tier (sleeps after 15 min inactivity)
function startKeepAlive() {
    const aiUrl = process.env.AI_SERVICE_URL
    if (!aiUrl) return
    setInterval(async () => {
        try {
            await axios.get(`${aiUrl}/health`, { timeout: 20000 })
            console.log('[KeepAlive] AI service pinged OK')
        } catch (e) {
            console.log('[KeepAlive] AI service unreachable (may be waking up):', e.code || e.message)
        }
    }, 13 * 60 * 1000)  // every 13 minutes
}

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date() } }))

app.listen(8080, () => {
    console.log("PSX Portfolio Server running on http://localhost:8080")
})
