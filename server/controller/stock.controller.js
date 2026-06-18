const { Stock } = require("../models/stock.model")
const { StockPrice } = require("../models/stockprice.model")

async function getAllStocks(req, res) {
    try {
        let { sector, risk, search } = req.query
        let filter = { isActive: true }
        if (sector) filter.sector = sector
        if (risk) filter.riskLevel = risk
        if (search) filter.$or = [
            { symbol: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } }
        ]

        let stocks = await Stock.find(filter)
        let prices = await StockPrice.find({})
        let priceMap = {}
        prices.forEach(p => { priceMap[p.symbol] = p })

        let result = stocks.map(s => ({
            ...s.toObject(),
            currentPrice: priceMap[s.symbol]?.price || null,
            changePct: priceMap[s.symbol]?.changePct || null,
            priceUpdatedAt: priceMap[s.symbol]?.updatedAt || null
        }))

        res.json({ success: true, data: result })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getStockBySymbol(req, res) {
    try {
        let { symbol } = req.params
        let stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
        if (!stock) return res.status(404).json({ success: false, error: "Stock not found" })

        let price = await StockPrice.findOne({ symbol: stock.symbol })
        res.json({ success: true, data: { ...stock.toObject(), currentPrice: price?.price || null, priceData: price } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getStockPrice(req, res) {
    try {
        let { symbol } = req.params
        let price = await StockPrice.findOne({ symbol: symbol.toUpperCase() })
        if (!price) return res.status(404).json({ success: false, error: "Price not found" })
        res.json({ success: true, data: price })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getAllPrices(req, res) {
    try {
        let prices = await StockPrice.find({})
        res.json({ success: true, data: prices })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function compareStocks(req, res) {
    try {
        let { symbols } = req.query
        if (!symbols) return res.status(400).json({ success: false, error: "symbols query required (e.g. ?symbols=MEBL,HBL)" })

        let symbolArr = symbols.split(',').map(s => s.trim().toUpperCase()).slice(0, 4)
        let stocks = await Stock.find({ symbol: { $in: symbolArr } })
        let prices = await StockPrice.find({ symbol: { $in: symbolArr } })
        let priceMap = {}
        prices.forEach(p => { priceMap[p.symbol] = p.price })

        let result = stocks.map(s => ({ ...s.toObject(), currentPrice: priceMap[s.symbol] || null }))
        res.json({ success: true, data: result })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getSectors(req, res) {
    try {
        let sectors = await Stock.distinct('sector')
        res.json({ success: true, data: sectors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getAllStocks, getStockBySymbol, getStockPrice, getAllPrices, compareStocks, getSectors }
