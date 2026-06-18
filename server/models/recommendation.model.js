const mongoose = require("mongoose")

let itemSchema = mongoose.Schema({
    symbol: String,
    name: String,
    sector: String,
    allocationPct: Number,
    amountPkr: Number,
    matchScore: Number,
    expectedReturn: Number,
    dividendYield: Number,
    riskLevel: String,
    reason: String
}, { _id: false })

let schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User', require: true },
    modelVersion: { type: String, default: '1.0' },
    totalInvestment: Number,
    expectedReturnMin: Number,
    expectedReturnMax: Number,
    expectedAnnualDividend: Number,
    portfolioRiskScore: Number,
    aiSummary: String,
    items: [itemSchema]
}, { timestamps: true })

schema.index({ user: 1, createdAt: -1 })

let Recommendation = mongoose.model("Recommendation", schema)
module.exports = { Recommendation }
