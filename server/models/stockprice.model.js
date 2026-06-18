const mongoose = require("mongoose")

let schema = mongoose.Schema({
    symbol: { type: String, require: true, unique: true, uppercase: true },
    price: { type: Number, require: true },
    open: Number,
    high: Number,
    low: Number,
    volume: Number,
    changeAmt: Number,
    changePct: Number,
    source: { type: String, default: 'manual' }
}, { timestamps: true })

let StockPrice = mongoose.model("StockPrice", schema)
module.exports = { StockPrice }
