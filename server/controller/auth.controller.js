require('dotenv').config()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { User } = require("../models/user.model")
const { generateAccessToken, generateRefreshToken, setTokenCookies } = require("../utils/generateToken")
const { generateOTP, generateToken } = require("../utils/generateOTP")
const { sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail } = require("../utils/sendEmail")

async function register(req, res) {
    try {
        let { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: "All fields are required" })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, error: "Password must be at least 8 characters" })
        }

        let existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({ success: false, error: "Email already registered", code: 11000 })
        }

        let hashedPassword = await bcrypt.hash(password, 12)
        let verificationToken = generateToken()
        let verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        let user = await User.insertOne({
            name, email, password: hashedPassword,
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry
        })

        await sendVerificationEmail(email, name, verificationToken)

        res.status(201).json({
            success: true,
            data: { message: "Registration successful. Please verify your email." }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message, code: error.code })
    }
}

async function verifyEmail(req, res) {
    try {
        let { token } = req.body
        if (!token) return res.status(400).json({ success: false, error: "Token required" })

        let user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpiry: { $gt: new Date() }
        })
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid or expired verification link" })
        }

        await User.findByIdAndUpdate(user._id, {
            isVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null
        })

        res.json({ success: true, data: { message: "Email verified successfully. You can now login." } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function login(req, res) {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password required" })
        }

        let user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid credentials" })
        }
        if (!user.isVerified) {
            return res.status(401).json({ success: false, error: "Please verify your email first" })
        }

        let isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" })
        }

        let payload = { id: user._id, email: user.email, role: user.role, name: user.name }
        let accessToken = generateAccessToken(payload)
        let refreshToken = generateRefreshToken(payload)

        await User.findByIdAndUpdate(user._id, { refreshToken })
        setTokenCookies(res, accessToken, refreshToken)

        res.json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role, hasRiskProfile: !!user.riskProfile }
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function logout(req, res) {
    try {
        if (req.user) {
            await User.findByIdAndUpdate(req.user.id, { refreshToken: null })
        }
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        res.json({ success: true, data: { message: "Logged out successfully" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function refreshAccessToken(req, res) {
    try {
        let token = req.cookies.refresh_token
        if (!token) return res.status(401).json({ success: false, error: "No refresh token" })

        let decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        let user = await User.findById(decoded.id)
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ success: false, error: "Invalid refresh token" })
        }

        let payload = { id: user._id, email: user.email, role: user.role, name: user.name }
        let newAccessToken = generateAccessToken(payload)

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        })

        res.json({ success: true, data: { message: "Token refreshed" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function forgotPassword(req, res) {
    try {
        let { email } = req.body
        if (!email) return res.status(400).json({ success: false, error: "Email required" })

        let user = await User.findOne({ email })
        if (!user) {
            // Don't reveal if email exists
            return res.json({ success: true, data: { message: "If this email exists, a reset link has been sent." } })
        }

        let resetToken = generateToken()
        let resetExpiry = new Date(Date.now() + 60 * 60 * 1000)

        await User.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpiry: resetExpiry
        })

        await sendPasswordResetEmail(email, user.name, resetToken)
        res.json({ success: true, data: { message: "Password reset link sent to your email." } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function resetPassword(req, res) {
    try {
        let { token, newPassword } = req.body
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, error: "Token and new password required" })
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, error: "Password must be at least 8 characters" })
        }

        let user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpiry: { $gt: new Date() }
        })
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid or expired reset link" })
        }

        let hashedPassword = await bcrypt.hash(newPassword, 12)
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiry: null,
            refreshToken: null
        })

        res.json({ success: true, data: { message: "Password reset successful. Please login." } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function sendOTP(req, res) {
    try {
        let { purpose } = req.body
        let userId = req.user.id

        let otp = generateOTP()
        let otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

        let user = await User.findById(userId)
        await User.findByIdAndUpdate(userId, {
            otpCode: otp,
            otpExpiry,
            otpPurpose: purpose || '2FA'
        })

        await sendOTPEmail(user.email, user.name, otp, purpose || 'Two-Factor Authentication')
        res.json({ success: true, data: { message: "OTP sent to your email" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function verifyOTP(req, res) {
    try {
        let { otp } = req.body
        let userId = req.user.id

        let user = await User.findById(userId)
        if (!user.otpCode || user.otpCode !== otp) {
            return res.status(400).json({ success: false, error: "Invalid OTP" })
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, error: "OTP expired" })
        }

        await User.findByIdAndUpdate(userId, { otpCode: null, otpExpiry: null, otpPurpose: null })
        res.json({ success: true, data: { message: "OTP verified successfully" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getMe(req, res) {
    try {
        let user = await User.findById(req.user.id).select('-password -refreshToken -otpCode -emailVerificationToken -passwordResetToken')
        if (!user) return res.status(404).json({ success: false, error: "User not found" })
        res.json({ success: true, data: user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { register, verifyEmail, login, logout, refreshAccessToken, forgotPassword, resetPassword, sendOTP, verifyOTP, getMe }
