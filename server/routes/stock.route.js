const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getAllStocks, getStockBySymbol, getStockPrice, getAllPrices, compareStocks, getSectors } = require("../controller/stock.controller")

router.get("/", auth, getAllStocks)
router.get("/sectors", auth, getSectors)
router.get("/prices", auth, getAllPrices)
router.get("/compare", auth, compareStocks)
router.get("/:symbol", auth, getStockBySymbol)
router.get("/:symbol/price", auth, getStockPrice)

module.exports = { stock_router: router }
