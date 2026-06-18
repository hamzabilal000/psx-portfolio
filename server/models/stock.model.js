const mongoose = require("mongoose")

let schema = mongoose.Schema({
    symbol: { type: String, require: true, unique: true, uppercase: true },
    name: { type: String, require: true },
    sector: { type: String, require: true },
    industry: String,
    yahooTicker: String,
    marketCapBnPkr: Number,
    outstandingSharesMn: Number,
    freeFloatPct: Number,
    avgPeRatio: Number,
    avgPbRatio: Number,
    avgDividendYield: Number,
    payoutRatio: Number,
    avgRoe: Number,
    avgRoa: Number,
    debtToEquity: Number,
    beta: Number,
    volatilityScore: Number,
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    avgAnnualReturn5yr: Number,
    revenueGrowth3yr: Number,
    earningsGrowth3yr: Number,
    dividendGrowth3yr: Number,
    maxDrawdown: Number,
    suitableRisk: [String],
    suitableGoals: [String],
    minHorizonYears: { type: Number, default: 1 },
    dividendPreference: String,
    description: String,
    strengths: [String],
    weaknesses: [String],
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

schema.index({ sector: 1 })
schema.index({ riskLevel: 1 })

let Stock = mongoose.model("Stock", schema)
module.exports = { Stock }
