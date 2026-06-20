const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const {
    analyzeStock, portfolioAdvice, chat, compareStocks
} = require("../controller/gemini.controller")

router.post("/analyze-stock", auth, analyzeStock)
router.post("/portfolio-advice", auth, portfolioAdvice)
router.post("/chat", auth, chat)
router.post("/compare", auth, compareStocks)

module.exports = { gemini_router: router }
