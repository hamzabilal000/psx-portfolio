const mongoose = require("mongoose")

let schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User', require: true },
    symbol: { type: String, require: true, uppercase: true },
    type: { type: String, enum: ['BUY', 'SELL'], require: true },
    quantity: { type: Number, require: true },
    price: { type: Number, require: true },
    totalAmount: { type: Number, require: true },
    brokerageFee: { type: Number, default: 0 },
    notes: String,
    executedAt: { type: Date, default: Date.now }
}, { timestamps: true })

schema.index({ user: 1, executedAt: -1 })

let Transaction = mongoose.model("Transaction", schema)
module.exports = { Transaction }
