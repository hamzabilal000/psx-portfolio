const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { getAlerts, createAlert, deleteAlert, getNotifications, markNotificationRead } = require("../controller/alert.controller")

router.get("/", auth, getAlerts)
router.post("/", auth, createAlert)
router.delete("/:id", auth, deleteAlert)
router.get("/notifications", auth, getNotifications)
router.put("/notifications/:id/read", auth, markNotificationRead)

module.exports = { alert_router: router }
