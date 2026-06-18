require('dotenv').config()
const jwt = require("jsonwebtoken")

function auth(req, res, next) {
    let token = req.cookies.access_token
    if (!token) {
        return res.status(401).json({ success: false, error: "Not authenticated" })
    }
    try {
        let user = jwt.verify(token, process.env.JWT_SECRET)
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ success: false, error: "Invalid or expired token" })
    }
}

module.exports = { auth }
