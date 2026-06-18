const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getStockNews, getMarketNews } = require("../controller/news.controller")

router.get("/market", auth, getMarketNews)
router.get("/:symbol", auth, getStockNews)

module.exports = { news_router: router }
