const mongoose = require("mongoose")

let schema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User', require: true },
    symbol: { type: String, require: true, uppercase: true }
}, { timestamps: true })

schema.index({ user: 1, symbol: 1 }, { unique: true })

let Watchlist = mongoose.model("Watchlist", schema)
module.exports = { Watchlist }
