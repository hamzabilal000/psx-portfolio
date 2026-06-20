const axios = require("axios")
const { Stock } = require("../models/stock.model")
const { User } = require("../models/user.model")
const { Recommendation } = require("../models/recommendation.model")

async function getRecommendations(req, res) {
    try {
        let user = await User.findById(req.user.id)
        if (!user?.riskProfile?.investorType) {
            return res.status(400).json({
                success: false,
                error: "Please complete your investor profile first (go to Profile page)"
            })
        }

        let stocks = await Stock.find({ isActive: true }).lean()
        if (!stocks.length) {
            return res.status(400).json({ success: false, error: "No stocks in database — run the seed script first" })
        }

        // Convert Mongoose subdoc to plain JSON so Python receives clean keys
        let profile = user.riskProfile.toObject ? user.riskProfile.toObject() : { ...user.riskProfile }
        // suggestedAllocation may be a Mongoose Map — normalise to plain object
        if (profile.suggestedAllocation && typeof profile.suggestedAllocation.toObject === 'function') {
            profile.suggestedAllocation = Object.fromEntries(profile.suggestedAllocation)
        }
        delete profile._id   // not needed by the AI service

        let aiRes
        try {
            aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
                profile,
                stocks
            }, { timeout: 15000 })
        } catch (aiErr) {
            return res.status(503).json({
                success: false,
                error: "AI service is not running. Start it with: cd ai-service && python main.py"
            })
        }

        let result = aiRes.data

        let saved = await Recommendation.create({
            user:                 req.user.id,
            totalInvestment:      profile.investmentAmount,
            expectedReturnMin:    profile.expectedReturnMin,
            expectedReturnMax:    profile.expectedReturnMax,
            expectedAnnualDividend: result.expected_annual_dividend,
            portfolioRiskScore:   result.portfolio_risk_score,
            aiSummary:            result.ai_summary,
            items:                result.recommendations
        })

        res.json({ success: true, data: { recommendation: saved, profile } })
    } catch (error) {
        console.log("[Recommendations]", error.message)
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
