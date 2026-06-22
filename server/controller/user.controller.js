const axios = require("axios")
const { User } = require("../models/user.model")

function _isSleeping(err) {
    return err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' ||
           err.code === 'ETIMEDOUT'    || err.code === 'ECONNABORTED' ||
           err.response?.status === 503
}

async function saveRiskProfile(req, res) {
    try {
        let { investmentAmount, timeHorizonYears, riskTolerance, dividendPreference, ageRange, monthlyInvestment, investmentGoal } = req.body

        if (!investmentAmount || !timeHorizonYears || !riskTolerance || !dividendPreference || !ageRange || !investmentGoal) {
            return res.status(400).json({ success: false, error: "All profile fields are required" })
        }

        let aiRes
        try {
            aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/profile`, {
                investmentAmount, timeHorizonYears, riskTolerance, dividendPreference,
                ageRange, monthlyInvestment: monthlyInvestment || 0, investmentGoal
            }, { timeout: 65000 })
        } catch (aiErr) {
            return res.status(503).json({
                success: false,
                sleeping: _isSleeping(aiErr),
                error: _isSleeping(aiErr)
                    ? "The AI service is starting up. Please wait 30–60 seconds and try again."
                    : (aiErr.response?.data?.detail || "AI service unavailable. Please try again.")
            })
        }

        let aiProfile = aiRes.data

        let riskProfile = {
            investmentAmount, timeHorizonYears, riskTolerance, dividendPreference, ageRange,
            monthlyInvestment: monthlyInvestment || 0, investmentGoal,
            investorType:        aiProfile.investor_type,
            expectedReturnMin:   aiProfile.expected_return_min,
            expectedReturnMax:   aiProfile.expected_return_max,
            profileScore:        aiProfile.profile_score,
            suggestedAllocation: aiProfile.suggested_allocation
        }

        let user = await User.findByIdAndUpdate(
            req.user.id,
            { riskProfile },
            { new: true }
        ).select('-password -refreshToken')

        res.json({ success: true, data: { riskProfile: user.riskProfile } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getProfile(req, res) {
    try {
        let user = await User.findById(req.user.id).select('-password -refreshToken -otpCode -emailVerificationToken -passwordResetToken')
        if (!user) return res.status(404).json({ success: false, error: "User not found" })
        res.json({ success: true, data: user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function updateProfile(req, res) {
    try {
        let { name } = req.body
        let user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select('-password -refreshToken')
        res.json({ success: true, data: user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { saveRiskProfile, getProfile, updateProfile }
