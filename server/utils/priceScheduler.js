require('dotenv').config()
const cron = require("node-cron")
const axios = require("axios")
const { StockPrice } = require("../models/stockprice.model")
const { Stock } = require("../models/stock.model")
const { Alert } = require("../models/alert.model")
const { Notification } = require("../models/notification.model")

// Fetch prices from AI service (which uses yfinance)
async function updatePrices() {
    try {
        let stocks = await Stock.find({ isActive: true, yahooTicker: { $exists: true, $ne: null } })
        let tickers = stocks.map(s => ({ symbol: s.symbol, yahooTicker: s.yahooTicker }))

        let res = await axios.post(`${process.env.AI_SERVICE_URL}/prices/update`, { tickers })
        let prices = res.data.prices

        for (let p of prices) {
            await StockPrice.findOneAndUpdate(
                { symbol: p.symbol },
                { ...p, source: 'yfinance' },
                { upsert: true, new: true }
            )
        }

        await checkAlerts()
        console.log(`[Scheduler] Updated ${prices.length} stock prices`)
    } catch (error) {
        console.log("[Scheduler] Price update failed:", error.message)
    }
}

async function checkAlerts() {
    try {
        let activeAlerts = await Alert.find({ isActive: true })
        for (let alert of activeAlerts) {
            let priceDoc = await StockPrice.findOne({ symbol: alert.symbol })
            if (!priceDoc) continue

            let triggered = (
                (alert.condition === 'ABOVE' && priceDoc.price >= alert.targetPrice) ||
                (alert.condition === 'BELOW' && priceDoc.price <= alert.targetPrice)
            )

            if (triggered) {
                await Alert.findByIdAndUpdate(alert._id, { isActive: false, triggeredAt: new Date() })
                await Notification.create({
                    user: alert.user,
                    type: 'PRICE_ALERT',
                    title: `Alert Triggered: ${alert.symbol}`,
                    message: `${alert.symbol} is ${alert.condition === 'ABOVE' ? 'above' : 'below'} PKR ${alert.targetPrice}. Current: PKR ${priceDoc.price}`,
                    metadata: { symbol: alert.symbol, price: priceDoc.price, alertId: alert._id }
                })
            }
        }
    } catch (error) {
        console.log("[Scheduler] Alert check failed:", error.message)
    }
}

function startScheduler() {
    // Run every 15 minutes during market hours (Mon-Fri 9:30am-3:30pm PKT)
    cron.schedule('*/15 9-15 * * 1-5', updatePrices, { timezone: "Asia/Karachi" })
    console.log("[Scheduler] Price update scheduler started (every 15 min, market hours)")
}

module.exports = { startScheduler, updatePrices }
