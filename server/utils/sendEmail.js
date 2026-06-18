require('dotenv').config()
const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

async function sendVerificationEmail(email, name, token) {
    let link = `${process.env.CLIENT_URL}/verify-email?token=${token}`
    await transporter.sendMail({
        from: `"PSX Portfolio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email - PSX Portfolio",
        html: `
            <h2>Hello ${name}!</h2>
            <p>Please verify your email to activate your PSX Portfolio account.</p>
            <a href="${link}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
                Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
        `
    })
}

async function sendPasswordResetEmail(email, name, token) {
    let link = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    await transporter.sendMail({
        from: `"PSX Portfolio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password - PSX Portfolio",
        html: `
            <h2>Hello ${name}!</h2>
            <p>You requested a password reset.</p>
            <a href="${link}" style="background:#dc2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
                Reset Password
            </a>
            <p>This link expires in 1 hour. Ignore if you did not request this.</p>
        `
    })
}

async function sendOTPEmail(email, name, otp, purpose) {
    await transporter.sendMail({
        from: `"PSX Portfolio" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your OTP - PSX Portfolio`,
        html: `
            <h2>Hello ${name}!</h2>
            <p>Your OTP for <strong>${purpose}</strong>:</p>
            <h1 style="font-size:48px;letter-spacing:8px;color:#16a34a;">${otp}</h1>
            <p>This OTP expires in 5 minutes. Do not share it with anyone.</p>
        `
    })
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail }
