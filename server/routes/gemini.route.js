const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const {
    status, analyzeStock, portfolioAdvice, chat, compareStocks
} = require("../controller/gemini.controller")

router.get("/status", auth, status)   // no-auth check if AI service is awake
router.post("/analyze-stock", auth, analyzeStock)
router.post("/portfolio-advice", auth, portfolioAdvice)
router.post("/chat", auth, chat)
router.post("/compare", auth, compareStocks)

module.exports = { gemini_router: router }
