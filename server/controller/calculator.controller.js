function cagrCalc(req, res) {
    try {
        let { initial, final: finalVal, years } = req.body
        if (!initial || !finalVal || !years || years <= 0 || initial <= 0) {
            return res.status(400).json({ success: false, error: "Invalid inputs" })
        }
        let cagr = (Math.pow(finalVal / initial, 1 / years) - 1) * 100
        let growthMultiple = finalVal / initial
        res.json({ success: true, data: { cagrPct: parseFloat(cagr.toFixed(2)), growthMultiple: parseFloat(growthMultiple.toFixed(2)), years } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function roiCalc(req, res) {
    try {
        let { invested, currentValue } = req.body
        if (!invested || !currentValue) return res.status(400).json({ success: false, error: "invested and currentValue required" })
        let roi = ((currentValue - invested) / invested) * 100
        let profitLoss = currentValue - invested
        res.json({ success: true, data: { roiPct: parseFloat(roi.toFixed(2)), profitLossPkr: parseFloat(profitLoss.toFixed(2)) } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function futureValueCalc(req, res) {
    try {
        let { initialInvestment, monthlyContribution, annualReturnPct, years } = req.body
        if (!annualReturnPct || !years) return res.status(400).json({ success: false, error: "annualReturnPct and years required" })

        let r = annualReturnPct / 100 / 12
        let n = years * 12
        let init = initialInvestment || 0
        let monthly = monthlyContribution || 0

        let lumpSumFV = init * Math.pow(1 + r, n)
        let sipFV = r > 0
            ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
            : monthly * n

        let totalFV = lumpSumFV + sipFV
        let totalInvested = init + (monthly * n)
        let totalProfit = totalFV - totalInvested

        // Yearly breakdown
        let yearlyBreakdown = []
        for (let y = 1; y <= years; y++) {
            let ny = y * 12
            let lsFV = init * Math.pow(1 + r, ny)
            let sipY = r > 0 ? monthly * ((Math.pow(1 + r, ny) - 1) / r) * (1 + r) : monthly * ny
            yearlyBreakdown.push({ year: y, value: parseFloat((lsFV + sipY).toFixed(0)) })
        }

        res.json({
            success: true,
            data: {
                futureValue: parseFloat(totalFV.toFixed(2)),
                totalInvested: parseFloat(totalInvested.toFixed(2)),
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                returnMultiple: parseFloat((totalFV / (totalInvested || 1)).toFixed(2)),
                yearlyBreakdown
            }
        })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function dividendCalc(req, res) {
    try {
        let { investment, yieldPct, years, growthRatePct } = req.body
        if (!investment || !yieldPct || !years) return res.status(400).json({ success: false, error: "investment, yieldPct, years required" })
        let growth = growthRatePct || 5.0
        let annualDiv = investment * (yieldPct / 100)
        let totalDiv = 0
        let yearly = []
        for (let y = 1; y <= years; y++) {
            let div = annualDiv * Math.pow(1 + growth / 100, y - 1)
            totalDiv += div
            yearly.push({ year: y, dividend: parseFloat(div.toFixed(2)) })
        }
        res.json({ success: true, data: { year1Dividend: parseFloat(annualDiv.toFixed(2)), [`year${years}Dividend`]: parseFloat(yearly[years - 1].dividend.toFixed(2)), totalDividend: parseFloat(totalDiv.toFixed(2)), yearlyBreakdown: yearly } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function goalCalc(req, res) {
    try {
        let { targetAmount, years, annualReturnPct, currentSavings } = req.body
        if (!targetAmount || !years || !annualReturnPct) return res.status(400).json({ success: false, error: "targetAmount, years, annualReturnPct required" })
        let r = annualReturnPct / 100 / 12
        let n = years * 12
        let savings = currentSavings || 0
        let savingsFV = savings * Math.pow(1 + r, n)
        let remaining = targetAmount - savingsFV
        if (remaining <= 0) return res.json({ success: true, data: { monthlyRequired: 0, message: "Already on track!" } })
        let pmt = r > 0 ? remaining * r / (Math.pow(1 + r, n) - 1) : remaining / n
        res.json({ success: true, data: { monthlyRequired: parseFloat(pmt.toFixed(2)), totalContributions: parseFloat((pmt * n).toFixed(2)), targetAmount } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function realReturnCalc(req, res) {
    try {
        let { nominalReturnPct, inflationPct } = req.body
        if (!nominalReturnPct) return res.status(400).json({ success: false, error: "nominalReturnPct required" })
        let inflation = inflationPct || 12.0
        let real = ((1 + nominalReturnPct / 100) / (1 + inflation / 100) - 1) * 100
        res.json({ success: true, data: { realReturnPct: parseFloat(real.toFixed(2)), nominalReturnPct, inflationPct: inflation } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function sharpeCalc(req, res) {
    try {
        let { portfolioReturnPct, riskFreeRatePct, portfolioStdDevPct } = req.body
        if (!portfolioReturnPct || !riskFreeRatePct || !portfolioStdDevPct) {
            return res.status(400).json({ success: false, error: "All three fields required" })
        }
        let sharpe = (portfolioReturnPct - riskFreeRatePct) / portfolioStdDevPct
        let interpretation = sharpe > 2 ? "Excellent" : sharpe > 1 ? "Good" : sharpe > 0 ? "Acceptable" : "Poor"
        res.json({ success: true, data: { sharpeRatio: parseFloat(sharpe.toFixed(3)), interpretation } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

function portfolioRiskCalc(req, res) {
    try {
        let { holdings } = req.body
        if (!holdings || !Array.isArray(holdings)) return res.status(400).json({ success: false, error: "holdings array required" })

        let weightedVol = holdings.reduce((sum, h) => sum + (h.allocationPct / 100 * (h.volatilityScore || 50)), 0)
        let hhi = holdings.reduce((sum, h) => sum + Math.pow(h.allocationPct / 100, 2), 0)
        let concentrationPenalty = hhi * 20

        let sectors = {}
        holdings.forEach(h => { sectors[h.sector] = (sectors[h.sector] || 0) + h.allocationPct })
        let maxSectorPct = Math.max(...Object.values(sectors), 0)
        let sectorPenalty = Math.max(0, (maxSectorPct - 40) * 0.3)

        let totalRisk = Math.min(100, weightedVol + concentrationPenalty + sectorPenalty)
        let label = totalRisk < 35 ? "Low" : totalRisk < 65 ? "Medium" : "High"

        res.json({ success: true, data: { riskScore: Math.round(totalRisk), riskLabel: label, breakdown: { weightedVolatility: parseFloat(weightedVol.toFixed(1)), concentrationPenalty: parseFloat(concentrationPenalty.toFixed(1)), sectorPenalty: parseFloat(sectorPenalty.toFixed(1)) } } })
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}

module.exports = { cagrCalc, roiCalc, futureValueCalc, dividendCalc, goalCalc, realReturnCalc, sharpeCalc, portfolioRiskCalc }
