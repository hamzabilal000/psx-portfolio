const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getTransactions, addTransaction } = require("../controller/transaction.controller")

router.get("/", auth, getTransactions)
router.post("/", auth, addTransaction)

module.exports = { transaction_router: router }
