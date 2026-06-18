const { Transaction } = require("../models/transaction.model")

async function getTransactions(req, res) {
    try {
        let { symbol, type, limit } = req.query
        let filter = { user: req.user.id }
        if (symbol) filter.symbol = symbol.toUpperCase()
        if (type) filter.type = type.toUpperCase()

        let transactions = await Transaction.find(filter)
            .sort({ executedAt: -1 })
            .limit(parseInt(limit) || 100)

        let totalBought = 0, totalSold = 0
        transactions.forEach(t => {
            if (t.type === 'BUY') totalBought += t.totalAmount
            else totalSold += t.totalAmount
        })

        res.json({ success: true, data: { transactions, summary: { totalBought, totalSold, netInvested: totalBought - totalSold } } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function addTransaction(req, res) {
    try {
        let { symbol, type, quantity, price, brokerageFee, notes } = req.body
        if (!symbol || !type || !quantity || !price) {
            return res.status(400).json({ success: false, error: "symbol, type, quantity, price required" })
        }

        let totalAmount = quantity * price
        let transaction = await Transaction.insertOne({
            user: req.user.id,
            symbol: symbol.toUpperCase(),
            type: type.toUpperCase(),
            quantity, price, totalAmount,
            brokerageFee: brokerageFee || 0,
            notes
        })
        res.status(201).json({ success: true, data: transaction })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getTransactions, addTransaction }
