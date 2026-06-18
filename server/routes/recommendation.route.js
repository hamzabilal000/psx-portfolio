const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getRecommendations, getRecommendationHistory } = require("../controller/recommendation.controller")

router.get("/", auth, getRecommendations)
router.get("/history", auth, getRecommendationHistory)

module.exports = { recommendation_router: router }
