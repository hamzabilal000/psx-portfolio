const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { register, verifyEmail, login, logout, refreshAccessToken, forgotPassword, resetPassword, sendOTP, verifyOTP, getMe } = require("../controller/auth.controller")

router.post("/register", register)
router.post("/verify-email", verifyEmail)
router.post("/login", login)
router.post("/logout", auth, logout)
router.post("/refresh", refreshAccessToken)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/send-otp", auth, sendOTP)
router.post("/verify-otp", auth, verifyOTP)
router.get("/me", auth, getMe)

module.exports = { auth_router: router }
