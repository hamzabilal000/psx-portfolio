const mongoose = require("mongoose")

let schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User', require: true },
    symbol: { type: String, require: true, uppercase: true },
    condition: { type: String, enum: ['ABOVE', 'BELOW'], require: true },
    targetPrice: { type: Number, require: true },
    isActive: { type: Boolean, default: true },
    triggeredAt: Date
}, { timestamps: true })

schema.index({ user: 1, isActive: 1 })

let Alert = mongoose.model("Alert", schema)
module.exports = { Alert }
