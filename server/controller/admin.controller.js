const { Stock } = require("../models/stock.model")
const { StockPrice } = require("../models/stockprice.model")
const { User } = require("../models/user.model")
const { updatePrices } = require("../utils/priceScheduler")

async function getStats(req, res) {
    try {
        let userCount = await User.countDocuments({ role: 'user' })
        let stockCount = await Stock.countDocuments({ isActive: true })
        let verifiedUsers = await User.countDocuments({ isVerified: true })
        let profiledUsers = await User.countDocuments({ riskProfile: { $exists: true } })

        res.json({
            success: true, data: {
                userCount, stockCount, verifiedUsers, profiledUsers
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getAllUsers(req, res) {
    try {
        let users = await User.find({}).select('-password -refreshToken -otpCode').sort({ createdAt: -1 })
        res.json({ success: true, data: users })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function addStock(req, res) {
    try {
        let stock = await Stock.create(req.body)
        res.status(201).json({ success: true, data: stock })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message, code: error.code })
    }
}

async function updateStock(req, res) {
    try {
        let { symbol } = req.params
        let stock = await Stock.findOneAndUpdate({ symbol: symbol.toUpperCase() }, req.body, { new: true })
        if (!stock) return res.status(404).json({ success: false, error: "Stock not found" })
        res.json({ success: true, data: stock })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function updateStockPrice(req, res) {
    try {
        let { symbol } = req.params
        let { price } = req.body
        if (!price) return res.status(400).json({ success: false, error: "price required" })

        let updated = await StockPrice.findOneAndUpdate(
            { symbol: symbol.toUpperCase() },
            { price, source: 'manual' },
            { upsert: true, new: true }
        )
        res.json({ success: true, data: updated })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function triggerPriceUpdate(req, res) {
    try {
        await updatePrices()
        res.json({ success: true, data: { message: "Price update triggered" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function deactivateStock(req, res) {
    try {
        let { symbol } = req.params
        await Stock.findOneAndUpdate({ symbol: symbol.toUpperCase() }, { isActive: false })
        res.json({ success: true, data: { message: "Stock deactivated" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getStats, getAllUsers, addStock, updateStock, updateStockPrice, triggerPriceUpdate, deactivateStock }
