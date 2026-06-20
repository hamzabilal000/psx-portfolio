const { Portfolio } = require("../models/portfolio.model")
const { Stock } = require("../models/stock.model")
const { StockPrice } = require("../models/stockprice.model")
const { Transaction } = require("../models/transaction.model")

async function getPortfolio(req, res) {
    try {
        let portfolio = await Portfolio.findOne({ user: req.user.id })
        if (!portfolio) {
            return res.json({ success: true, data: null })
        }

        let symbols = portfolio.holdings.map(h => h.symbol)
        let prices = await StockPrice.find({ symbol: { $in: symbols } })
        let stocks = await Stock.find({ symbol: { $in: symbols } })

        let priceMap = {}
        prices.forEach(p => { priceMap[p.symbol] = p.price })

        let stockMap = {}
        stocks.forEach(s => { stockMap[s.symbol] = s })

        let enrichedHoldings = portfolio.holdings.map(h => {
            let currentPrice = priceMap[h.symbol] || h.avgBuyPrice
            let currentValue = currentPrice * h.quantity
            let profitLoss = currentValue - h.totalInvested
            let profitLossPct = ((profitLoss / h.totalInvested) * 100).toFixed(2)
            return {
                ...h.toObject(),
                currentPrice,
                currentValue: parseFloat(currentValue.toFixed(2)),
                profitLoss: parseFloat(profitLoss.toFixed(2)),
                profitLossPct: parseFloat(profitLossPct),
                stock: stockMap[h.symbol] || null
            }
        })

        let totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.totalInvested, 0)
        let currentValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0)
        let totalProfitLoss = currentValue - totalInvested
        let roi = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0

        let annualDividend = enrichedHoldings.reduce((sum, h) => {
            let stock = stockMap[h.symbol]
            let divYield = stock?.avgDividendYield || 0
            return sum + (h.currentValue * divYield / 100)
        }, 0)

        res.json({
            success: true,
            data: {
                portfolio: { ...portfolio.toObject(), holdings: enrichedHoldings },
                metrics: {
                    totalInvested: parseFloat(totalInvested.toFixed(2)),
                    currentValue: parseFloat(currentValue.toFixed(2)),
                    totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
                    roi: parseFloat(roi),
                    estimatedAnnualDividend: parseFloat(annualDividend.toFixed(2))
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function addHolding(req, res) {
    try {
        let { symbol, quantity, avgBuyPrice } = req.body
        if (!symbol || !quantity || !avgBuyPrice) {
            return res.status(400).json({ success: false, error: "symbol, quantity, avgBuyPrice required" })
        }

        let stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
        if (!stock) return res.status(404).json({ success: false, error: "Stock not found" })

        let totalInvested = quantity * avgBuyPrice
        let portfolio = await Portfolio.findOne({ user: req.user.id })

        if (!portfolio) {
            portfolio = await Portfolio.create({ user: req.user.id, holdings: [] })
        }

        let existingIdx = portfolio.holdings.findIndex(h => h.symbol === symbol.toUpperCase())
        if (existingIdx >= 0) {
            let existing = portfolio.holdings[existingIdx]
            let newTotal = existing.totalInvested + totalInvested
            let newQty = existing.quantity + quantity
            portfolio.holdings[existingIdx].quantity = newQty
            portfolio.holdings[existingIdx].avgBuyPrice = newTotal / newQty
            portfolio.holdings[existingIdx].totalInvested = newTotal
        } else {
            portfolio.holdings.push({ symbol: symbol.toUpperCase(), quantity, avgBuyPrice, totalInvested })
        }

        await portfolio.save()

        await Transaction.create({
            user: req.user.id,
            symbol: symbol.toUpperCase(),
            type: 'BUY',
            quantity,
            price: avgBuyPrice,
            totalAmount: totalInvested
        })

        res.json({ success: true, data: portfolio })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message, code: error.code })
    }
}

async function removeHolding(req, res) {
    try {
        let { symbol } = req.params
        let portfolio = await Portfolio.findOne({ user: req.user.id })
        if (!portfolio) return res.status(404).json({ success: false, error: "Portfolio not found" })

        let holding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase())
        if (!holding) return res.status(404).json({ success: false, error: "Holding not found" })

        let price = await StockPrice.findOne({ symbol: symbol.toUpperCase() })
        let sellPrice = price?.price || holding.avgBuyPrice

        await Transaction.create({
            user: req.user.id,
            symbol: symbol.toUpperCase(),
            type: 'SELL',
            quantity: holding.quantity,
            price: sellPrice,
            totalAmount: holding.quantity * sellPrice,
            notes: 'Removed from portfolio'
        })

        portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol.toUpperCase())
        await portfolio.save()

        res.json({ success: true, data: { message: "Holding removed" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getPortfolio, addHolding, removeHolding }
