const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { adminCheck } = require("../middleware/adminCheck")
const { getStats, getAllUsers, addStock, updateStock, updateStockPrice, triggerPriceUpdate, deactivateStock } = require("../controller/admin.controller")

router.get("/stats", auth, adminCheck, getStats)
router.get("/users", auth, adminCheck, getAllUsers)
router.post("/stocks", auth, adminCheck, addStock)
router.put("/stocks/:symbol", auth, adminCheck, updateStock)
router.put("/stocks/:symbol/price", auth, adminCheck, updateStockPrice)
router.post("/prices/update", auth, adminCheck, triggerPriceUpdate)
router.delete("/stocks/:symbol", auth, adminCheck, deactivateStock)

module.exports = { admin_router: router }
