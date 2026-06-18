const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { saveRiskProfile, getProfile, updateProfile } = require("../controller/user.controller")

router.get("/profile", auth, getProfile)
router.put("/profile", auth, updateProfile)
router.post("/risk-profile", auth, saveRiskProfile)

module.exports = { user_router: router }
