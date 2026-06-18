const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require("../controller/watchlist.controller")

router.get("/", auth, getWatchlist)
router.post("/", auth, addToWatchlist)
router.delete("/:symbol", auth, removeFromWatchlist)

module.exports = { watchlist_router: router }
