const mongoose = require("mongoose")

let schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User', require: true },
    type: { type: String, require: true },
    title: { type: String, require: true },
    message: { type: String, require: true },
    isRead: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true })

schema.index({ user: 1, isRead: 1 })

let Notification = mongoose.model("Notification", schema)
module.exports = { Notification }
