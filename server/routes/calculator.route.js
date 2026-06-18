const express = require("express")
const router = express.Router()
const { cagrCalc, roiCalc, futureValueCalc, dividendCalc, goalCalc, realReturnCalc, sharpeCalc, portfolioRiskCalc } = require("../controller/calculator.controller")

router.post("/cagr", cagrCalc)
router.post("/roi", roiCalc)
router.post("/future-value", futureValueCalc)
router.post("/dividend", dividendCalc)
router.post("/goal", goalCalc)
router.post("/real-return", realReturnCalc)
router.post("/sharpe", sharpeCalc)
router.post("/portfolio-risk", portfolioRiskCalc)

module.exports = { calculator_router: router }
