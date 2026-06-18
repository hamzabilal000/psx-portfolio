const axios = require("axios")
const { Stock } = require("../models/stock.model")
const { User } = require("../models/user.model")
const { Recommendation } = require("../models/recommendation.model")

async function getRecommendations(req, res) {
    try {
        let user = await User.findById(req.user.id)
        if (!user.riskProfile) {
            return res.status(400).json({ success: false, error: "Please complete your risk profile first" })
        }

        let stocks = await Stock.find({ isActive: true })
        let stocksData = stocks.map(s => s.toObject())

        let aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
            profile: user.riskProfile,
            stocks: stocksData
        })

        let result = aiRes.data

        // Save recommendation to DB
        let saved = await Recommendation.insertOne({
            user: req.user.id,
            totalInvestment: user.riskProfile.investmentAmount,
            expectedReturnMin: user.riskProfile.expectedReturnMin,
            expectedReturnMax: user.riskProfile.expectedReturnMax,
            expectedAnnualDividend: result.expected_annual_dividend,
            portfolioRiskScore: result.portfolio_risk_score,
            aiSummary: result.ai_summary,
            items: result.recommendations
        })

        res.json({ success: true, data: { recommendation: saved, profile: user.riskProfile } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getRecommendationHistory(req, res) {
    try {
        let history = await Recommendation.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10)
        res.json({ success: true, data: history })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getRecommendations, getRecommendationHistory }
