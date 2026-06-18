const { Alert } = require("../models/alert.model")
const { Notification } = require("../models/notification.model")
const { Stock } = require("../models/stock.model")

async function getAlerts(req, res) {
    try {
        let alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 })
        res.json({ success: true, data: alerts })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function createAlert(req, res) {
    try {
        let { symbol, condition, targetPrice } = req.body
        if (!symbol || !condition || !targetPrice) {
            return res.status(400).json({ success: false, error: "symbol, condition, targetPrice required" })
        }

        let stock = await Stock.findOne({ symbol: symbol.toUpperCase() })
        if (!stock) return res.status(404).json({ success: false, error: "Stock not found" })

        let alert = await Alert.insertOne({
            user: req.user.id,
            symbol: symbol.toUpperCase(),
            condition,
            targetPrice
        })
        res.status(201).json({ success: true, data: alert })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function deleteAlert(req, res) {
    try {
        let { id } = req.params
        await Alert.findOneAndDelete({ _id: id, user: req.user.id })
        res.json({ success: true, data: { message: "Alert deleted" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function getNotifications(req, res) {
    try {
        let notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50)
        res.json({ success: true, data: notifications })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

async function markNotificationRead(req, res) {
    try {
        let { id } = req.params
        await Notification.findOneAndUpdate({ _id: id, user: req.user.id }, { isRead: true })
        res.json({ success: true, data: { message: "Marked as read" } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error.message })
    }
}

module.exports = { getAlerts, createAlert, deleteAlert, getNotifications, markNotificationRead }
