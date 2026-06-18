const mongoose = require("mongoose")

let holdingSchema = mongoose.Schema({
    symbol: { type: String, require: true, uppercase: true },
    quantity: { type: Number, require: true },
    avgBuyPrice: { type: Number, require: true },
    totalInvested: { type: Number, require: true }
}, { timestamps: true })

let schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User', require: true, unique: true },
    name: { type: String, default: 'My Portfolio' },
    holdings: [holdingSchema]
}, { timestamps: true })

let Portfolio = mongoose.model("Portfolio", schema)
module.exports = { Portfolio }
