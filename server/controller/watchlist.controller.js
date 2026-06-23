const { Watchlist } = require("../models/watchlist.model")
const { Stock } = require("../models/stock.model")
const { StockPrice } = require("../models/stockprice.model")
const { Transaction } = require("../models/transaction.model")

async function getWatchlist(req, res) {
    try {
        let items = await Watchlist.find({ user: req.user.id })
        let symbols = items.map(i => i.symbol)

        const [stocks, prices, txns] = await Promise.all([
            Stock.find({ symbol: { $in: symbols } }),
            StockPrice.find({ symbol: { $in: symbols } }),
            Transaction.find({ user: req.user.id, symbol: { $in: symbols } }).sort({ executedAt: -1 })
        ])

        let priceMap = {}
        prices.forEach(p => { priceMap[p.symbol] = p })
        let stockMap = {}
        stocks.forEach(s => { stockMap[s.symbol] = s })

        // Last buy / sell per symbol (txns already sorted newest-first)
        let lastBuyMap = {}, lastSellMap = {}
        txns.forEach(t => {
            if (t.type === 'BUY'  && !lastBuyMap[t.symbol])  lastBuyMap[t.symbol]  = { price: t.price, date: t.executedAt }
            if (t.type === 'SELL' && !lastSellMap[t.symbol]) lastSellMap[t.symbol] = { price: t.price, date: t.executedAt }
        })

        let result = items.map(item => ({
            ...item.toObject(),
            stock:        stockMap[item.symbol] || null,
            currentPrice: priceMap[item.symbol]?.price || null,
            changePct:    priceMap[item.symbol]?.changePct || null,
            changeAmt:    priceMap[item.symbol]?.changeAmt || null,
            lastBuy:      lastBuyMap[item.symbol]  || null,
            lastSell:     lastSellMap[item.symbol] || null,
        }))

        res.json({ success: true, data: result })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function addToWatchlist(req, res) {
    try {
        let { symbol } = req.body
        if (!symbol) return res.status(400).json({ success: false, error: "symbol required" })

        let stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
        if (!stock) return res.status(404).json({ success: false, error: "Stock not found" })

        let item = await Watchlist.create({ user: req.user.id, symbol: symbol.toUpperCase() })
        res.status(201).json({ success: true, data: item })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message, code: error.code })
    }
}

async function removeFromWatchlist(req, res) {
    try {
        let { symbol } = req.params
        await Watchlist.findOneAndDelete({ user: req.user.id, symbol: symbol.toUpperCase() })
        res.json({ success: true, data: { message: "Removed from watchlist" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist }
