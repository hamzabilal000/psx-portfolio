require('dotenv').config()
const mongoose = require("mongoose")
const { Stock } = require("../models/stock.model")
const { StockPrice } = require("../models/stockprice.model")
const stocks = require("./data/stocks.json")

// Approximate current prices (PKR) — update these or let scheduler fetch live
const seedPrices = {
    MEBL: 284, HBL: 260, UBL: 172, MCB: 240, BAFL: 96, ABL: 134, NBP: 51,
    LUCK: 870, DGKC: 105, CHCC: 108, MLCF: 55, FCCL: 36,
    FFC: 142, EFERT: 98, FATIMA: 72, ENGRO: 315,
    SYS: 620, TRG: 88, NETSOL: 186,
    OGDC: 121, PPL: 95, PSO: 318, MARI: 1870,
    HUBC: 135, KAPCO: 58, KEL: 5,
    SEARL: 190, ABOT: 750,
    NML: 128, NCL: 74, PSMC: 680
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/psx-portfolio")
    console.log("DB connected")

    await Stock.deleteMany({})
    await StockPrice.deleteMany({})

    await Stock.insertMany(stocks)
    console.log(`Seeded ${stocks.length} stocks`)

    let priceEntries = Object.entries(seedPrices).map(([symbol, price]) => ({
        symbol,
        price,
        source: 'seed'
    }))
    await StockPrice.insertMany(priceEntries)
    console.log(`Seeded ${priceEntries.length} stock prices`)

    await mongoose.disconnect()
    console.log("Done!")
}

seed().catch(e => { console.error(e); process.exit(1) })
