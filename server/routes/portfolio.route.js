const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getPortfolio, addHolding, removeHolding } = require("../controller/portfolio.controller")

router.get("/", auth, getPortfolio)
router.post("/holding", auth, addHolding)
router.delete("/holding/:symbol", auth, removeHolding)

module.exports = { portfolio_router: router }
