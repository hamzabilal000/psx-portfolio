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

let app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
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

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date() } }))

app.listen(8080, () => {
    console.log("PSX Portfolio Server running on http://localhost:8080")
})
